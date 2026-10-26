do $$
declare
  constraint_name text;
begin
  select con.conname
  into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'notifications'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%notification_type%';

  if constraint_name is not null then
    execute format('alter table public.notifications drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.notifications
  add constraint notifications_notification_type_check
  check (
    notification_type in (
      'reminder',
      'lesson_due',
      'review_due',
      'certificate',
      'admin_message',
      'system',
      'safety_alert',
      'risk_regression',
      'compliance_gap',
      'crisis_alert',
      'milestone',
      'session_alert',
      'document_expiry',
      'service_referral_alert'
    )
  );

alter table public.notifications
  add column if not exists alert_severity text
    check (alert_severity is null or alert_severity in ('info', 'moderate', 'high', 'critical')),
  add column if not exists audience text[] not null default array['parent']::text[],
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists acknowledged_at timestamptz,
  add column if not exists acknowledged_by uuid references auth.users(id);

create index if not exists idx_notifications_type_severity
  on public.notifications(notification_type, alert_severity, created_at desc);
