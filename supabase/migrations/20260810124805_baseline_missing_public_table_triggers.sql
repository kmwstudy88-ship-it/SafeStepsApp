-- These immutable-record functions existed on the linked database but were
-- missing from the schema-only baseline. Define them explicitly so a clean
-- replay preserves the same fail-closed mutation boundary.
create or replace function public.prevent_video_report_snapshot_mutation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  raise exception 'Video progress report snapshots are immutable';
end;
$function$;

create or replace function public.prevent_video_export_record_mutation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  raise exception 'Video report export records are immutable';
end;
$function$;

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON messaging_thread_summaries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER video_progress_report_snapshots_no_update BEFORE DELETE OR UPDATE ON video_progress_report_snapshots FOR EACH ROW EXECUTE FUNCTION prevent_video_report_snapshot_mutation();
CREATE TRIGGER video_report_export_audit_no_update BEFORE DELETE OR UPDATE ON video_report_export_audit_events FOR EACH ROW EXECUTE FUNCTION prevent_video_export_record_mutation();
CREATE TRIGGER video_report_export_files_no_update BEFORE DELETE OR UPDATE ON video_report_export_files FOR EACH ROW EXECUTE FUNCTION prevent_video_export_record_mutation();
