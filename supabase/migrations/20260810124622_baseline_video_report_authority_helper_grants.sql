revoke all on function public.has_active_video_report_authority(uuid,uuid,text) from public, anon;
revoke all on function public.can_access_video_report(uuid,text) from public, anon;
grant execute on function public.has_active_video_report_authority(uuid,uuid,text) to authenticated, service_role;
grant execute on function public.can_access_video_report(uuid,text) to authenticated, service_role;