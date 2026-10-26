alter table if exists public.evidence_ai_analyses
  add column if not exists fairness_score integer
    check (fairness_score is null or (fairness_score >= 0 and fairness_score <= 100)),
  add column if not exists bias_indicators jsonb not null default '[]'::jsonb,
  add column if not exists coercion_flags jsonb not null default '[]'::jsonb,
  add column if not exists discrimination_risks jsonb not null default '[]'::jsonb,
  add column if not exists framing_concerns jsonb not null default '[]'::jsonb,
  add column if not exists unrealistic_expectations jsonb not null default '[]'::jsonb,
  add column if not exists remediation_recommendations jsonb not null default '[]'::jsonb;

create index if not exists evidence_ai_analyses_fairness_idx
  on public.evidence_ai_analyses(evidence_record_id, analysed_at desc)
  where analysis_type = 'fairness_detection';
