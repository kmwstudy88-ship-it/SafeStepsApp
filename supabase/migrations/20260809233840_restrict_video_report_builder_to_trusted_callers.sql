-- Keep the raw cross-user report builder internal.
-- Public report RPCs perform self/reviewer authorization before invoking it.

revoke execute on function public.build_video_progress_report_data(
  uuid,
  boolean
) from authenticated;
