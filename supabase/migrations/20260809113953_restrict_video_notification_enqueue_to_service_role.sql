-- Prevent signed-in clients from queuing notifications for arbitrary users.
-- Notification delivery remains available to trusted backend code through service_role.

revoke execute on function public.enqueue_video_notification(
  uuid,
  text,
  text,
  text,
  text
) from authenticated;
