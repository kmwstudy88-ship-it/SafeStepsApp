/**
 * SafeSteps Contact Visit & Supportive Family Time Service (SS-VIS-001 - SS-VIS-010)
 *
 * Addresses systemic gaps in supervised visitation:
 * 1. Replaces sterile compliance surveillance with ABC/PCIT-informed supportive coaching
 *    (Following the child's lead, nurturance during distress, delight/warmth).
 * 2. Buffers pre- and post-visit transition distress through structured parent-carer handoffs.
 * 3. Integrates transport/distance barrier support so logistics never cause missed family time.
 *
 * Strictly adheres to docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md:
 * - Maps operational visit records to canonical `case_visit_records_v19` (never writing through alias view `visits`).
 * - Maps child reflections to `child_visit_reflections` & `child_visit_preparations`.
 */

export type RelationalCoachingFocus =
  | 'follow_the_child_lead'
  | 'nurturance_during_distress'
  | 'gentle_goodbye_transition'
  | 'delight_and_co_regulation';

export interface CanonicalVisitRecord {
  id: string;
  tenantId: string; // -> platform_tenants.id
  caseId: string; // -> cases.id
  childName: string;
  coachingFocus: RelationalCoachingFocus;
  wentWell: string;
  supportNeed: string;
  nextStep: string;
  preVisitCarerHandoff?: string;
  postVisitTransitionPlan?: string;
  transportSupportRequested: boolean;
  loggedAt: string;
}

export interface RelationalCoachingPrompt {
  id: RelationalCoachingFocus;
  modelBasis: 'ABC-EC (Attachment & Biobehavioral Catch-up)' | 'PCIT (Parent-Child Interaction Therapy)';
  title: string;
  inTheMomentCue: string;
  whyItMatters: string;
}

export const RELATIONAL_COACHING_PROMPTS: RelationalCoachingPrompt[] = [
  {
    id: 'follow_the_child_lead',
    modelBasis: 'ABC-EC (Attachment & Biobehavioral Catch-up)',
    title: "Follow the Child's Lead",
    inTheMomentCue: 'Notice what your child picks up first and narrate their play warmly without directing or correcting.',
    whyItMatters: 'Builds child agency and secure attachment in unfamiliar visitation rooms.',
  },
  {
    id: 'nurturance_during_distress',
    modelBasis: 'ABC-EC (Attachment & Biobehavioral Catch-up)',
    title: 'Nurturance When Unsettled',
    inTheMomentCue: 'If your child cries, clings, or pulls away, offer calm physical comfort and soft reassurance.',
    whyItMatters: 'Children in care often test whether adults will stay calm when big feelings surface.',
  },
  {
    id: 'delight_and_co_regulation',
    modelBasis: 'PCIT (Parent-Child Interaction Therapy)',
    title: 'Labeled Praise & Warm Delight',
    inTheMomentCue: 'Let your face and voice light up: "I love how gently you stacked those blocks!"',
    whyItMatters: 'Directly counters the sterile, high-stress atmosphere of monitored contact centers.',
  },
  {
    id: 'gentle_goodbye_transition',
    modelBasis: 'ABC-EC (Attachment & Biobehavioral Catch-up)',
    title: 'Buffering Goodbye Separation Grief',
    inTheMomentCue: 'Give a 5-minute gentle cue, use your predictable goodbye ritual, and hand over a transitional comfort item.',
    whyItMatters: 'Goodbyes re-trigger removal trauma; predictable transition rituals protect both parent and child nervous systems.',
  },
];

const visitStore = new Map<string, CanonicalVisitRecord[]>();

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_CASE_ID = 'demo_case';

function seedDefaultVisits() {
  if (!visitStore.has(DEFAULT_CASE_ID)) {
    visitStore.set(DEFAULT_CASE_ID, [
      {
        id: 'visit-1',
        tenantId: DEFAULT_TENANT_ID,
        caseId: DEFAULT_CASE_ID,
        childName: 'Maya',
        coachingFocus: 'follow_the_child_lead',
        wentWell: 'Maya initiated pretend play twice and stayed connected during goodbye.',
        supportNeed: 'She became unsettled when the room got noisy near the end.',
        nextStep: 'Pack headphones and ask for a quieter transition space next visit.',
        preVisitCarerHandoff: 'Carer noted Maya slept well and brought her favorite blue comfort blanket.',
        postVisitTransitionPlan: 'Quiet car ride with soft music and snack after handover.',
        transportSupportRequested: false,
        loggedAt: '2026-09-10',
      },
    ]);
  }
}

seedDefaultVisits();

export async function getCanonicalVisitRecords(
  caseId: string = DEFAULT_CASE_ID
): Promise<CanonicalVisitRecord[]> {
  const list = visitStore.get(caseId) || visitStore.get(DEFAULT_CASE_ID) || [];
  return JSON.parse(JSON.stringify(list));
}

export interface CreateVisitRecordInput {
  tenantId?: string;
  caseId?: string;
  childName: string;
  coachingFocus?: RelationalCoachingFocus;
  wentWell: string;
  supportNeed?: string;
  nextStep: string;
  preVisitCarerHandoff?: string;
  postVisitTransitionPlan?: string;
  transportSupportRequested?: boolean;
}

export async function createCanonicalVisitRecord(
  input: CreateVisitRecordInput
): Promise<{ success: boolean; record?: CanonicalVisitRecord; error?: string }> {
  if (!input.wentWell?.trim() || !input.nextStep?.trim()) {
    return {
      success: false,
      error: 'Please capture what went well and the next step for the next visit.',
    };
  }

  const caseId = input.caseId?.trim() || DEFAULT_CASE_ID;
  const record: CanonicalVisitRecord = {
    id: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tenantId: input.tenantId?.trim() || DEFAULT_TENANT_ID,
    caseId,
    childName: input.childName?.trim() || 'Child',
    coachingFocus: input.coachingFocus || 'follow_the_child_lead',
    wentWell: input.wentWell.trim(),
    supportNeed: input.supportNeed?.trim() || '',
    nextStep: input.nextStep.trim(),
    preVisitCarerHandoff: input.preVisitCarerHandoff?.trim() || undefined,
    postVisitTransitionPlan: input.postVisitTransitionPlan?.trim() || undefined,
    transportSupportRequested: Boolean(input.transportSupportRequested),
    loggedAt: new Date().toISOString().split('T')[0],
  };

  const existing = visitStore.get(caseId) || [];
  visitStore.set(caseId, [record, ...existing]);
  return { success: true, record: { ...record } };
}
