begin;
create or replace function public.persist_personal_ai_chat_turn(
  p_user_id uuid,
  p_conversation_id uuid,
  p_user_message text,
  p_assistant_message text,
  p_flow_id text,
  p_state text,
  p_risk_level text,
  p_intent_label text,
  p_routing_confidence numeric,
  p_escalation_type text,
  p_signal_ids text[],
  p_completion_state text,
  p_store_conversation boolean,
  p_store_note boolean,
  p_request_id text
) returns jsonb
language plpgsql
security invoker
set search_path=pg_catalog,public
as $$
declare
  v_conversation_id uuid;
  v_user_message_id uuid;
  v_assistant_message_id uuid;
  v_note_id uuid;
  v_safety_event_id uuid;
  v_user_content text;
begin
  if p_user_id is null then raise exception 'User is required'; end if;
  if p_risk_level not in ('low','medium','high','critical') then raise exception 'Invalid risk level'; end if;
  if p_state not in ('start','reflect','clarify','safety_check','support','escalate','document','close') then raise exception 'Invalid state'; end if;
  if not p_store_conversation then
    return jsonb_build_object('stored',false,'conversationId',null);
  end if;
  if char_length(coalesce(p_user_message,'')) not between 1 and 1200 or char_length(coalesce(p_assistant_message,'')) not between 1 and 2000 then raise exception 'Invalid message length'; end if;

  if not exists(select 1 from public.personal_ai_consents where user_id=p_user_id and purpose='conversation_storage' and revoked_at is null and (expires_at is null or expires_at>now())) then
    insert into public.personal_ai_consents(user_id,purpose,policy_version) values(p_user_id,'conversation_storage','1.0');
  end if;

  if p_conversation_id is null then
    insert into public.personal_ai_conversations(user_id,current_flow_id,current_state,risk_level,status,title)
    values(p_user_id,p_flow_id,p_state,p_risk_level,case when p_risk_level='critical' then 'escalated' else 'active' end,'SafeSteps Personal AI Support')
    returning id into v_conversation_id;
  else
    select id into v_conversation_id from public.personal_ai_conversations where id=p_conversation_id and user_id=p_user_id for update;
    if v_conversation_id is null then raise exception 'Conversation not found or not owned by user'; end if;
    update public.personal_ai_conversations set current_flow_id=p_flow_id,current_state=p_state,risk_level=p_risk_level,status=case when p_risk_level='critical' then 'escalated' else status end,updated_at=now() where id=v_conversation_id;
  end if;

  v_user_content := case when p_risk_level in ('high','critical') then '[Safety-sensitive disclosure withheld from ordinary message storage]' else p_user_message end;
  insert into public.personal_ai_messages(conversation_id,sender,content,risk_level,intent_label,routing_confidence)
  values(v_conversation_id,'user',v_user_content,p_risk_level,p_intent_label,p_routing_confidence) returning id into v_user_message_id;
  insert into public.personal_ai_messages(conversation_id,sender,content,risk_level,intent_label,routing_confidence)
  values(v_conversation_id,'assistant',p_assistant_message,p_risk_level,p_intent_label,p_routing_confidence) returning id into v_assistant_message_id;

  if p_store_note then
    insert into public.personal_ai_interaction_notes(conversation_id,flow_id,risk_level,safety_check_result,actions_taken,resources_offered,escalation_status,completion_state)
    values(v_conversation_id,p_flow_id,p_risk_level,case when p_risk_level='critical' then 'Immediate safety check shown' else null end,
      case when p_risk_level in ('high','critical') then array['Minimum-necessary safety guidance shown'] else array['Support response shown'] end,
      case when p_risk_level='critical' then array['Real-world urgent support'] else '{}'
      end,p_escalation_type,p_completion_state) returning id into v_note_id;
  end if;

  if p_risk_level in ('high','critical') then
    insert into public.personal_ai_safety_events(conversation_id,risk_level,escalation_type,immediate_risk,signal_ids,action_shown,human_handoff_offered)
    values(v_conversation_id,p_risk_level,p_escalation_type,p_risk_level='critical',coalesce(p_signal_ids,'{}'),left(p_assistant_message,1000),true)
    returning id into v_safety_event_id;
  end if;

  insert into public.personal_ai_audit_logs(user_id,actor_id,action,target_type,target_id,metadata)
  values(p_user_id,p_user_id,'chat_turn_persisted','personal_ai_conversation',v_conversation_id,
    jsonb_build_object('requestId',p_request_id,'riskLevel',p_risk_level,'flowId',p_flow_id,'userMessageRedacted',p_risk_level in ('high','critical'),'noteCreated',v_note_id is not null,'safetyEventCreated',v_safety_event_id is not null));

  return jsonb_build_object('stored',true,'conversationId',v_conversation_id,'userMessageId',v_user_message_id,'assistantMessageId',v_assistant_message_id,'noteId',v_note_id,'safetyEventId',v_safety_event_id);
end;
$$;
revoke all on function public.persist_personal_ai_chat_turn(uuid,uuid,text,text,text,text,text,text,numeric,text,text[],text,boolean,boolean,text) from public,anon,authenticated;
grant execute on function public.persist_personal_ai_chat_turn(uuid,uuid,text,text,text,text,text,text,numeric,text,text[],text,boolean,boolean,text) to service_role;
comment on function public.persist_personal_ai_chat_turn is 'Backend-only atomic persistence. High/critical user disclosures are replaced with a non-verbatim marker before storage.';
commit;
