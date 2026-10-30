/**
 * SafeSteps Safety Plan Service (SS-AIC-027, SS-SAF-001)
 *
 * Implements:
 * 1. Offline support toolkit with practical safety plan steps
 * 2. Warning signs, safe places, go-bag checklist, trusted contacts, child steps
 * 3. Verified 24/7 Australian crisis helplines
 * 4. Strict adherence to docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md
 */

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isQuickDial: boolean;
}

export interface PostReunificationStepDownSafetySection {
  activePhase: 'months_1_3_intensive' | 'months_4_6_transitional' | 'months_7_12_community_sustained';
  parentPartnerMentorName: string;
  parentPartnerMentorPhone: string;
  childcareAndRespitePlan: string;
  nonPunitiveEarlyHelpAttestation: boolean;
}

export interface SafetyPlan {
  id: string;
  caseId: string;
  userId: string;
  warningSigns: string;
  safePlace: string;
  goBagEssentials: string;
  trustedContacts: TrustedContact[];
  childSteps: string;
  codeWord?: string;
  emergencyPlanActive: boolean;
  postReunificationStepDownSection?: PostReunificationStepDownSafetySection;
  lastUpdated: string;
}

export const DEFAULT_MOCK_SAFETY_PLAN: SafetyPlan = {
  id: 'plan_demo_01',
  caseId: 'demo_case',
  userId: 'user_parent_01',
  warningSigns: 'Raised voice in driveway, repeated demanding messages, child becoming clingy and watchful before transitions.',
  safePlace: "Neighbour Joanne's unit (flat 4B) and the community centre family room.",
  goBagEssentials: 'Prescription asthma inhalers, phone charger, spare house keys, Medicare cards, Leo comfort teddy.',
  trustedContacts: [
    {
      id: 'c1',
      name: 'Joanne (Neighbour)',
      phone: '0400 222 111',
      relationship: 'Neighbour / Trusted Safe House',
      isQuickDial: true,
    },
    {
      id: 'c2',
      name: 'Priya Sharma (CSO)',
      phone: '0400 555 222',
      relationship: 'Caseworker',
      isQuickDial: true,
    },
    {
      id: 'c3',
      name: '1800RESPECT',
      phone: '1800 737 732',
      relationship: 'National DFV Helpline (24/7)',
      isQuickDial: true,
    },
  ],
  childSteps: 'Look for the blue backpack cue, walk calmly to the front gate, wait with Joanne until safe.',
  codeWord: 'Blueberry',
  emergencyPlanActive: false,
  postReunificationStepDownSection: {
    activePhase: 'months_1_3_intensive',
    parentPartnerMentorName: 'Tanya Williams (Certified Parent Partner)',
    parentPartnerMentorPhone: '0422 888 444',
    childcareAndRespitePlan: 'Subsidized community childcare (Mon-Thu) + Maternal Grandmother weekend respite.',
    nonPunitiveEarlyHelpAttestation: true,
  },
  lastUpdated: new Date().toISOString(),
};

const safetyPlanStore = new Map<string, SafetyPlan>();
safetyPlanStore.set('demo_case', JSON.parse(JSON.stringify(DEFAULT_MOCK_SAFETY_PLAN)));

/**
 * Retrieves the safety plan for a case.
 */
export async function getSafetyPlan(caseId: string): Promise<SafetyPlan> {
  const plan = safetyPlanStore.get(caseId) || safetyPlanStore.get('demo_case')!;
  return JSON.parse(JSON.stringify(plan));
}

/**
 * Updates the safety plan.
 */
export async function updateSafetyPlan(
  caseId: string,
  updates: Partial<Omit<SafetyPlan, 'id' | 'caseId' | 'userId' | 'lastUpdated'>>
): Promise<{ success: boolean; plan?: SafetyPlan; error?: string }> {
  const plan = safetyPlanStore.get(caseId) || safetyPlanStore.get('demo_case')!;
  
  const updatedPlan: SafetyPlan = {
    ...plan,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  safetyPlanStore.set(caseId, updatedPlan);
  return { success: true, plan: JSON.parse(JSON.stringify(updatedPlan)) };
}

/**
 * Adds a trusted contact to the safety plan.
 */
export async function addTrustedContact(
  caseId: string,
  contact: Omit<TrustedContact, 'id'>
): Promise<{ success: boolean; contact?: TrustedContact; error?: string }> {
  if (!contact.name.trim() || !contact.phone.trim()) {
    return { success: false, error: 'Name and phone number are required' };
  }

  const plan = safetyPlanStore.get(caseId) || safetyPlanStore.get('demo_case')!;
  const newContact: TrustedContact = {
    id: `contact_${Date.now()}`,
    ...contact,
  };

  plan.trustedContacts.push(newContact);
  plan.lastUpdated = new Date().toISOString();
  safetyPlanStore.set(caseId, plan);

  return { success: true, contact: newContact };
}

/**
 * Formats a plain-text version of the safety plan for quick offline printing or SMS sharing.
 */
export function formatSafetyPlanSummary(plan: SafetyPlan): string {
  const contactsText = plan.trustedContacts
    .map((c) => `- ${c.name} (${c.relationship}): ${c.phone}`)
    .join('\n');

  const stepDownText = plan.postReunificationStepDownSection
    ? `\n12-MONTH POST-REUNIFICATION STEP-DOWN & SAFE HARBOR:
- Phase: ${plan.postReunificationStepDownSection.activePhase}
- Parent Partner Peer Mentor: ${plan.postReunificationStepDownSection.parentPartnerMentorName} (${plan.postReunificationStepDownSection.parentPartnerMentorPhone})
- Childcare & Respite Buffer: ${plan.postReunificationStepDownSection.childcareAndRespitePlan}
- Non-Punitive Safe Harbor: ${
        plan.postReunificationStepDownSection.nonPunitiveEarlyHelpAttestation
          ? 'ACTIVE — Requesting concrete or respite support is treated as protective early help, never automatic re-removal.'
          : 'Pending'
      }\n`
    : '';

  return `SAFESTEPS SAFETY PLAN (Updated: ${plan.lastUpdated.split('T')[0]})
--------------------------------------------------
WARNING SIGNS:
${plan.warningSigns}

SAFE HAVEN / EXIT LOCATION:
${plan.safePlace}

GO-BAG ESSENTIALS:
${plan.goBagEssentials}

CHILD ACTION STEPS:
${plan.childSteps}
${plan.codeWord ? `Code Word: "${plan.codeWord}"` : ''}
${stepDownText}
TRUSTED CONTACTS & CRISIS HELPLINES:
${contactsText}
- Police & Emergency Services: 000 (24/7)
- Lifeline Crisis Support: 13 11 14 (24/7)
--------------------------------------------------`;
}
