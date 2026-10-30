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

test('bias_discrimination_detection and unrealistic_expectation_detection flag poverty-neglect conflation, kinship housing bias, and waitlist penalties', async () => {
  const orchestrator = createConfiguredSkillsOrchestrator();

  const biasRes = await orchestrator.runSkill({
    skillId: 'bias_discrimination_detection',
    input: {
      artifact:
        'Caseworker substantiated neglect due to utility shutoff and rejected kinship placement due to bedroom size.',
    },
    context: { userId: 'test-user-1' },
  });

  assert.equal(biasRes.status, 'ok');
  const categories = biasRes.output.bias_signals.map((b) => b.category);
  assert.ok(categories.includes('socioeconomic_or_poverty_bias'));
  assert.ok(categories.includes('kinship_licensing_disparity_bias'));

  const waitlistRes = await orchestrator.runSkill({
    skillId: 'unrealistic_expectation_detection',
    input: {
      documentId: 'doc-waitlist',
      text: 'Parent was marked non-compliant while on waiting list for trauma therapy and must complete therapy despite 12-week waitlist.',
    },
    context: { userId: 'test-user-1' },
  });

  assert.equal(waitlistRes.status, 'ok');
  assert.ok(waitlistRes.output.unrealistic_expectations.length >= 1);
  assert.match(waitlistRes.output.suggested_reframes[0].reframe, /Pause\/toll the statutory compliance clock/i);

  const riskRes = await orchestrator.runSkill({
    skillId: 'risk_assessment',
    input: {
      caseId: 'case-ecs-1',
      text: 'Parent engaged with a lived-experience parent partner and practiced labeled praise during ABC coaching, though an eviction notice was received.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(riskRes.status, 'ok');
  const protectiveFactors = riskRes.output.protective_signals.map((p) => p.factor);
  assert.ok(protectiveFactors.includes('parent_partner_peer_mentorship'));
  assert.ok(protectiveFactors.includes('abc_pcit_dyadic_coaching'));
  assert.ok(
    riskRes.output.uncertainties.some((u) => u.includes('Poverty != Neglect Safeguard')),
  );

  const packetRes = await orchestrator.runSkill({
    skillId: 'case_packet_builder',
    input: {
      caseId: 'case-ecs-1',
      documents: [{ id: 'doc-ecs-1', title: 'ECS & Step-Down Plan' }],
      protectiveFactors: ['Parent Partner engaged', '12-month step-down plan active'],
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(packetRes.status, 'ok');
  assert.ok(
    packetRes.output.packet_sections.some(
      (s) => s.section_id === 'structural_equity_ecs_and_step_down',
    ),
  );
  assert.ok(
    packetRes.output.human_review_queue.some(
      (q) => q.checkpoint_id === 'structural_equity_and_ecs_verification',
    ),
  );

  const concernRes = await orchestrator.runSkill({
    skillId: 'concern_classification',
    input: {
      documentId: 'doc-ecs-2',
      text: 'Family received an eviction notice and faces a provider waitlist for childcare.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(concernRes.status, 'ok');
  assert.ok(concernRes.output.concerns.some((c) => c.category === 'resource'));
  assert.ok(
    concernRes.output.triage_hints.some((h) => h.includes('Poverty != Neglect Safeguard')),
  );

  const fairnessRes = await orchestrator.runSkill({
    skillId: 'fairness_detection',
    input: {
      documentId: 'doc-fair-2',
      text: 'Mother failed to complete while waitlisted and was non-compliant due to poverty.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(fairnessRes.status, 'ok');
  assert.ok(
    fairnessRes.output.concerns.some((c) => c.category === 'systemic_barrier_blaming'),
  );

  const culturalRes = await orchestrator.runSkill({
    skillId: 'cultural_safety',
    input: {
      artifact: 'Father not contacted during intake and paternal relatives excluded from kinship review.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(culturalRes.status, 'ok');
  assert.ok(
    culturalRes.output.cultural_safety_concerns.some(
      (c) => c.issue === 'paternal_and_fatherhood_network_exclusion',
    ),
  );

  const stepDownRes = await orchestrator.runSkill({
    skillId: 'follow_up_scheduling',
    input: {
      caseId: 'case-step-down-1',
      tier: 'post_reunification_step_down',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(stepDownRes.status, 'ok');
  assert.equal(stepDownRes.output.tasks.length, 3);
  assert.ok(stepDownRes.output.tasks.some((t) => t.task_id === 'ecs_stability_checkin'));

  const reqRes = await orchestrator.runSkill({
    skillId: 'requirement_extraction',
    input: {
      documentId: 'doc-req-ecs',
      text: 'Parent must complete trauma counseling while waitlisted by 2026-08-01. Parent must purchase furniture at parent\'s expense by 2026-07-01.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(reqRes.status, 'ok');
  assert.ok(reqRes.output.obligations.some((o) => o.status_hint === 'tolled_by_waitlist'));
  assert.ok(
    reqRes.output.ambiguous_requirements.some((a) => a.includes('Poverty != Neglect Safeguard')),
  );

  const evRes = await orchestrator.runSkill({
    skillId: 'evidence_extraction',
    input: {
      documentId: 'doc-ev-barrier',
      text: 'Parent uploaded a waitlist confirmation and transit cancellation notice.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(evRes.status, 'ok');
  assert.ok(
    evRes.output.evidence_items.some((e) => e.evidence_type === 'systemic_barrier_proof'),
  );

  const behRes = await orchestrator.runSkill({
    skillId: 'behavior_message_interpretation',
    input: {
      message: 'Child was pushing away and acting tough during goodbye grief.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(behRes.status, 'ok');
  assert.ok(
    behRes.output.possible_meanings.some((m) => m.includes('ABC-EC Attachment Miscuing')),
  );

  const contraRes = await orchestrator.runSkill({
    skillId: 'contradiction_detection',
    input: {
      documentId: 'doc-contra-waitlist',
      text: 'Provider confirmed mother is on waiting list with no intake slots. Later the report states mother is non-compliant with program.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(contraRes.status, 'ok');
  assert.ok(
    contraRes.output.contradictions.some(
      (c) => c.topic === 'waitlist_vs_noncompliance_attribution',
    ),
  );

  const compRes = await orchestrator.runSkill({
    skillId: 'multi_document_comparison',
    input: {
      documentIds: ['doc-w1', 'doc-w2'],
      documents: [
        { id: 'doc-w1', text: 'Clinic letter confirms parent is waitlisted due to provider delay.' },
        { id: 'doc-w2', text: 'Case summary states parent was non-compliant with referral.' },
      ],
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(compRes.status, 'ok');
  assert.ok(
    compRes.output.contradictions.some(
      (c) => c.topic === 'waitlist_and_barrier_attribution',
    ),
  );

  const escRes = await orchestrator.runSkill({
    skillId: 'escalation',
    input: {
      caseId: 'case-esc-ecs',
      signals: {
        materialHardshipSignals: ['utility_shutoff_or_arrears', 'eviction_or_rent_arrears'],
        protectiveFactors: ['parent_partner_engaged'],
      },
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(escRes.status, 'ok');
  assert.ok(
    escRes.output.review_actions.some((a) => a.includes('Poverty != Neglect Safeguard')),
  );

  const updRes = await orchestrator.runSkill({
    skillId: 'case_update',
    input: {
      caseId: 'case-upd-ecs',
      event: {
        event_type: 'home_visit',
        summary: 'Parent requested utility assistance and reported provider waitlist delay.',
        material_hardship_factors: ['utility_shutoff_or_arrears'],
        structural_barriers: ['agency_service_waitlist'],
      },
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(updRes.status, 'ok');
  assert.ok(
    updRes.output.event_payload.structured_signals.material_hardship_signals.includes(
      'utility_shutoff_or_arrears',
    ),
  );
  assert.ok(
    updRes.output.event_payload.structured_signals.contact_mitigating_barriers.includes(
      'agency_service_waitlist',
    ),
  );
  assert.ok(
    updRes.output.review_notes.some((n) => n.includes('Poverty != Neglect Safeguard')),
  );

  const timeRes = await orchestrator.runSkill({
    skillId: 'timeline_extraction',
    input: {
      documentId: 'doc-time-waitlist',
      text: 'On 2026-04-01 the parent partner attended the meeting. Mother was placed on waitlist for therapy.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(timeRes.status, 'ok');
  assert.ok(timeRes.output.timeline_events[0].actors.includes('parent partner'));
  assert.ok(
    timeRes.output.chronology_gaps.some((g) => g.includes('compliance-clock tolling')),
  );

  const emoRes = await orchestrator.runSkill({
    skillId: 'emotion_labeling',
    input: {
      message: 'After the visit ended and saying goodbye, I am afraid to ask for help because it might be used against me.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(emoRes.status, 'ok');
  assert.ok(emoRes.output.labels.includes('post_visit_separation_grief'));
  assert.ok(emoRes.output.labels.includes('institutional_mistrust_or_fear'));

  const safePlanRes = await orchestrator.runSkill({
    skillId: 'safety_planning',
    input: {
      message: 'I feel nervous during visit goodbye and handover.',
      ageBand: 'middle_child',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(safePlanRes.status, 'ok');
  assert.ok(
    safePlanRes.output.plan_steps.some((s) => s.includes('transition comfort item')),
  );

  const deEscRes = await orchestrator.runSkill({
    skillId: 'de_escalation_strategy',
    input: {
      message: 'We are arguing about the visit handover time.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(deEscRes.status, 'ok');
  assert.ok(
    deEscRes.output.de_escalation_steps.some((s) => s.includes('Parent Partner')),
  );

  const discRes = await orchestrator.runSkill({
    skillId: 'disclosure_sensitive_handling',
    input: {
      message: 'The lights went out at home and the bus broke on the way to school.',
      ageBand: 'middle_child',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(discRes.status, 'ok');
  assert.equal(discRes.output.review_route.ecs_material_support_flag, true);
  assert.ok(
    discRes.output.review_route.handling_rules.some((r) => r.includes('Poverty != Neglect Safeguard')),
  );

  const devRes = await orchestrator.runSkill({
    skillId: 'developmental_appropriateness',
    input: {
      message: 'Let us play with blocks.',
      ageBand: 'early_child',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(devRes.status, 'ok');
  assert.ok(
    devRes.output.adaptations.some((a) => a.includes('PCIT PRIDE')),
  );

  const privRes = await orchestrator.runSkill({
    skillId: 'boundary_privacy',
    input: {
      message: 'Worker asked to share parent partner notes with court and report ecs request as neglect.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(privRes.status, 'ok');
  assert.ok(
    privRes.output.privacy_flags.some(
      (f) => f.data_type === 'confidential_peer_mentor_or_ecs_boundary',
    ),
  );

  const stdRes = await orchestrator.runSkill({
    skillId: 'child_safe_standards_compliance',
    input: {
      artifact: 'Agency cancelled visit as punishment and denied kinship stipend.',
    },
    context: { userId: 'test-user-1' },
  });
  assert.equal(stdRes.status, 'ok');
  assert.ok(
    stdRes.output.compliance_flags.some(
      (f) => f.standard === 'Supportive Family Time & Kinship Equity',
    ),
  );
});
