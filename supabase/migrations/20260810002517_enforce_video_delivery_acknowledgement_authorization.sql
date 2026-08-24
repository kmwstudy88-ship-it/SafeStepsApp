-- Only an internal recipient or video super-admin may acknowledge a delivery.
-- Require the authorised delivery update to succeed before recording an acknowledgement.

-- These production tables predated the committed schema baseline but were omitted
-- from the historical migration chain. Define their columns here because the
-- acknowledgement function below uses the acknowledgement table as its return
-- type. Constraints that depend on later baseline tables are added in the
-- corresponding baseline migrations.
create table if not exists public.video_report_deliveries (
  id uuid not null default gen_random_uuid(),
  snapshot_id uuid not null,
  export_file_id uuid,
  recipient_type text not null,
  internal_recipient_user_id uuid,
  external_recipient_label text,
  external_recipient_contact_hash text,
  delivery_purpose_code text not null,
  delivery_status text not null default 'created'::text,
  delivery_token_hash text not null,
  token_expires_at timestamp with time zone not null,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  revoked_at timestamp with time zone,
  revocation_reason text,
  opaque_delivery_token_hash text,
  verification_code_hash text,
  verification_attempts integer not null default 0,
  max_verification_attempts integer not null default 5,
  download_count integer not null default 0,
  max_downloads integer not null default 3,
  verified_at timestamp with time zone
);

create table if not exists public.video_report_delivery_acknowledgements (
  id uuid not null default gen_random_uuid(),
  delivery_id uuid not null,
  acknowledged_by_label text not null,
  acknowledgement_text text not null,
  acknowledged_at timestamp with time zone not null default now()
);

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
