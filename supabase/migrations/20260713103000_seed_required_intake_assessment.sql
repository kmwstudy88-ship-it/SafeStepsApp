-- Seed the required SafeSteps intake assessment.
-- This is the pre-entry baseline that must be completed before programs start.

insert into public.assessments (id, name, description)
values (
  '22222222-2222-4222-8222-222222222222',
  'SafeSteps Intake Assessment',
  'Pre-entry baseline assessment. This must be completed before any program can be started.'
)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.assessment_questions (
  assessment_id,
  question_number,
  question_text,
  question_type
)
values
  ('22222222-2222-4222-8222-222222222222', 1, 'I understand SafeSteps will use my intake answers, reflections, evidence, sessions, and progress records to support program planning and review.', 'yes_no'),
  ('22222222-2222-4222-8222-222222222222', 2, 'Parent/carer personal details, contact details, and preferred name have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 3, 'Child, family, placement, and reunification details have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 4, 'Child protection history, current concerns, orders, and safety requirements have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 5, 'Housing, education, employment, finances, transport, culture, and daily stability needs have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 6, 'Mental health, wellbeing, stress, diagnosis, treatment, and support needs have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 7, 'Alcohol and other drug history, current use, treatment, relapse risks, and safety planning needs have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 8, 'Domestic and family violence, coercive control, victim-survivor needs, perpetration concerns, and safety planning needs have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 9, 'Parenting capacity, routines, attachment, insight, accountability, child safety, and protective capacity baseline have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 10, 'Support network, professional contacts, referrals, and practical support needs have been recorded.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 11, 'Risk, minimisation, avoidance, disguised compliance, and program participation concerns have been considered.', 'completion_check'),
  ('22222222-2222-4222-8222-222222222222', 12, 'Consent, immediate safety actions, first referrals, and the starting SafeSteps plan have been recorded.', 'completion_check')
on conflict do nothing;
