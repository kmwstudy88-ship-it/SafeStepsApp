create table if not exists public.evidence_sharing_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  share_target_type text not null,
  grantee_user_id uuid references auth.users(id) on delete cascade,
  grantee_family_member_id uuid references public.family_members(id) on delete cascade,
  external_recipient text,
  access_level text not null default 'read_only',
  download_allowed boolean not null default false,
  watermark_required boolean not null default true,
  audit_required boolean not null default true,
  expires_at timestamptz,
  revoked_at timestamptz,
  granted_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.has_evidence_access(p_evidence_record_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.evidence_records er
    where er.id = p_evidence_record_id
      and er.deleted = false
      and (
        public.has_permission(er.tenant_id, 'evidence.view')
        or (er.case_id is not null and public.has_case_access(er.case_id))
        or er.uploader_user_id = auth.uid()
        or exists (
          select 1
          from public.evidence_sharing_grants g
          where g.evidence_record_id = er.id
            and g.revoked_at is null
            and (g.expires_at is null or g.expires_at > now())
            and (
              g.grantee_user_id = auth.uid()
              or g.grantee_family_member_id in (select public.current_family_member_ids())
            )
        )
      )
  );
$$;

create or replace function public.can_manage_evidence(p_evidence_record_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.evidence_records er
    where er.id = p_evidence_record_id
      and (
        public.has_permission(er.tenant_id, 'evidence.verify')
        or public.has_permission(er.tenant_id, 'evidence.upload')
        or (er.case_id is not null and public.can_manage_case(er.case_id))
      )
  );
$$;

create or replace function public.can_export_evidence(p_evidence_record_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.evidence_records er
    where er.id = p_evidence_record_id
      and public.has_permission(er.tenant_id, 'evidence.export')
  );
$$;
