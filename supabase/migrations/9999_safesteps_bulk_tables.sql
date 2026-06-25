-- SafeSteps bulk table creation

-- 1. children
create table if not exists public.children (
    id uuid primary key default gen_random_uuid(),
    family_id uuid not null,
    first_name text not null,
    last_name text,
    date_of_birth date,
    created_at timestamptz default now()
);

-- 2. programs
create table if not exists public.programs (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    age_min int,
    age_max int,
    created_at timestamptz default now()
);

-- 3. weeks
create table if not exists public.weeks (
    id uuid primary key default gen_random_uuid(),
    program_id uuid not null,
    week_number int not null,
    title text,
    created_at timestamptz default now()
);

-- 4. lessons
create table if not exists public.lessons (
    id uuid primary key default gen_random_uuid(),
    week_id uuid not null,
    lesson_number int not null,
    title text not null,
    objective text,
    created_at timestamptz default now()
);

-- 5. activities
create table if not exists public.activities (
    id uuid primary key default gen_random_uuid(),
    lesson_id uuid not null,
    activity_number int not null,
    title text not null,
    instructions text,
    created_at timestamptz default now()
);

-- 6. assessments
create table if not exists public.assessments (
    id uuid primary key default gen_random_uuid(),
    program_id uuid not null,
    name text not null,
    description text,
    created_at timestamptz default now()
);

-- 7. assessment_questions
create table if not exists public.assessment_questions (
    id uuid primary key default gen_random_uuid(),
    assessment_id uuid not null,
    question_number int not null,
    question_text text not null,
    question_type text not null, -- e.g. 'scale', 'yes_no', 'text'
    created_at timestamptz default now()
);

-- 8. assessment_responses
create table if not exists public.assessment_responses (
    id uuid primary key default gen_random_uuid(),
    assessment_id uuid not null,
    child_id uuid not null,
    question_id uuid not null,
    response_value text,
    responded_at timestamptz default now()
);

-- 9. evidence
create table if not exists public.evidence (
    id uuid primary key default gen_random_uuid(),
    child_id uuid not null,
    activity_id uuid,
    note text,
    media_url text,
    created_at timestamptz default now()
);

-- 10. progress
create table if not exists public.progress (
    id uuid primary key default gen_random_uuid(),
    child_id uuid not null,
    program_id uuid not null,
    lesson_id uuid,
    activity_id uuid,
    status text not null, -- e.g. 'not_started', 'in_progress', 'completed'
    updated_at timestamptz default now()
);

-- 11. notifications
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    title text not null,
    body text,
    read boolean default false,
    created_at timestamptz default now()
);

-- 12. user_settings
create table if not exists public.user_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    setting_key text not null,
    setting_value text,
    updated_at timestamptz default now()
);

-- TODO: add foreign keys + RLS later once structure is stable
