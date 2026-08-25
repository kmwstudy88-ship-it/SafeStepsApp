-- Migration: agent_skill_results
-- Stores outputs from the 8 Document-Intelligence Copilot agent skills.

create table if not exists public.agent_skill_results (
  id            uuid primary key default gen_random_uuid(),
  skill_name    text not null,
  case_id       uuid references public.cases(id) on delete set null,
  input_hash    text not null,
  result        jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists idx_agent_skill_results_case_skill
  on public.agent_skill_results(case_id, skill_name, created_at desc);

create index if not exists idx_agent_skill_results_skill_created
  on public.agent_skill_results(skill_name, created_at desc);

-- Row-level security: users may only read results linked to cases they can access.
alter table public.agent_skill_results enable row level security;

create policy "agent_skill_results_select_own_cases"
  on public.agent_skill_results
  for select
  using (
    case_id is null
    or exists (
      select 1
      from public.cases c
      where c.id = agent_skill_results.case_id
        and (
          c.owner_id = auth.uid()
          or exists (
            select 1
            from public.case_collaborators cc
            where cc.case_id = c.id
              and cc.user_id = auth.uid()
          )
        )
    )
  );

create policy "agent_skill_results_insert_service_role"
  on public.agent_skill_results
  for insert
  with check (true);
