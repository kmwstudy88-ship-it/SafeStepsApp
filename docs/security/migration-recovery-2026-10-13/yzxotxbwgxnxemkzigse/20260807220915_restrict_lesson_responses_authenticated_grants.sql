-- RECOVERED READ-ONLY from yzxotxbwgxnxemkzigse migration history; review before replay.
revoke all on table public.lesson_responses from authenticated;
grant select, insert, update, delete on table public.lesson_responses to authenticated;;

