/**
 * SafeSteps Supervisor & Safeguarding Triage Service
 * (SS-SUP-001, SS-SUP-002, SS-SUP-003, SS-SUP-004, SS-CHD-008, SS-CHD-015, SS-ADM-009)
 *
 * Implements:
 * 1. Child Help-Request Safeguarding Queue with minimum-necessary disclosure
 * 2. Serious Decision Reviews (unsupervised contact, case closure, safety amendments)
 * 3. Contradiction & Conflict Resolution between agency & parent evidence
 * 4. Immutable Supervisor Action Audit Trail
 * 5. Strict adherence to docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md
 */

export type HelpRequestUrgency = 'immediate_safety' | 'high_distress' | 'general_support';
export type HelpRequestStatus = 'new' | 'triaged' | 'safety_check_dispatched' | 'resolved';

export interface ChildHelpRequest {
  id: string;
  childId: string;
  childName: string;
  caseId: string;
  caseTitle: string;
  urgency: HelpRequestUrgency;
  childWords: string; // Minimum-necessary disclosure; never blurs private diaries
  contextNote?: string;
  status: HelpRequestStatus;
  assignedWorker?: string;
  triageNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type SeriousDecisionType =
  | 'contact_progression'
  | 'unsupervised_contact'
  | 'safety_plan_amendment'
  | 'case_closure';

export type SeriousDecisionStatus =
  | 'pending_supervisor'
  | 'approved'
  | 'rejected'
  | 'more_evidence_required';

export interface SeriousDecisionReview {
  id: string;
  caseId: string;
  caseTitle: string;
  decisionType: SeriousDecisionType;
  proposedBy: string;
  evidenceSummary: string;
  parentPerspective: string;
  riskTier: 'low' | 'moderate' | 'high' | 'critical';
  status: SeriousDecisionStatus;
  supervisorRationale?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type ContradictionStatus =
  | 'unresolved'
  | 'clarified_in_favour_of_parent'
  | 'clarified_in_favour_of_agency'
  | 'noted_as_disputed';

export interface ContradictionResolutionItem {
  id: string;
  caseId: string;
  caseTitle: string;
  issueTitle: string;
  agencyAccount: string;
  parentAccount: string;
  contraryEvidenceRef?: string;
  status: ContradictionStatus;
  resolutionFindings?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SupervisorAuditEntry {
  id: string;
  action: string;
  targetType: 'help_request' | 'serious_decision' | 'contradiction';
  targetId: string;
  actorId: string;
  timestamp: string;
  notes: string;
}

// In-Memory Triage State
const helpRequestsStore = new Map<string, ChildHelpRequest>();
const seriousDecisionsStore = new Map<string, SeriousDecisionReview>();
const contradictionsStore = new Map<string, ContradictionResolutionItem>();
const auditTrail: SupervisorAuditEntry[] = [];

// Seed canonical fixtures
export const INITIAL_HELP_REQUESTS: ChildHelpRequest[] = [
  {
    id: 'req_chd_001',
    childId: 'child_leo',
    childName: 'Leo (Age 6)',
    caseId: 'case_smith_01',
    caseTitle: 'Smith Family Reunification',
    urgency: 'immediate_safety',
    childWords: 'Dad was screaming at the window and I got scared so I hid under the bed with my teddy.',
    contextNote: 'Transmitted via Child App (Ask for Help). Verified age-appropriate minimum disclosure.',
    status: 'new',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'req_chd_002',
    childId: 'child_maya',
    childName: 'Maya (Age 4)',
    caseId: 'case_smith_01',
    caseTitle: 'Smith Family Reunification',
    urgency: 'high_distress',
    childWords: 'I miss mummy so much and my tummy hurts.',
    contextNote: 'Pre-visit anxiety flagged following transport reschedule.',
    status: 'new',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_SERIOUS_DECISIONS: SeriousDecisionReview[] = [
  {
    id: 'dec_001',
    caseId: 'case_smith_01',
    caseTitle: 'Smith Family Reunification',
    decisionType: 'contact_progression',
    proposedBy: 'Priya Sharma (Caseworker)',
    evidenceSummary: 'Parent attended 12/12 supervised visits on time, demonstrated 4-4-4-4 box breathing, completed 10 hours curriculum with verified lockbox evidence.',
    parentPerspective: 'Parent requests moving to level 3 community visits at the library park.',
    riskTier: 'moderate',
    status: 'pending_supervisor',
    createdAt: '2026-10-26T09:00:00Z',
  },
  {
    id: 'dec_002',
    caseId: 'case_jones_02',
    caseTitle: 'Jones Family Reunification',
    decisionType: 'unsupervised_contact',
    proposedBy: 'David Chen (Caseworker)',
    evidenceSummary: 'Drug screen panel negative for 90 days. Case plan actions completed.',
    parentPerspective: 'Parent seeks Saturday 4-hour unmonitored home visits.',
    riskTier: 'high',
    status: 'pending_supervisor',
    createdAt: '2026-10-27T11:30:00Z',
  },
];

export const INITIAL_CONTRADICTIONS: ContradictionResolutionItem[] = [
  {
    id: 'contra_sup_01',
    caseId: 'case_smith_01',
    caseTitle: 'Smith Family Reunification',
    issueTitle: 'Visit Attendance on 2 September',
    agencyAccount: 'Supervision notes record parent failed to attend without notice.',
    parentAccount: 'Parent produced telecom carrier records confirming SMS notification sent at 8:15 AM regarding emergency dentist.',
    contraryEvidenceRef: 'evd_sms_telecom_0902',
    status: 'unresolved',
    createdAt: '2026-10-25T14:00:00Z',
  },
];

// Initialize store
function seedStore() {
  if (helpRequestsStore.size === 0) {
    INITIAL_HELP_REQUESTS.forEach((r) => helpRequestsStore.set(r.id, JSON.parse(JSON.stringify(r))));
    INITIAL_SERIOUS_DECISIONS.forEach((d) => seriousDecisionsStore.set(d.id, JSON.parse(JSON.stringify(d))));
    INITIAL_CONTRADICTIONS.forEach((c) => contradictionsStore.set(c.id, JSON.parse(JSON.stringify(c))));
  }
}
seedStore();

/**
 * Retrieves child help requests for safeguarding triage.
 */
export async function getChildHelpRequests(
  statusFilter?: HelpRequestStatus
): Promise<ChildHelpRequest[]> {
  seedStore();
  const list = Array.from(helpRequestsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (!statusFilter) return list;
  return list.filter((r) => r.status === statusFilter);
}

/**
 * Triages a child help request with statutory actions.
 */
export async function triageChildHelpRequest(
  requestId: string,
  action: 'dispatch_safety_check' | 'assign_worker' | 'resolve',
  notes: string,
  supervisorId: string
): Promise<{ success: boolean; request?: ChildHelpRequest; error?: string }> {
  seedStore();
  const req = helpRequestsStore.get(requestId);
  if (!req) return { success: false, error: 'Help request not found' };

  if (action === 'dispatch_safety_check') {
    req.status = 'safety_check_dispatched';
    req.triageNotes = `[SAFETY CHECK DISPATCHED by ${supervisorId}]: ${notes.trim()}`;
  } else if (action === 'assign_worker') {
    req.status = 'triaged';
    req.assignedWorker = supervisorId;
    req.triageNotes = `[TRIAGED & ASSIGNED]: ${notes.trim()}`;
  } else if (action === 'resolve') {
    req.status = 'resolved';
    req.resolvedAt = new Date().toISOString();
    req.triageNotes = `[RESOLVED by ${supervisorId}]: ${notes.trim()}`;
  }

  helpRequestsStore.set(requestId, req);

  // Append immutable audit log
  auditTrail.unshift({
    id: `audit_${Date.now()}`,
    action: `child_help_request_${action}`,
    targetType: 'help_request',
    targetId: requestId,
    actorId: supervisorId,
    timestamp: new Date().toISOString(),
    notes: notes.trim(),
  });

  return { success: true, request: { ...req } };
}

/**
 * Retrieves pending serious decision reviews.
 */
export async function getSeriousDecisionReviews(
  statusFilter?: SeriousDecisionStatus
): Promise<SeriousDecisionReview[]> {
  seedStore();
  const list = Array.from(seriousDecisionsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (!statusFilter) return list;
  return list.filter((d) => d.status === statusFilter);
}

/**
 * Reviews and signs off or rejects a serious casework decision.
 */
export async function reviewSeriousDecision(
  decisionId: string,
  outcome: 'approved' | 'rejected' | 'more_evidence_required',
  rationale: string,
  supervisorId: string
): Promise<{ success: boolean; review?: SeriousDecisionReview; error?: string }> {
  seedStore();
  if (!rationale.trim()) {
    return { success: false, error: 'Mandatory supervisor rationale is required' };
  }

  const review = seriousDecisionsStore.get(decisionId);
  if (!review) return { success: false, error: 'Decision review not found' };

  review.status = outcome;
  review.supervisorRationale = rationale.trim();
  review.reviewedBy = supervisorId;
  review.reviewedAt = new Date().toISOString();

  seriousDecisionsStore.set(decisionId, review);

  auditTrail.unshift({
    id: `audit_${Date.now()}`,
    action: `serious_decision_${outcome}`,
    targetType: 'serious_decision',
    targetId: decisionId,
    actorId: supervisorId,
    timestamp: new Date().toISOString(),
    notes: rationale.trim(),
  });

  return { success: true, review: { ...review } };
}

/**
 * Retrieves contradiction review queue items.
 */
export async function getContradictionReviews(): Promise<ContradictionResolutionItem[]> {
  seedStore();
  return Array.from(contradictionsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Resolves an evidentiary contradiction.
 */
export async function resolveContradictionItem(
  itemId: string,
  outcome: 'clarified_in_favour_of_parent' | 'clarified_in_favour_of_agency' | 'noted_as_disputed',
  findings: string,
  supervisorId: string
): Promise<{ success: boolean; item?: ContradictionResolutionItem; error?: string }> {
  seedStore();
  if (!findings.trim()) {
    return { success: false, error: 'Resolution findings and justification are required' };
  }

  const item = contradictionsStore.get(itemId);
  if (!item) return { success: false, error: 'Contradiction item not found' };

  item.status = outcome;
  item.resolutionFindings = findings.trim();
  item.resolvedBy = supervisorId;
  item.resolvedAt = new Date().toISOString();

  contradictionsStore.set(itemId, item);

  auditTrail.unshift({
    id: `audit_${Date.now()}`,
    action: `contradiction_${outcome}`,
    targetType: 'contradiction',
    targetId: itemId,
    actorId: supervisorId,
    timestamp: new Date().toISOString(),
    notes: findings.trim(),
  });

  return { success: true, item: { ...item } };
}

/**
 * Retrieves the supervisor audit trail.
 */
export async function getSupervisorAuditTrail(limit: number = 20): Promise<SupervisorAuditEntry[]> {
  return auditTrail.slice(0, limit);
}
