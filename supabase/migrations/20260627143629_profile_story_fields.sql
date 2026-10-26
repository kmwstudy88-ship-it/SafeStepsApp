alter table public.profiles
add column if not exists story_goal text not null default '';

alter table public.profiles
add column if not exists strengths text not null default '';

alter table public.profiles
add column if not exists support_notes text not null default '';
