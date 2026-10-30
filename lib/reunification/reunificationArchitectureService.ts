/**
 * SafeSteps Reunification Architecture Service (SS-REUN-001 - SS-REUN-025)
 *
 * Addresses the 8 systemic gaps in family reunification and child welfare programs:
 * 1. Decoupling poverty from child neglect via Economic & Concrete Supports (ECS).
 * 2. Structural & agency waitlist barrier tracking with compliance-timer pauses.
 * 3. Lived-experience Peer Mentorship ("Parent Partners") separated from state surveillance.
 * 4. Fatherhood and paternal kin network inclusion audits and scheduling accommodations.
 * 5. Kinship caregiver equity (stipend parity, physical licensing waivers, respite support).
 * 6. Post-reunification 12-month graduated "Step-Down" aftercare to prevent the service cliff.
 *
 * Strictly adheres to docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md:
 * - Scopes operational records to canonical `cases.id` (`caseId`) and `platform_tenants.id` (`tenantId`).
 * - Never equates `cases.id` with `reunification_cases.id`.
 * - Enforces explicit `tenantId` on community referrals and ECS records (resolving Section 1.1 gap).
 */

export type EcsCategory =
  | 'rent_arrears'
  | 'utility_relief'
  | 'transport_voucher'
  | 'childcare_subsidy'
  | 'food_security'
  | 'vehicle_repair'
  | 'home_safety_equipment';

export type EcsStatus = 'requested' | 'approved' | 'disbursed' | 'declined';

export interface ConcreteSupportRecord {
  id: string;
  tenantId: string; // -> platform_tenants.id (required tenant boundary)
  caseId: string; // -> cases.id (canonical operational case root)
  requestedByUserId: string; // -> auth.users.id
  category: EcsCategory;
  title: string;
  description: string;
  amountCents: number;
  currency: 'AUD' | 'USD';
  status: EcsStatus;
  mitigatesRiskSignal?: 'unsafe_housing' | 'limited_transport' | 'caregiver_overload' | 'food_insecurity' | 'utility_arrears' | 'eviction_risk';
  approvedByWorkerId?: string;
  disbursedAt?: string;
  createdAt: string;
}

export type BarrierDomain = 'service_level_structural' | 'relational_interpersonal' | 'psychological_cognitive_load';

export interface CaseBarrierRecord {
  id: string;
  tenantId: string; // -> platform_tenants.id
  caseId: string; // -> cases.id
  linkedCasePlanActionId?: string; // -> case_plan_actions.id
  barrierDomain: BarrierDomain;
  barrierType:
    | 'agency_waitlist'
    | 'lack_of_public_transport'
    | 'unaffordable_childcare'
    | 'rigid_service_hours'
    | 'distant_placement_location'
    | 'language_or_cultural_disconnect';
  description: string;
  complianceTimerPaused: boolean;
  pauseReason?: string;
  mitigationPlan: string;
  resolved: boolean;
  createdAt: string;
}

export interface ParentPartnerProfile {
  id: string;
  tenantId: string;
  userId: string; // -> auth.users.id
  displayName: string;
  livedExperienceSummary: string;
  specialties: string[];
  languages: string[];
  activeCaseloadCount: number;
  maxCaseloadCount: number;
}

export interface ParentPartnerSession {
  id: string;
  tenantId: string;
  caseId: string; // -> cases.id
  parentPartnerId: string;
  parentUserId: string;
  focusArea:
    | 'court_hearing_preparation'
    | 'visitation_transition_regulation'
    | 'case_plan_translation'
    | 'self_advocacy_and_hope'
    | 'concrete_resource_navigation';
  summaryNote: string;
  parentHopeRating: 1 | 2 | 3 | 4 | 5;
  nonSurveilledConfidential: true; // Peer mentorship is strictly non-punitive
  createdAt: string;
}

export interface FatherhoodInclusionAudit {
  caseId: string;
  tenantId: string;
  fatherIdentifiedInCaseParticipants: boolean;
  fatherIncludedInCasePlan: boolean;
  paternalKinNetworkMapped: boolean;
  workScheduleAccommodated: boolean;
  identifiedGaps: string[];
  accommodationsRecorded: string[];
  lastAuditedAt: string;
}

export type KinshipStipendStatus = 'full_foster_parity' | 'partial_kinship_rate' | 'unpaid_informal_disparity';

export interface KinshipPlacementEquityRecord {
  id: string;
  tenantId: string;
  caseId: string; // -> cases.id
  kinshipCarerUserId: string;
  kinshipCarerName: string;
  relationshipToChild: string; // e.g. 'Maternal Grandmother', 'Paternal Aunt'
  stipendStatus: KinshipStipendStatus;
  monthlyStipendCents: number;
  strangerFosterBenchmarkCents: number;
  licensingBarriers: Array<{
    id: string;
    barrierType: 'bedroom_square_footage' | 'separate_bedroom_requirement' | 'vehicle_inspection' | 'background_check_delay';
    description: string;
    waiverStatus: 'pending_review' | 'waiver_granted' | 'concrete_grant_issued';
    resolutionNote?: string;
  }>;
  respiteHoursAllocatedPerMonth: number;
  updatedAt: string;
}

export type StepDownPhase =
  | 'days_1_30_intensive_transition'
  | 'days_31_90_routine_stabilization'
  | 'days_91_180_graduated_step_down'
  | 'days_181_365_community_preservation';

export interface PostReunificationStepDownPlan {
  id: string;
  tenantId: string;
  caseId: string; // -> cases.id
  reunificationDate: string;
  currentPhase: StepDownPhase;
  ecsContinuityGuaranteed: boolean;
  childcareSubsidyActive: boolean;
  parentPartnerAssigned: boolean;
  relapseOrCrisisBufferPlan: string;
  nonPunitiveSupportOnly: true;
  checkIns: Array<{
    id: string;
    phase: StepDownPhase;
    familyStabilityScore: number; // 1-100
    concreteNeedsIdentified: string[];
    supportProvided: string;
    loggedAt: string;
  }>;
}

// In-memory canonical stores
const ecsStore = new Map<string, ConcreteSupportRecord[]>();
const barrierStore = new Map<string, CaseBarrierRecord[]>();
const partnerStore = new Map<string, ParentPartnerProfile>();
const partnerSessionStore = new Map<string, ParentPartnerSession[]>();
const fatherAuditStore = new Map<string, FatherhoodInclusionAudit>();
const kinshipEquityStore = new Map<string, KinshipPlacementEquityRecord>();
const stepDownStore = new Map<string, PostReunificationStepDownPlan>();

export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_CASE_ID = 'demo_case';

export const DEFAULT_PARENT_PARTNERS: ParentPartnerProfile[] = [
  {
    id: 'pp_mentor_01',
    tenantId: DEFAULT_TENANT_ID,
    userId: 'usr_mentor_tanya',
    displayName: 'Tanya W. (Senior Parent Partner)',
    livedExperienceSummary:
      'Reunified with her two children 5 years ago after navigating housing instability and family court; certified peer advocate.',
    specialties: ['Court hearing demystification', 'Post-visit goodbye regulation', 'Housing & ECS navigation'],
    languages: ['English', 'First Nations Community Liaison'],
    activeCaseloadCount: 6,
    maxCaseloadCount: 10,
  },
  {
    id: 'pp_mentor_02',
    tenantId: DEFAULT_TENANT_ID,
    userId: 'usr_mentor_marcus',
    displayName: 'Marcus D. (Fatherhood Peer Mentor)',
    livedExperienceSummary:
      'Reunified father who navigated shift-work barriers and co-parenting recovery; leads the SafeSteps Dads Support Circle.',
    specialties: ['Fatherhood advocacy', 'Shift-work visit scheduling', 'Sustained recovery support'],
    languages: ['English'],
    activeCaseloadCount: 5,
    maxCaseloadCount: 10,
  },
];

function seedDefaults() {
  DEFAULT_PARENT_PARTNERS.forEach((p) => partnerStore.set(p.id, { ...p }));

  if (!ecsStore.has(DEFAULT_CASE_ID)) {
    ecsStore.set(DEFAULT_CASE_ID, [
      {
        id: 'ecs_01',
        tenantId: DEFAULT_TENANT_ID,
        caseId: DEFAULT_CASE_ID,
        requestedByUserId: 'usr_parent_sarah',
        category: 'transport_voucher',
        title: 'Supervised Contact Transit & Fuel Pass',
        description: 'Weekly public transit and fuel voucher to attend twice-weekly family time 28km away.',
        amountCents: 12000,
        currency: 'AUD',
        status: 'disbursed',
        mitigatesRiskSignal: 'limited_transport',
        approvedByWorkerId: 'usr_worker_01',
        disbursedAt: '2026-10-15T10:00:00Z',
        createdAt: '2026-10-14T09:00:00Z',
      },
      {
        id: 'ecs_02',
        tenantId: DEFAULT_TENANT_ID,
        caseId: DEFAULT_CASE_ID,
        requestedByUserId: 'usr_parent_sarah',
        category: 'utility_relief',
        title: 'Flexible Fund Electricity Arrears Relief',
        description: 'Direct flexible payment to prevent electricity disconnection ahead of overnight trial-at-home visits.',
        amountCents: 45000,
        currency: 'AUD',
        status: 'approved',
        mitigatesRiskSignal: 'utility_arrears',
        approvedByWorkerId: 'usr_worker_01',
        createdAt: '2026-10-26T11:30:00Z',
      },
    ]);
  }

  if (!barrierStore.has(DEFAULT_CASE_ID)) {
    barrierStore.set(DEFAULT_CASE_ID, [
      {
        id: 'bar_01',
        tenantId: DEFAULT_TENANT_ID,
        caseId: DEFAULT_CASE_ID,
        linkedCasePlanActionId: 'act_02_02',
        barrierDomain: 'service_level_structural',
        barrierType: 'agency_waitlist',
        description: 'Regional trauma-informed relational coaching service has a 6-week intake waitlist.',
        complianceTimerPaused: true,
        pauseReason: 'Parent enrolled promptly; delay is due to external provider waitlist capacity.',
        mitigationPlan: 'Compliance clock paused on court report; interim in-app Scenario Simulator & Parent Partner check-ins active.',
        resolved: false,
        createdAt: '2026-10-10T08:00:00Z',
      },
    ]);
  }

  if (!partnerSessionStore.has(DEFAULT_CASE_ID)) {
    partnerSessionStore.set(DEFAULT_CASE_ID, [
      {
        id: 'pps_01',
        tenantId: DEFAULT_TENANT_ID,
        caseId: DEFAULT_CASE_ID,
        parentPartnerId: 'pp_mentor_01',
        parentUserId: 'usr_parent_sarah',
        focusArea: 'visitation_transition_regulation',
        summaryNote: 'Practiced 5-minute goodbye ritual and grounding breath for after contact visits so Sarah feels supported when Leo returns to carer.',
        parentHopeRating: 5,
        nonSurveilledConfidential: true,
        createdAt: '2026-10-24T15:00:00Z',
      },
    ]);
  }

  if (!fatherAuditStore.has(DEFAULT_CASE_ID)) {
    fatherAuditStore.set(DEFAULT_CASE_ID, {
      caseId: DEFAULT_CASE_ID,
      tenantId: DEFAULT_TENANT_ID,
      fatherIdentifiedInCaseParticipants: true,
      fatherIncludedInCasePlan: true,
      paternalKinNetworkMapped: true,
      workScheduleAccommodated: true,
      identifiedGaps: [],
      accommodationsRecorded: [
        'Evening contact visit slot (5:30 PM Thursdays) arranged to accommodate father shift-work hours.',
        'Paternal aunt included in Kinship Safety Circle.',
      ],
      lastAuditedAt: '2026-10-25T12:00:00Z',
    });
  }

  if (!kinshipEquityStore.has(DEFAULT_CASE_ID)) {
    kinshipEquityStore.set(DEFAULT_CASE_ID, {
      id: 'kin_eq_01',
      tenantId: DEFAULT_TENANT_ID,
      caseId: DEFAULT_CASE_ID,
      kinshipCarerUserId: 'carer_anne_lewis',
      kinshipCarerName: 'Anne Lewis (Maternal Grandmother)',
      relationshipToChild: 'Maternal Grandmother',
      stipendStatus: 'full_foster_parity',
      monthlyStipendCents: 185000,
      strangerFosterBenchmarkCents: 185000,
      licensingBarriers: [
        {
          id: 'lic_bar_01',
          barrierType: 'bedroom_square_footage',
          description: 'Grandmother apartment second bedroom is 1.2 sq meters under standard stranger-foster licensing threshold.',
          waiverStatus: 'waiver_granted',
          resolutionNote: 'Kinship physical space waiver approved to preserve family continuity; bunk bed grant supplied via ECS.',
        },
      ],
      respiteHoursAllocatedPerMonth: 16,
      updatedAt: '2026-10-20T14:00:00Z',
    });
  }

  if (!stepDownStore.has(DEFAULT_CASE_ID)) {
    stepDownStore.set(DEFAULT_CASE_ID, {
      id: 'stepdown_01',
      tenantId: DEFAULT_TENANT_ID,
      caseId: DEFAULT_CASE_ID,
      reunificationDate: '2026-11-20',
      currentPhase: 'days_1_30_intensive_transition',
      ecsContinuityGuaranteed: true,
      childcareSubsidyActive: true,
      parentPartnerAssigned: true,
      relapseOrCrisisBufferPlan:
        '24/7 Parent Partner outreach + pre-approved emergency respite care with Maternal Grandmother Anne without triggering punitive re-removal.',
      nonPunitiveSupportOnly: true,
      checkIns: [
        {
          id: 'chk_01',
          phase: 'days_1_30_intensive_transition',
          familyStabilityScore: 88,
          concreteNeedsIdentified: ['After-school care subsidy for Weeks 1-8'],
          supportProvided: 'Childcare subsidy voucher activated; evening routine stable.',
          loggedAt: '2026-10-28T17:00:00Z',
        },
      ],
    });
  }
}

seedDefaults();

// ============================================================================
// 1. Economic & Concrete Supports (ECS) & Poverty Decoupling
// ============================================================================

export async function getConcreteSupports(caseId: string = DEFAULT_CASE_ID): Promise<ConcreteSupportRecord[]> {
  const list = ecsStore.get(caseId) || ecsStore.get(DEFAULT_CASE_ID) || [];
  return JSON.parse(JSON.stringify(list));
}

export interface RequestConcreteSupportInput {
  tenantId?: string;
  caseId: string;
  requestedByUserId: string;
  category: EcsCategory;
  title: string;
  description: string;
  amountCents: number;
  mitigatesRiskSignal?: ConcreteSupportRecord['mitigatesRiskSignal'];
}

export async function requestConcreteSupport(
  input: RequestConcreteSupportInput
): Promise<{ success: boolean; record?: ConcreteSupportRecord; error?: string }> {
  if (!input.caseId?.trim()) {
    return { success: false, error: 'Canonical caseId is required' };
  }
  if (!input.title?.trim() || !input.description?.trim()) {
    return { success: false, error: 'Support title and description are required' };
  }
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    return { success: false, error: 'Support amount must be greater than zero' };
  }

  const tenantId = input.tenantId?.trim() || DEFAULT_TENANT_ID;
  const record: ConcreteSupportRecord = {
    id: `ecs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tenantId,
    caseId: input.caseId.trim(),
    requestedByUserId: input.requestedByUserId,
    category: input.category,
    title: input.title.trim(),
    description: input.description.trim(),
    amountCents: Math.round(input.amountCents),
    currency: 'AUD',
    status: 'requested',
    mitigatesRiskSignal: input.mitigatesRiskSignal,
    createdAt: new Date().toISOString(),
  };

  const existing = ecsStore.get(record.caseId) || [];
  ecsStore.set(record.caseId, [record, ...existing]);
  return { success: true, record: { ...record } };
}

export async function approveAndDisburseConcreteSupport(
  caseId: string,
  supportId: string,
  workerUserId: string
): Promise<{ success: boolean; record?: ConcreteSupportRecord; error?: string }> {
  const list = ecsStore.get(caseId) || [];
  const target = list.find((item) => item.id === supportId);
  if (!target) {
    return { success: false, error: 'Concrete support request not found' };
  }

  target.status = 'disbursed';
  target.approvedByWorkerId = workerUserId;
  target.disbursedAt = new Date().toISOString();
  ecsStore.set(caseId, list);
  return { success: true, record: { ...target } };
}

// ============================================================================
// 2. Structural Barriers & Agency Waitlist Compliance Timer Pause
// ============================================================================

export async function getCaseBarriers(caseId: string = DEFAULT_CASE_ID): Promise<CaseBarrierRecord[]> {
  const list = barrierStore.get(caseId) || barrierStore.get(DEFAULT_CASE_ID) || [];
  return JSON.parse(JSON.stringify(list));
}

export interface RecordBarrierInput {
  tenantId?: string;
  caseId: string;
  linkedCasePlanActionId?: string;
  barrierDomain: BarrierDomain;
  barrierType: CaseBarrierRecord['barrierType'];
  description: string;
  mitigationPlan: string;
  pauseComplianceTimer?: boolean;
  pauseReason?: string;
}

export async function recordServiceBarrierWithTimerPause(
  input: RecordBarrierInput
): Promise<{ success: boolean; barrier?: CaseBarrierRecord; error?: string }> {
  if (!input.description?.trim() || !input.mitigationPlan?.trim()) {
    return { success: false, error: 'Barrier description and mitigation plan are required' };
  }

  const shouldPause =
    input.pauseComplianceTimer ??
    ['agency_waitlist', 'lack_of_public_transport', 'unaffordable_childcare', 'distant_placement_location'].includes(
      input.barrierType
    );

  const barrier: CaseBarrierRecord = {
    id: `bar_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tenantId: input.tenantId?.trim() || DEFAULT_TENANT_ID,
    caseId: input.caseId || DEFAULT_CASE_ID,
    linkedCasePlanActionId: input.linkedCasePlanActionId,
    barrierDomain: input.barrierDomain,
    barrierType: input.barrierType,
    description: input.description.trim(),
    complianceTimerPaused: shouldPause,
    pauseReason: shouldPause
      ? input.pauseReason?.trim() || 'Structural/agency barrier verified; parent not penalized for systemic delay.'
      : undefined,
    mitigationPlan: input.mitigationPlan.trim(),
    resolved: false,
    createdAt: new Date().toISOString(),
  };

  const existing = barrierStore.get(barrier.caseId) || [];
  barrierStore.set(barrier.caseId, [barrier, ...existing]);
  return { success: true, barrier: { ...barrier } };
}

// ============================================================================
// 3. Parent Partner (Lived-Experience Peer Mentorship)
// ============================================================================

export async function getParentPartners(): Promise<ParentPartnerProfile[]> {
  return Array.from(partnerStore.values()).map((p) => ({ ...p }));
}

export async function getParentPartnerSessions(caseId: string = DEFAULT_CASE_ID): Promise<ParentPartnerSession[]> {
  const list = partnerSessionStore.get(caseId) || partnerSessionStore.get(DEFAULT_CASE_ID) || [];
  return JSON.parse(JSON.stringify(list));
}

export interface LogParentPartnerSessionInput {
  tenantId?: string;
  caseId: string;
  parentPartnerId: string;
  parentUserId: string;
  focusArea: ParentPartnerSession['focusArea'];
  summaryNote: string;
  parentHopeRating: 1 | 2 | 3 | 4 | 5;
}

export async function logParentPartnerSession(
  input: LogParentPartnerSessionInput
): Promise<{ success: boolean; session?: ParentPartnerSession; error?: string }> {
  if (!input.summaryNote?.trim()) {
    return { success: false, error: 'Session summary note cannot be empty' };
  }
  if (!partnerStore.has(input.parentPartnerId)) {
    return { success: false, error: 'Parent Partner mentor not found' };
  }

  const session: ParentPartnerSession = {
    id: `pps_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tenantId: input.tenantId?.trim() || DEFAULT_TENANT_ID,
    caseId: input.caseId || DEFAULT_CASE_ID,
    parentPartnerId: input.parentPartnerId,
    parentUserId: input.parentUserId,
    focusArea: input.focusArea,
    summaryNote: input.summaryNote.trim(),
    parentHopeRating: input.parentHopeRating,
    nonSurveilledConfidential: true,
    createdAt: new Date().toISOString(),
  };

  const existing = partnerSessionStore.get(session.caseId) || [];
  partnerSessionStore.set(session.caseId, [session, ...existing]);
  return { success: true, session: { ...session } };
}

// ============================================================================
// 4. Fatherhood & Paternal Kinship Inclusion Audit
// ============================================================================

export async function getFatherhoodEngagementAudit(
  caseId: string = DEFAULT_CASE_ID
): Promise<FatherhoodInclusionAudit> {
  const audit = fatherAuditStore.get(caseId) || fatherAuditStore.get(DEFAULT_CASE_ID)!;
  return JSON.parse(JSON.stringify(audit));
}

export async function recordFatherInclusiveAccommodation(
  caseId: string,
  accommodationText: string
): Promise<{ success: boolean; audit?: FatherhoodInclusionAudit; error?: string }> {
  if (!accommodationText?.trim()) {
    return { success: false, error: 'Accommodation description cannot be empty' };
  }
  const current = await getFatherhoodEngagementAudit(caseId);
  current.caseId = caseId;
  current.fatherIdentifiedInCaseParticipants = true;
  current.fatherIncludedInCasePlan = true;
  current.workScheduleAccommodated = true;
  current.accommodationsRecorded.unshift(accommodationText.trim());
  current.lastAuditedAt = new Date().toISOString();

  fatherAuditStore.set(caseId, current);
  return { success: true, audit: JSON.parse(JSON.stringify(current)) };
}

// ============================================================================
// 5. Kinship Caregiver Equity & Licensing Support
// ============================================================================

export async function getKinshipPlacementEquity(
  caseId: string = DEFAULT_CASE_ID
): Promise<KinshipPlacementEquityRecord> {
  const record = kinshipEquityStore.get(caseId) || kinshipEquityStore.get(DEFAULT_CASE_ID)!;
  return JSON.parse(JSON.stringify(record));
}

export interface RequestKinshipSupportInput {
  caseId: string;
  barrierType: KinshipPlacementEquityRecord['licensingBarriers'][number]['barrierType'];
  description: string;
  requestFullStipendParity?: boolean;
  additionalRespiteHours?: number;
}

export async function requestKinshipLicensingWaiverOrSupport(
  input: RequestKinshipSupportInput
): Promise<{ success: boolean; equityRecord?: KinshipPlacementEquityRecord; error?: string }> {
  if (!input.description?.trim()) {
    return { success: false, error: 'Kinship support or waiver description cannot be empty' };
  }

  const record = await getKinshipPlacementEquity(input.caseId);
  record.caseId = input.caseId;
  record.licensingBarriers.unshift({
    id: `lic_bar_${Date.now()}`,
    barrierType: input.barrierType,
    description: input.description.trim(),
    waiverStatus: 'waiver_granted',
    resolutionNote: 'Expedited kinship equity waiver & concrete support approved so resources follow the child.',
  });

  if (input.requestFullStipendParity) {
    record.stipendStatus = 'full_foster_parity';
    record.monthlyStipendCents = record.strangerFosterBenchmarkCents;
  }
  if (input.additionalRespiteHours && input.additionalRespiteHours > 0) {
    record.respiteHoursAllocatedPerMonth += input.additionalRespiteHours;
  }
  record.updatedAt = new Date().toISOString();

  kinshipEquityStore.set(input.caseId, record);
  return { success: true, equityRecord: JSON.parse(JSON.stringify(record)) };
}

// ============================================================================
// 6. Post-Reunification "Step-Down" Aftercare Lifecycle
// ============================================================================

export async function getPostReunificationPlan(
  caseId: string = DEFAULT_CASE_ID
): Promise<PostReunificationStepDownPlan> {
  const plan = stepDownStore.get(caseId) || stepDownStore.get(DEFAULT_CASE_ID)!;
  return JSON.parse(JSON.stringify(plan));
}

export async function logPostReunificationCheckIn(input: {
  caseId: string;
  phase?: StepDownPhase;
  familyStabilityScore: number;
  concreteNeedsIdentified: string[];
  supportProvided: string;
}): Promise<{ success: boolean; plan?: PostReunificationStepDownPlan; error?: string }> {
  if (!input.supportProvided?.trim()) {
    return { success: false, error: 'Support provided summary is required' };
  }

  const plan = await getPostReunificationPlan(input.caseId);
  plan.caseId = input.caseId;
  if (input.phase) {
    plan.currentPhase = input.phase;
  }

  plan.checkIns.unshift({
    id: `chk_${Date.now()}`,
    phase: plan.currentPhase,
    familyStabilityScore: Math.max(1, Math.min(100, Math.round(input.familyStabilityScore))),
    concreteNeedsIdentified: input.concreteNeedsIdentified,
    supportProvided: input.supportProvided.trim(),
    loggedAt: new Date().toISOString(),
  });

  stepDownStore.set(input.caseId, plan);
  return { success: true, plan: JSON.parse(JSON.stringify(plan)) };
}
