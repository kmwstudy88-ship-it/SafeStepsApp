import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { SKILL_GROUPS, listSkills, listSkillsByGroup, getSkill } = require('../../backend/skills/registry.js');

test('registry includes all requested skill groups', () => {
  assert.deepEqual(Object.keys(SKILL_GROUPS).sort(), [
    'child_safe_interaction',
    'communication_deescalation',
    'compliance_safeguarding',
    'document_intelligence',
    'workflow_action',
  ]);
});

test('registry contains requested capabilities with metadata and integrations', () => {
  const all = listSkills();
  assert.ok(all.length >= 27);

  const required = [
    'fairness_detection',
    'contradiction_detection',
    'evidence_extraction',
    'requirement_extraction',
    'timeline_extraction',
    'risk_assessment',
    'concern_classification',
    'unrealistic_expectation_detection',
    'case_packet_builder',
    'multi_document_comparison',
    'case_update',
    'escalation',
    'follow_up_scheduling',
    'trauma_informed_communication',
    'emotion_labeling',
    'guided_discovery',
    'behavior_message_interpretation',
    'de_escalation_strategy',
    'child_safe_conversation',
    'disclosure_sensitive_handling',
    'developmental_appropriateness',
    'safety_planning',
    'boundary_privacy',
    'child_safe_standards_compliance',
    'bias_discrimination_detection',
    'cultural_safety',
    'policy_interpretation',
  ];

  for (const skillId of required) {
    const skill = getSkill(skillId);
    assert.ok(skill, `missing ${skillId}`);
    assert.equal(typeof skill.description, 'string');
    assert.equal(typeof skill.integrations?.primary, 'string');
  }

  assert.equal(listSkillsByGroup(SKILL_GROUPS.workflow_action).length, 5);
});
