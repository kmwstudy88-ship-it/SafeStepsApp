create table if not exists public.case_type_definitions (
  id uuid primary key default gen_random_uuid(),
  case_type_code text not null unique,
  case_type_name text not null,
  case_type_description text not null,
  default_priority_level text not null default 'standard',
  safety_critical boolean not null default false,
  default_program_code text,
  default_review_frequency_days integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint case_type_review_frequency_check check (
    default_review_frequency_days is null or default_review_frequency_days > 0
  )
);

create table if not exists public.case_status_definitions (
  id uuid primary key default gen_random_uuid(),
  case_status_code text not null unique,
  case_status_name text not null,
  case_status_description text not null,
  terminal_status boolean not null default false,
  active_work_status boolean not null default false,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.case_priority_definitions (
  id uuid primary key default gen_random_uuid(),
  priority_code text not null unique,
  priority_name text not null,
  priority_description text not null,
  severity_order integer not null,
  target_response_hours integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
