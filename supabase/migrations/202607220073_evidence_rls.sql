alter table public.evidence_records enable row level security;
alter table public.evidence_files enable row level security;
alter table public.evidence_metadata enable row level security;
alter table public.evidence_type_definitions enable row level security;
alter table public.evidence_category_definitions enable row level security;
alter table public.evidence_record_categories enable row level security;
alter table public.evidence_links enable row level security;
alter table public.evidence_timeline_events enable row level security;
alter table public.evidence_chain_of_custody enable row level security;
alter table public.evidence_verifications enable row level security;
alter table public.evidence_digital_signatures enable row level security;
alter table public.evidence_ai_analyses enable row level security;
alter table public.evidence_redactions enable row level security;
alter table public.court_bundles enable row level security;
alter table public.court_bundle_exhibits enable row level security;
alter table public.evidence_retention_policies enable row level security;
alter table public.evidence_legal_holds enable row level security;
alter table public.evidence_retention_events enable row level security;
alter table public.evidence_sharing_grants enable row level security;

grant select, insert, update on
  public.evidence_records,
  public.evidence_files,
  public.evidence_metadata,
  public.evidence_record_categories,
  public.evidence_links,
  public.evidence_timeline_events,
  public.evidence_chain_of_custody,
  public.evidence_verifications,
  public.evidence_digital_signatures,
  public.evidence_ai_analyses,
  public.evidence_redactions,
  public.court_bundles,
  public.court_bundle_exhibits,
  public.evidence_retention_policies,
  public.evidence_legal_holds,
  public.evidence_retention_events,
  public.evidence_sharing_grants
to authenticated;

grant select on public.evidence_type_definitions, public.evidence_category_definitions to authenticated;

drop policy if exists "Evidence records readable" on public.evidence_records;
create policy "Evidence records readable" on public.evidence_records for select to authenticated using (public.has_evidence_access(id));
drop policy if exists "Evidence records uploadable" on public.evidence_records;
create policy "Evidence records uploadable" on public.evidence_records for insert to authenticated with check (uploader_user_id = auth.uid() and public.has_permission(tenant_id, 'evidence.upload'));
drop policy if exists "Evidence records manageable" on public.evidence_records;
create policy "Evidence records manageable" on public.evidence_records for update to authenticated using (public.can_manage_evidence(id)) with check (public.can_manage_evidence(id));

drop policy if exists "Evidence files readable" on public.evidence_files;
create policy "Evidence files readable" on public.evidence_files for select to authenticated using (public.has_evidence_access(evidence_record_id));
drop policy if exists "Evidence files manageable" on public.evidence_files;
create policy "Evidence files manageable" on public.evidence_files for all to authenticated using (public.can_manage_evidence(evidence_record_id)) with check (public.can_manage_evidence(evidence_record_id));

drop policy if exists "Evidence metadata readable" on public.evidence_metadata;
create policy "Evidence metadata readable" on public.evidence_metadata for select to authenticated using (exists (select 1 from public.evidence_files ef where ef.id = evidence_file_id and public.has_evidence_access(ef.evidence_record_id)));

drop policy if exists "Evidence definitions readable" on public.evidence_type_definitions;
create policy "Evidence definitions readable" on public.evidence_type_definitions for select to authenticated using (active = true);
drop policy if exists "Evidence categories readable" on public.evidence_category_definitions;
create policy "Evidence categories readable" on public.evidence_category_definitions for select to authenticated using (active = true);

drop policy if exists "Evidence chain readable" on public.evidence_chain_of_custody;
create policy "Evidence chain readable" on public.evidence_chain_of_custody for select to authenticated using (public.has_evidence_access(evidence_record_id));
drop policy if exists "Evidence chain appendable" on public.evidence_chain_of_custody;
create policy "Evidence chain appendable" on public.evidence_chain_of_custody for insert to authenticated with check (actor_user_id = auth.uid() and public.has_evidence_access(evidence_record_id));

drop policy if exists "Evidence AI analysis readable" on public.evidence_ai_analyses;
create policy "Evidence AI analysis readable" on public.evidence_ai_analyses for select to authenticated using (public.has_evidence_access(evidence_record_id));
drop policy if exists "Evidence AI analysis reviewable" on public.evidence_ai_analyses;
create policy "Evidence AI analysis reviewable" on public.evidence_ai_analyses for update to authenticated using (public.has_permission(tenant_id, 'ai.analysis.review')) with check (public.has_permission(tenant_id, 'ai.analysis.review'));

drop policy if exists "Evidence redactions readable" on public.evidence_redactions;
create policy "Evidence redactions readable" on public.evidence_redactions for select to authenticated using (public.has_evidence_access(evidence_record_id));
drop policy if exists "Evidence redactions manageable" on public.evidence_redactions;
create policy "Evidence redactions manageable" on public.evidence_redactions for all to authenticated using (public.has_permission(tenant_id, 'evidence.redact')) with check (public.has_permission(tenant_id, 'evidence.redact'));

drop policy if exists "Court bundles readable" on public.court_bundles;
create policy "Court bundles readable" on public.court_bundles for select to authenticated using (public.has_case_access(case_id) and public.has_permission(tenant_id, 'evidence.export'));
drop policy if exists "Court bundles manageable" on public.court_bundles;
create policy "Court bundles manageable" on public.court_bundles for all to authenticated using (public.has_permission(tenant_id, 'court.bundle.manage')) with check (public.has_permission(tenant_id, 'court.bundle.manage'));

drop policy if exists "Evidence legal holds manageable" on public.evidence_legal_holds;
create policy "Evidence legal holds manageable" on public.evidence_legal_holds for all to authenticated using (public.has_permission(tenant_id, 'legal.hold.manage')) with check (public.has_permission(tenant_id, 'legal.hold.manage'));

drop policy if exists "Evidence sharing grants readable" on public.evidence_sharing_grants;
create policy "Evidence sharing grants readable" on public.evidence_sharing_grants for select to authenticated using (public.has_evidence_access(evidence_record_id));
drop policy if exists "Evidence sharing grants manageable" on public.evidence_sharing_grants;
create policy "Evidence sharing grants manageable" on public.evidence_sharing_grants for all to authenticated using (public.has_permission(tenant_id, 'evidence.share')) with check (public.has_permission(tenant_id, 'evidence.share'));
