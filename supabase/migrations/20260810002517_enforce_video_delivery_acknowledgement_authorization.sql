-- Only an internal recipient or video super-admin may acknowledge a delivery.
-- Require the authorised delivery update to succeed before recording an acknowledgement.

create or replace function public.acknowledge_video_report_delivery(
  target_delivery_id uuid,
  acknowledgement_text text
)
returns public.video_report_delivery_acknowledgements
language plpgsql
security definer
set search_path = ''
as $function$
declare
  acknowledgement_row public.video_report_delivery_acknowledgements;
  authorised_delivery_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(pg_catalog.btrim(acknowledgement_text), '') = '' then
    raise exception 'Acknowledgement text is required';
  end if;

  update public.video_report_deliveries
  set delivery_status = 'acknowledged',
      updated_at = pg_catalog.now()
  where id = target_delivery_id
    and (
      internal_recipient_user_id = auth.uid()
      or public.is_video_admin(array['super_admin'])
    )
  returning id into authorised_delivery_id;

  if authorised_delivery_id is null then
    raise exception 'Delivery not found or not authorised';
  end if;

  insert into public.video_report_delivery_acknowledgements (
    delivery_id,
    acknowledged_by_label,
    acknowledgement_text
  )
  values (
    authorised_delivery_id,
    auth.uid()::text,
    acknowledgement_text
  )
  returning * into acknowledgement_row;

  return acknowledgement_row;
end;
$function$;
