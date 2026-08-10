-- Keep the raw cross-user report builder internal.
-- Public report RPCs perform self/reviewer authorization before invoking it.
-- Clean rebuilds may not contain this legacy production-only function.

do $migration$
begin
  if to_regprocedure(
    'public.build_video_progress_report_data(uuid,boolean)'
  ) is not null then
    revoke execute on function public.build_video_progress_report_data(
      uuid,
      boolean
    ) from authenticated;
  end if;
end
$migration$;
