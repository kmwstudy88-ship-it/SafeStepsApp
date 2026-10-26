do $$
begin
  if to_regclass('public.ai_child_feedback_controls') is not null
     and to_regclass('public.children') is not null
     and not exists (
       select 1
       from pg_constraint
       where conrelid = 'public.ai_child_feedback_controls'::regclass
         and conname = 'ai_child_feedback_controls_child_id_fkey'
     ) then
    alter table public.ai_child_feedback_controls
      add constraint ai_child_feedback_controls_child_id_fkey
      foreign key (child_id)
      references public.children(id)
      on delete set null;
  end if;
end
$$;
