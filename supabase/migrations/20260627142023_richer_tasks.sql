alter table public.user_tasks
add column if not exists priority text not null default 'medium'
check (priority in ('low', 'medium', 'high'));

alter table public.user_tasks
add column if not exists related_lesson_id text;

alter table public.user_tasks
add column if not exists evidence_required boolean not null default false;

alter table public.user_tasks
add column if not exists category text not null default 'general';
