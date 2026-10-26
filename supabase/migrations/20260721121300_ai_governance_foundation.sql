create table if not exists public.ai_governance_principles (
  id uuid primary key default gen_random_uuid(),
  principle_code text not null unique,
  name text not null,
  description text not null,
  priority integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_governance_bodies (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  name text not null,
  scope text not null default 'organisation',
  status text not null default 'active' check (status in ('draft', 'active', 'suspended', 'retired')),
  terms_reference text,
  chair_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_governance_memberships (
  id uuid primary key default gen_random_uuid(),
  governance_body_id uuid not null references public.ai_governance_bodies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('chair', 'member', 'risk_reviewer', 'privacy_reviewer', 'safety_reviewer', 'fairness_reviewer', 'observer')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  conflict_scope text,
  status text not null default 'active' check (status in ('active', 'recused', 'ended')),
  created_at timestamptz not null default now(),
  unique (governance_body_id, user_id, role, starts_at)
);

create table if not exists public.ai_policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_code text not null,
  version integer not null,
  title text not null,
  policy_category text not null check (policy_category in ('principles', 'use_case', 'model_lifecycle', 'prompt_workflow', 'training_data', 'human_review', 'incident_response', 'audit_compliance')),
  policy_content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  effective_from timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (policy_code, version)
);

create table if not exists public.ai_use_cases (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  use_case_code text not null,
  name text not null,
  description text not null,
  use_case_category text not null check (use_case_category in ('content_support', 'case_summary', 'report_drafting', 'risk_triage_support', 'translation_accessibility', 'education_personalisation', 'administration', 'quality_assurance', 'other')),
  affected_subject_types text[] not null default '{}'::text[],
  data_domains text[] not null default '{}'::text[],
  automation_level text not null default 'assistive' check (automation_level in ('assistive', 'human_in_the_loop', 'human_on_the_loop', 'prohibited')),
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  status text not null default 'draft' check (status in ('draft', 'under_review', 'approved', 'suspended', 'retired', 'prohibited')),
  human_review_required boolean not null default true,
  child_data_involved boolean not null default false,
  safety_critical boolean not null default false,
  report_or_court_output_allowed boolean not null default false,
  user_disclosure_required boolean not null default true,
  approved_by uuid references auth.users(id) on delete set null,
  effective_from timestamptz,
  retired_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, use_case_code)
);

create table if not exists public.ai_prohibited_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_code text not null unique,
  name text not null,
  description text not null,
  prohibited_scope text not null,
  examples jsonb not null default '[]'::jsonb,
  legal_or_policy_basis text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_use_case_prohibited_decision_checks (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  prohibited_decision_id uuid not null references public.ai_prohibited_decisions(id) on delete cascade,
  check_status text not null default 'pending' check (check_status in ('pending', 'cleared', 'blocked', 'mitigation_required')),
  rationale text,
  checked_by uuid references auth.users(id) on delete set null,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (use_case_id, prohibited_decision_id)
);

create table if not exists public.ai_human_oversight_requirements (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  oversight_level text not null check (oversight_level in ('none_for_low_risk_admin', 'human_review_before_action', 'qualified_reviewer_required', 'second_review_required', 'committee_approval_required')),
  required_reviewer_role text,
  qualified_reviewer_required boolean not null default true,
  second_review_required boolean not null default false,
  override_allowed boolean not null default true,
  override_reason_required boolean not null default true,
  appeal_path_required boolean not null default true,
  requirements jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (use_case_id, oversight_level)
);

create table if not exists public.ai_automation_boundary_rules (
  id uuid primary key default gen_random_uuid(),
  boundary_code text not null unique,
  use_case_id uuid references public.ai_use_cases(id) on delete cascade,
  prohibited_action text not null,
  allowed_supporting_actions text[] not null default '{}'::text[],
  boundary_text text not null,
  enforcement_level text not null default 'blocking' check (enforcement_level in ('advisory', 'approval_required', 'blocking')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  assessment_version integer not null default 1,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  child_impact text not null default 'not_assessed',
  safety_impact text not null default 'not_assessed',
  privacy_impact text not null default 'not_assessed',
  fairness_impact text not null default 'not_assessed',
  mitigation_summary text not null,
  residual_risk text not null check (residual_risk in ('low', 'medium', 'high', 'critical')),
  assessed_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (use_case_id, assessment_version)
);

create table if not exists public.ai_release_gates (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  gate_code text not null,
  gate_name text not null,
  gate_status text not null default 'pending' check (gate_status in ('pending', 'passed', 'failed', 'waived', 'blocked')),
  evidence_required boolean not null default true,
  evidence_reference text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (use_case_id, gate_code)
);

create table if not exists public.ai_governance_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_reference text not null unique,
  organisation_id uuid references public.organisations(id) on delete cascade,
  subject_type text not null,
  subject_id uuid,
  decision_type text not null check (decision_type in ('policy_approval', 'use_case_approval', 'use_case_suspension', 'risk_acceptance', 'release_gate_approval', 'exception', 'retirement')),
  decision text not null check (decision in ('approved', 'rejected', 'suspended', 'waived', 'retired', 'needs_changes')),
  rationale text not null,
  policy_version_reference text,
  approved_by uuid references auth.users(id) on delete set null,
  effective_from timestamptz,
  review_due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_governance_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  organisation_id uuid references public.organisations(id) on delete set null,
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  event_payload jsonb not null default '{}'::jsonb,
  correlation_id uuid,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ai_governance_bodies_org on public.ai_governance_bodies(organisation_id);
create index if not exists idx_ai_governance_memberships_user on public.ai_governance_memberships(user_id);
create index if not exists idx_ai_use_cases_org_status on public.ai_use_cases(organisation_id, status);
create index if not exists idx_ai_use_cases_risk on public.ai_use_cases(risk_level, safety_critical, child_data_involved);
create index if not exists idx_ai_checks_use_case on public.ai_use_case_prohibited_decision_checks(use_case_id);
create index if not exists idx_ai_risk_assessments_use_case on public.ai_risk_assessments(use_case_id);
create index if not exists idx_ai_release_gates_use_case on public.ai_release_gates(use_case_id);
create index if not exists idx_ai_governance_decisions_subject on public.ai_governance_decisions(subject_type, subject_id);
create index if not exists idx_ai_audit_events_org_time on public.ai_governance_audit_events(organisation_id, occurred_at desc);
create index if not exists idx_ai_audit_events_subject on public.ai_governance_audit_events(subject_type, subject_id);

create or replace function public.safesteps_can_manage_ai_governance(
  p_user_id uuid,
  p_organisation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.safesteps_can_admin_organisation(p_user_id, p_organisation_id)
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'ai_governance.manage'),
    false
  );
$$;

revoke all on function public.safesteps_can_manage_ai_governance(uuid, uuid) from public;
grant execute on function public.safesteps_can_manage_ai_governance(uuid, uuid) to authenticated;

create or replace function public.safesteps_is_ai_governance_member(
  p_user_id uuid,
  p_governance_body_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_governance_memberships m
    where m.governance_body_id = p_governance_body_id
      and m.user_id = p_user_id
      and m.status = 'active'
      and (m.ends_at is null or m.ends_at > now())
  );
$$;

revoke all on function public.safesteps_is_ai_governance_member(uuid, uuid) from public;
grant execute on function public.safesteps_is_ai_governance_member(uuid, uuid) to authenticated;

alter table public.ai_governance_principles enable row level security;
alter table public.ai_governance_bodies enable row level security;
alter table public.ai_governance_memberships enable row level security;
alter table public.ai_policy_versions enable row level security;
alter table public.ai_use_cases enable row level security;
alter table public.ai_prohibited_decisions enable row level security;
alter table public.ai_use_case_prohibited_decision_checks enable row level security;
alter table public.ai_human_oversight_requirements enable row level security;
alter table public.ai_automation_boundary_rules enable row level security;
alter table public.ai_risk_assessments enable row level security;
alter table public.ai_release_gates enable row level security;
alter table public.ai_governance_decisions enable row level security;
alter table public.ai_governance_audit_events enable row level security;

create policy "AI principles are readable"
  on public.ai_governance_principles
  for select
  to authenticated
  using (active = true);

create policy "AI prohibited decisions are readable"
  on public.ai_prohibited_decisions
  for select
  to authenticated
  using (active = true);

create policy "Approved AI policies are readable"
  on public.ai_policy_versions
  for select
  to authenticated
  using (status = 'approved');

create policy "AI governance bodies readable by admins or members"
  on public.ai_governance_bodies
  for select
  to authenticated
  using (
    public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id)
    or public.safesteps_is_ai_governance_member(auth.uid(), id)
  );

create policy "AI governance bodies managed by AI governance admins"
  on public.ai_governance_bodies
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id));

create policy "AI governance memberships readable by body members"
  on public.ai_governance_memberships
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.ai_governance_bodies b
      where b.id = governance_body_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), b.organisation_id)
    )
    or public.safesteps_is_ai_governance_member(auth.uid(), governance_body_id)
  );

create policy "AI governance memberships managed by admins"
  on public.ai_governance_memberships
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_governance_bodies b
      where b.id = governance_body_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), b.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_governance_bodies b
      where b.id = governance_body_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), b.organisation_id)
    )
  );

create policy "AI use cases readable by governance admins"
  on public.ai_use_cases
  for select
  to authenticated
  using (public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id));

create policy "AI use cases managed by governance admins"
  on public.ai_use_cases
  for all
  to authenticated
  using (public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id));

create policy "AI policy drafts managed by security admins"
  on public.ai_policy_versions
  for all
  to authenticated
  using (public.has_resource_permission(auth.uid(), 'global', null, 'ai_policy.approve'))
  with check (public.has_resource_permission(auth.uid(), 'global', null, 'ai_policy.approve'));

create policy "AI checks readable with use case"
  on public.ai_use_case_prohibited_decision_checks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  );

create policy "AI checks managed with use case"
  on public.ai_use_case_prohibited_decision_checks
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  );

create policy "AI oversight readable with use case"
  on public.ai_human_oversight_requirements
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  );

create policy "AI oversight managed with use case"
  on public.ai_human_oversight_requirements
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  );

create policy "AI boundary rules readable by authenticated users"
  on public.ai_automation_boundary_rules
  for select
  to authenticated
  using (active = true);

create policy "AI risk assessments managed with use case"
  on public.ai_risk_assessments
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  );

create policy "AI release gates managed with use case"
  on public.ai_release_gates
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  )
  with check (
    exists (
      select 1
      from public.ai_use_cases u
      where u.id = use_case_id
        and public.safesteps_can_manage_ai_governance(auth.uid(), u.organisation_id)
    )
  );

create policy "AI governance decisions readable by admins"
  on public.ai_governance_decisions
  for select
  to authenticated
  using (public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id));

create policy "AI governance decisions inserted by admins"
  on public.ai_governance_decisions
  for insert
  to authenticated
  with check (public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id));

create policy "AI audit events readable by auditors"
  on public.ai_governance_audit_events
  for select
  to authenticated
  using (
    public.safesteps_can_manage_ai_governance(auth.uid(), organisation_id)
    or public.has_resource_permission(auth.uid(), 'global', null, 'ai_audit.read')
  );

create policy "AI audit events appendable by actor"
  on public.ai_governance_audit_events
  for insert
  to authenticated
  with check (actor_user_id = auth.uid());

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_governance.manage', 'Create and manage AI governance bodies, use cases, boundaries, and oversight requirements.', 'organisation', 'manage_ai_governance', 'high_impact'),
  ('ai_use_case.approve', 'Approve, suspend, or retire SafeSteps AI use cases.', 'organisation', 'approve_ai_use_case', 'high_impact'),
  ('ai_policy.approve', 'Approve global SafeSteps AI policy versions.', 'global', 'approve_ai_policy', 'high_impact'),
  ('ai_risk_assessment.review', 'Review AI risk and mitigation records before production release.', 'organisation', 'review_ai_risk_assessment', 'high_impact'),
  ('ai_audit.read', 'Read AI governance audit events and regulator-facing AI history.', 'global', 'read_ai_audit', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.security_roles (role_code, name, description, role_scope, high_privilege)
values
  ('ai_governance_lead', 'AI Governance Lead', 'Responsible for approving SafeSteps AI use cases, oversight boundaries, and release gates.', 'organisation', true),
  ('model_risk_reviewer', 'Model Risk Reviewer', 'Reviews AI risk, fairness, safety, and residual-risk records before release.', 'organisation', true)
on conflict (role_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_governance.manage',
  'ai_use_case.approve',
  'ai_risk_assessment.review'
)
where r.role_code = 'ai_governance_lead'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_risk_assessment.review',
  'ai_audit.read'
)
where r.role_code = 'model_risk_reviewer'
on conflict do nothing;

insert into public.ai_governance_principles (principle_code, name, description, priority)
values
  ('human_accountability', 'Human accountability', 'SafeSteps AI may support review, drafting, triage, and education, but accountable humans remain responsible for high-impact action.', 10),
  ('no_autonomous_high_impact_decisions', 'No autonomous high-impact decisions', 'AI must not make child-safety, legal, clinical, custody, access, eligibility, or report-release decisions without explicit human authority.', 20),
  ('evidence_grounding', 'Evidence grounding', 'AI outputs used in reports, summaries, or professional review must preserve source separation, uncertainty, and evidence references.', 30),
  ('child_privacy_by_default', 'Child privacy by default', 'Child data must be minimised, privacy-mediated, and excluded from AI processing unless consent, authority, and safety need are recorded.', 40),
  ('fair_accessible_culturally_safe', 'Fair, accessible, and culturally safe', 'AI workflows must be assessed for demographic, disability, language, cultural, and neurodiversity impacts before release.', 50),
  ('transparent_reviewable_appealable', 'Transparent, reviewable, and appealable', 'Affected users and reviewers must be able to identify AI-supported output, request human review, and see correction pathways.', 60),
  ('data_minimisation', 'Data minimisation', 'AI requests must use the minimum necessary data and must avoid unnecessary identifiers, sensitive facts, and child-private content.', 70),
  ('auditability', 'Auditability', 'AI policy, prompts, use-case approvals, outputs, overrides, and incidents must leave durable audit records.', 80)
on conflict (principle_code) do update
set name = excluded.name,
    description = excluded.description,
    priority = excluded.priority,
    active = true,
    updated_at = now();

insert into public.ai_prohibited_decisions (decision_code, name, description, prohibited_scope, examples, legal_or_policy_basis)
values
  ('child_removal_or_placement', 'Child removal or placement decision', 'AI must not recommend, approve, deny, or automate child removal, placement, reunification, custody, or contact outcomes.', 'all SafeSteps AI workflows', '["remove a child", "approve unsupervised contact", "deny reunification"]'::jsonb, 'SafeSteps human oversight and child-safety governance'),
  ('abuse_or_neglect_determination', 'Abuse or neglect determination', 'AI must not determine that abuse, neglect, coercive control, or family violence did or did not occur.', 'assessment, report, safety, and court-support workflows', '["find substantiated abuse", "clear allegation", "determine perpetrator"]'::jsonb, 'Decision-support only boundary'),
  ('emergency_service_dispatch', 'Emergency service dispatch', 'AI must not autonomously contact emergency services, police, courts, or child protection agencies.', 'safety escalation workflows', '["dispatch police", "file mandatory report without human confirmation"]'::jsonb, 'Human response escalation model'),
  ('clinical_or_legal_advice', 'Clinical or legal advice', 'AI must not diagnose, prescribe treatment, provide legal advice, or predict legal outcomes.', 'education, report, assessment, and messaging workflows', '["diagnose PTSD", "advise breaching an order", "predict court result"]'::jsonb, 'Professional-scope boundary'),
  ('report_release_or_approval', 'Report release or approval', 'AI must not approve, certify, release, withdraw, or correct official reports without a dedicated authorised human approval record.', 'reporting and court-export workflows', '["approve report", "certify court export", "withdraw report"]'::jsonb, 'Report immutability and approval governance'),
  ('child_private_disclosure', 'Child private disclosure', 'AI must not disclose child-private records to a parent, worker, or agency without explicit share authority and safety review.', 'child privacy and parent-child workflows', '["show child journal to parent", "summarise undisclosed child disclosure"]'::jsonb, 'Child privacy mediated-access rule'),
  ('eligibility_or_service_denial', 'Eligibility or service denial', 'AI must not deny program access, services, referrals, supervision level, or supports.', 'program, referral, and case-management workflows', '["deny program enrolment", "reject referral", "reduce supervision"]'::jsonb, 'Human review and appeal requirement'),
  ('risk_final_finding', 'Safety risk final finding', 'AI must not issue final safety findings or override critical risk flags through averaging or scoring.', 'safety, risk, and court-facing workflows', '["final low risk", "override critical concern", "close safety alert"]'::jsonb, 'Critical override preservation rule')
on conflict (decision_code) do update
set name = excluded.name,
    description = excluded.description,
    prohibited_scope = excluded.prohibited_scope,
    examples = excluded.examples,
    legal_or_policy_basis = excluded.legal_or_policy_basis,
    active = true,
    updated_at = now();

insert into public.ai_automation_boundary_rules (
  boundary_code,
  prohibited_action,
  allowed_supporting_actions,
  boundary_text,
  enforcement_level
)
values
  ('human_review_required_for_court_outputs', 'AI-only court-facing report generation or release', array['drafting support', 'citation checking', 'plain-language explanation'], 'Court-facing and regulator-facing outputs require explicit human review, approval records, source separation, and release controls.', 'blocking'),
  ('critical_risk_not_averaged_away', 'Automated downgrading or closure of critical safety findings', array['surface critical evidence', 'route to review queue', 'summarise uncertainty'], 'Critical risk indicators must remain visible and must not be hidden by aggregate scoring, confidence averages, or automated calming language.', 'blocking'),
  ('child_data_minimisation', 'Unnecessary AI processing or disclosure of child-private content', array['use redacted excerpts with authority', 'flag consent gap', 'request human review'], 'Child-private data requires recorded authority, minimal disclosure, and safety-aware review before AI processing or summarisation.', 'blocking'),
  ('assistive_only_for_high_impact', 'Autonomous high-impact case, safety, clinical, or legal action', array['draft options', 'identify missing evidence', 'prepare review notes'], 'AI may support human decision-making but must not make or execute high-impact actions in SafeSteps.', 'blocking')
on conflict (boundary_code) do update
set prohibited_action = excluded.prohibited_action,
    allowed_supporting_actions = excluded.allowed_supporting_actions,
    boundary_text = excluded.boundary_text,
    enforcement_level = excluded.enforcement_level,
    active = true,
    updated_at = now();
