-- Pin search paths for small validation/immutability functions.
-- Their bodies use only arguments, operators, and PL/pgSQL control flow, so
-- an empty search path is safe and prevents session-controlled name resolution.

alter function public.prevent_video_export_record_mutation()
  set search_path = '';

alter function public.prevent_video_report_snapshot_mutation()
  set search_path = '';

alter function public.sanitize_video_notification_text(text)
  set search_path = '';

alter function public.validate_vimeo_embed_url(text)
  set search_path = '';
