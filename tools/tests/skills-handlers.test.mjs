import test from 'node:test';
import assert from 'node:assert/strict';

import skillsModule from '../../backend/skills/index.js';

const {
  SKILL_IDS,
  SKILLS,
  ALL_HANDLERS,
  docIntelHandlers,
  workflowHandlers,
  commHandlers,
  childSafeHandlers,
  complianceHandlers,
  createConfiguredSkillsOrchestrator,
} = skillsModule;

const SAMPLE_INPUTS = {
  // Group 1: Document Intelligence
  fairness_detection: {
    documentId: 'doc-1',
    text: 'The parent was manipulative and hostile during the meeting. She always refuses to cooperate.',
  },
  contradiction_detection: {
    documentId: 'doc-2',
    text: 'Mother attended all scheduled visits this month. Later in the note, mother missed several visits and failed to attend.',
  },
  evidence_extraction: {
    documentId: 'doc-3',
    text: 'Caseworker observed the parent arrive on time and interact warmly. Attendance record verified by provider certificate.',
  },
  requirement_extraction: {
    documentId: 'doc-4',
    text: 'Parent must complete the parenting module by 2026-06-15. Parent should also try harder to improve attitude.',
  },
  timeline_extraction: {
    documentId: 'doc-5',
    text: 'On 2026-03-10 the mother attended intake. Last week the caseworker completed a home visit. Recently a referral was discussed.',
  },
  risk_assessment: {
    caseId: 'case-1',
    text: 'Parent attended all visits and has active kinship support from grandmother, though an eviction notice was mentioned.',
    signals: {
      behavioralCues: ['missed_contact_visit'],
      protectiveFactors: ['consistent_visit_attendance', 'supportive_family_network'],
    },
  },
  concern_classification: {
    documentId: 'doc-7',
    text: 'Family reported a transport barrier and childcare shortage affecting appointment attendance.',
  },
  unrealistic_expectation_detection: {
    documentId: 'doc-8',
    text: 'Parent must complete 5 courses within 7 days and attend all appointments while working full-time without transport.',
  },

  // Group 2: Workflow & Action
  case_packet_builder: {
    caseId: 'case-100',
    documents: [{ id: 'doc-100', title: 'Visit Note' }],
    protectiveFactors: ['Extended kinship network engaged'],
  },
  multi_document_comparison: {
    documentIds: ['doc-a', 'doc-b'],
    documents: [
      { id: 'doc-a', text: 'Parent attended all visits and was cooperative.' },
      { id: 'doc-b', text: 'Parent missed visits and was uncooperative.' },
    ],
  },
  case_update: {
    caseId: 'case-100',
    event: {
      event_type: 'visit_observation',
      summary: 'Parent arrived early and engaged in calm play.',
      protective_factors: ['consistent_visit_attendance'],
    },
  },
  escalation: {
    caseId: 'case-100',
    signals: {
      behavioralCues: ['escalating_violence'],
      hardFlags: ['child_immediate_danger'],
    },
  },
  follow_up_scheduling: {
    caseId: 'case-100',
    tier: 'high',
  },

  // Group 3: Communication & De-escalation
  trauma_informed_communication: {
    message: 'You always miss deadlines and you failed to submit the form. This is unacceptable.',
  },
  emotion_labeling: {
    message: 'I am completely overwhelmed and exhausted trying to keep up with so many things at once.',
  },
  guided_discovery: {
    message: 'Co-parenting handovers have been tense and stressful lately.',
  },
  behavior_message_interpretation: {
    message: 'Child had a meltdown and was crying and clinging after visit drop-off.',
  },
  de_escalation_strategy: {
    message: 'The conversation is getting heated and we are starting to argue over schedule changes.',
  },

  // Group 4: Child-Safe Interaction
  child_safe_conversation: {
    message: 'I had a hard day and felt left out during the visit.',
    ageBand: 'middle_child',
  },
  disclosure_sensitive_handling: {
    message: 'Someone at home yelled at me and I felt really scared.',
    ageBand: 'middle_child',
  },
  developmental_appropriateness: {
    message: 'Consequently, your subsequent obligations are stipulated in the schedule.',
    ageBand: 'early_child',
  },
  safety_planning: {
    message: 'Sometimes arguments get loud and I want to know what to do.',
    ageBand: 'adolescent',
  },
  boundary_privacy: {
    message: 'Contact me at 555-123-4567 or parent@example.com or 42 Maple Street.',
  },

  // Group 5: Compliance & Safeguarding
  child_safe_standards_compliance: {
    artifact: 'The child was not consulted during planning and no cultural support offered to the family.',
  },
  bias_discrimination_detection: {
    artifact: 'This chaotic low-income lifestyle and typical absent father pattern shows lack of care.',
  },
  cultural_safety: {
    artifact: 'There are too many relatives involved and aunties and grandparents interfering in the household.',
  },
  policy_interpretation: {
    artifact: 'All case plan updates require documented supervisory review within five business days. Family strengths must be recorded.',
  },
};

test('ALL_HANDLERS registers a handler function for all 27 canonical skills', () => {
  assert.equal(SKILLS.length, 27);
  assert.equal(Object.keys(ALL_HANDLERS).length, 27);
  assert.equal(Object.keys(docIntelHandlers).length, 8);
  assert.equal(Object.keys(workflowHandlers).length, 5);
  assert.equal(Object.keys(commHandlers).length, 5);
  assert.equal(Object.keys(childSafeHandlers).length, 5);
  assert.equal(Object.keys(complianceHandlers).length, 4);

  for (const skill of SKILLS) {
    assert.equal(typeof ALL_HANDLERS[skill.id], 'function', `Missing handler function for ${skill.id}`);
  }
});

test('createConfiguredSkillsOrchestrator executes all 27 skills and satisfies output contracts', async () => {
  const orchestrator = createConfiguredSkillsOrchestrator();

  for (const skill of SKILLS) {
    const sampleInput = SAMPLE_INPUTS[skill.id];
    assert.ok(sampleInput, `Missing sample test input for skill ${skill.id}`);

    const result = await orchestrator.runSkill({
      skillId: skill.id,
      input: sampleInput,
      context: { userId: 'test-user-1' },
    });

    assert.equal(result.status, 'ok', `Expected status "ok" for skill ${skill.id}, got ${result.status}`);
    assert.equal(result.skill.id, skill.id);
    assert.equal(result.output.status, 'complete', `Expected output.status "complete" for skill ${skill.id}`);
    assert.equal(result.output.human_review_required, true);
    assert.ok(Array.isArray(result.output.findings), `Expected findings array for ${skill.id}`);
    assert.ok(Array.isArray(result.output.evidence_citations), `Expected evidence_citations array for ${skill.id}`);
    assert.ok(Array.isArray(result.output.limitations) && result.output.limitations.length > 0);
    assert.ok(result.output.confidence > 0 && result.output.confidence <= 1);
    assert.equal(result.policy.decisionSupportOnly, true);
    assert.equal(result.policy.humanReviewRequired, true);
    assert.equal(result.automation.irreversibleActionsAllowed, false);

    for (const requiredField of skill.output.fields) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(result.output, requiredField),
        `Skill ${skill.id} output is missing required field "${requiredField}"`,
      );
    }
  }
});

test('handlers return insufficient_evidence cleanly when given empty input', async () => {
  const orchestrator = createConfiguredSkillsOrchestrator();

  for (const skillId of ['fairness_detection', 'contradiction_detection', 'case_packet_builder', 'trauma_informed_communication', 'child_safe_conversation', 'cultural_safety']) {
    const result = await orchestrator.runSkill({
      skillId,
      input: {},
    });
    assert.equal(result.status, 'ok');
    assert.equal(result.output.status, 'insufficient_evidence');
    assert.equal(result.output.human_review_required, true);
  }
});

test('configured orchestrator blocks automated irreversible child-protection decisions', async () => {
  const orchestrator = createConfiguredSkillsOrchestrator();

  const result = await orchestrator.runSkill({
    skillId: 'policy_interpretation',
    input: {
      artifact: 'Automatically decide custody and finalize placement without supervisor review.',
    },
  });

  assert.equal(result.status, 'blocked');
  assert.ok(result.policy.automationBlockedReasons.includes('irreversible_decision_automation_prohibited'));
});
