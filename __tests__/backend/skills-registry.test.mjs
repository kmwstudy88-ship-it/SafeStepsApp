import { describe, expect, test } from '@jest/globals';
import {
  SKILL_GROUPS,
  SKILLS,
  getSkill,
  listSkills,
  listSkillsByGroup,
} from '../../backend/skills/registry.js';

describe('skills registry', () => {
  test('defines five core skill groups', () => {
    expect(Object.values(SKILL_GROUPS)).toEqual([
      'document_intelligence',
      'workflow_action',
      'communication_deescalation',
      'child_safe_interaction',
      'compliance_safeguarding',
    ]);
  });

  test('registers exactly 27 skills across all groups', () => {
    const skills = listSkills();
    expect(skills).toHaveLength(27);
    expect(SKILLS).toHaveLength(27);
  });

  test('contains 8 document intelligence skills with proper metadata', () => {
    const docSkills = listSkillsByGroup(SKILL_GROUPS.document_intelligence);
    expect(docSkills).toHaveLength(8);

    const ids = docSkills.map((s) => s.id);
    expect(ids).toEqual([
      'fairness_detection',
      'contradiction_detection',
      'evidence_extraction',
      'requirement_extraction',
      'timeline_extraction',
      'risk_assessment',
      'concern_classification',
      'unrealistic_expectation_detection',
    ]);

    for (const skill of docSkills) {
      expect(skill.group).toBe(SKILL_GROUPS.document_intelligence);
      expect(skill.description).toBeTruthy();
      expect(skill.input).toBeDefined();
      expect(skill.output).toBeDefined();
      expect(skill.integrations).toBeDefined();
    }
  });

  test('getSkill looks up skills by identifier and handles missing skills', () => {
    const fairness = getSkill('fairness_detection');
    expect(fairness).toBeDefined();
    expect(fairness.id).toBe('fairness_detection');

    expect(getSkill('non_existent_skill')).toBeNull();
    expect(getSkill(null)).toBeNull();
    expect(getSkill('')).toBeNull();
    expect(getSkill('behavior_message_interpretation').id).toBe('behaviour_message_interpretation');
    expect(getSkill('disclosure_sensitive_handling').id).toBe('disclosure_sensitive');
  });

  test('verifies each skill group has registered skills', () => {
    for (const group of Object.values(SKILL_GROUPS)) {
      const skillsInGroup = listSkillsByGroup(group);
      expect(skillsInGroup.length).toBeGreaterThan(0);
    }
  });
});
