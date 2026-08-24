-- Pin search paths for small validation/immutability functions.
-- Their bodies use only arguments, operators, and PL/pgSQL control flow, so
-- an empty search path is safe and prevents session-controlled name resolution.

-- Some linked projects already had these functions when this hardening
-- migration was created, while a clean local replay does not. Harden only
-- definitions that are present; later baseline migrations create the
-- immutable-record trigger functions required by the reconstructed schema.
do $migration$
begin
  if to_regprocedure('public.prevent_video_export_record_mutation()') is not null then
    execute format('alter function public.prevent_video_export_record_mutation() set search_path = %L', '');
  end if;

  if to_regprocedure('public.prevent_video_report_snapshot_mutation()') is not null then
    execute format('alter function public.prevent_video_report_snapshot_mutation() set search_path = %L', '');
  end if;

  if to_regprocedure('public.sanitize_video_notification_text(text)') is not null then
    execute format('alter function public.sanitize_video_notification_text(text) set search_path = %L', '');
  end if;

  if to_regprocedure('public.validate_vimeo_embed_url(text)') is not null then
    execute format('alter function public.validate_vimeo_embed_url(text) set search_path = %L', '');
  end if;
end
$migration$;
