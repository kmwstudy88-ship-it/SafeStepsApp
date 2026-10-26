'use strict';

const SKILL_GROUPS = Object.freeze({
  document_intelligence: 'document_intelligence',
  workflow_action: 'workflow_action',
  communication_deescalation: 'communication_deescalation',
  child_safe_interaction: 'child_safe_interaction',
  compliance_safeguarding: 'compliance_safeguarding',
});

const SKILLS = Object.freeze([
  {
    id: 'fairness_detection',
    group: SKILL_GROUPS.document_intelligence,
    description: 'Flags fairness framing concerns and evidence-linked reframe opportunities.',
    input: { type: 'document_text', required: ['documentId', 'text'] },
    output: { type: 'decision_support_findings', fields: ['concerns', 'objective_reframes'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: false },
  },
  {
    id: 'contradiction_detection',
    group: SKILL_GROUPS.document_intelligence,
    description: 'Identifies materially inconsistent statements without adjudicating truth.',
    input: { type: 'document_text', required: ['documentId', 'text'] },
    output: { type: 'decision_support_findings', fields: ['contradictions', 'unresolved_questions'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: false },
  },
  {
    id: 'evidence_extraction',
    group: SKILL_GROUPS.document_intelligence,
    description: 'Extracts evidence-linked findings and evidence gaps from supplied records.',
    input: { type: 'document_text', required: ['documentId', 'text'] },
    output: { type: 'decision_support_findings', fields: ['evidence_items', 'evidence_gaps'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: true },
  },
  {
    id: 'requirement_extraction',
    group: SKILL_GROUPS.document_intelligence,
    description: 'Extracts obligations/requirements from plans, orders, and commitments.',
    input: { type: 'document_text', required: ['documentId', 'text'] },
    output: { type: 'decision_support_findings', fields: ['obligations', 'ambiguous_requirements'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: true },
  },
  {
    id: 'timeline_extraction',
    group: SKILL_GROUPS.document_intelligence,
    description: 'Builds chronology signals from dated references and event narratives.',
    input: { type: 'document_text', required: ['documentId', 'text'] },
    output: { type: 'decision_support_findings', fields: ['timeline_events', 'chronology_gaps'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: true },
  },
  {
    id: 'risk_assessment',
    group: SKILL_GROUPS.document_intelligence,
    description: 'Produces risk and protective-factor signals for Track C human-reviewed workflows.',
    input: { type: 'risk_signal_input', required: ['caseId', 'signals'] },
    output: { type: 'risk_signal_output', fields: ['risk_signals', 'protective_signals', 'uncertainties'] },
    integrations: { primary: 'cases/:id/recompute-risk', trackC: true },
  },
  {
    id: 'concern_classification',
    group: SKILL_GROUPS.document_intelligence,
    description: 'Classifies concern categories and triage hints for human review.',
    input: { type: 'document_text', required: ['documentId', 'text'] },
    output: { type: 'decision_support_findings', fields: ['concerns', 'triage_hints'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: true },
  },
  {
    id: 'unrealistic_expectation_detection',
    group: SKILL_GROUPS.document_intelligence,
    description: 'Flags unrealistic demands and provides child-safe, practical reframes.',
    input: { type: 'document_text', required: ['documentId', 'text'] },
    output: { type: 'decision_support_findings', fields: ['unrealistic_expectations', 'suggested_reframes'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: false },
  },
  {
    id: 'case_packet_builder',
    group: SKILL_GROUPS.workflow_action,
    description: 'Builds a reviewable case packet from canonical case/document/evidence records.',
    input: { type: 'case_context', required: ['caseId'] },
    output: { type: 'workflow_plan', fields: ['packet_sections', 'open_questions', 'human_review_queue'] },
    integrations: { primary: 'documents + analyses + case events', trackC: true },
  },
  {
    id: 'multi_document_comparison',
    group: SKILL_GROUPS.workflow_action,
    description: 'Compares multiple records while preserving uncertainty and evidence traceability.',
    input: { type: 'document_set', required: ['documentIds'] },
    output: { type: 'comparison_summary', fields: ['agreements', 'contradictions', 'evidence_gaps'] },
    integrations: { primary: 'documents/compare', trackC: false },
  },
  {
    id: 'case_update',
    group: SKILL_GROUPS.workflow_action,
    description: 'Generates structured case-event updates for worker/supervisor review.',
    input: { type: 'case_event_input', required: ['caseId', 'event'] },
    output: { type: 'case_event_output', fields: ['event_payload', 'review_notes'] },
    integrations: { primary: 'cases/:id/events', trackC: true },
  },
  {
    id: 'escalation',
    group: SKILL_GROUPS.workflow_action,
    description: 'Flags escalation pathways and required review checkpoints.',
    input: { type: 'escalation_input', required: ['caseId', 'signals'] },
    output: { type: 'escalation_output', fields: ['severity', 'rationale', 'review_actions'] },
    integrations: { primary: 'cases/:id/events + supervisor dashboard', trackC: true },
  },
  {
    id: 'follow_up_scheduling',
    group: SKILL_GROUPS.workflow_action,
    description: 'Creates follow-up scheduling recommendations aligned to Track C tiers/SLAs.',
    input: { type: 'follow_up_input', required: ['caseId', 'tier'] },
    output: { type: 'follow_up_output', fields: ['tasks', 'due_windows'] },
    integrations: { primary: 'case_follow_up_tasks', trackC: true },
  },
  {
    id: 'trauma_informed_communication',
    group: SKILL_GROUPS.communication_deescalation,
    description: 'Drafts trauma-informed communication with non-blaming language.',
    input: { type: 'communication_prompt', required: ['message'] },
    output: { type: 'communication_support', fields: ['rewrite', 'tone_notes'] },
    integrations: { primary: 'assistant guidance only', trackC: false },
  },
  {
    id: 'emotion_labeling',
    group: SKILL_GROUPS.communication_deescalation,
    description: 'Suggests emotion-labeling phrases that validate without pressure.',
    input: { type: 'communication_prompt', required: ['message'] },
    output: { type: 'communication_support', fields: ['labels', 'validation_phrases'] },
    integrations: { primary: 'assistant guidance only', trackC: false },
  },
  {
    id: 'guided_discovery',
    group: SKILL_GROUPS.communication_deescalation,
    description: 'Generates optional, non-leading guided-discovery questions.',
    input: { type: 'communication_prompt', required: ['message'] },
    output: { type: 'communication_support', fields: ['questions', 'opt_out_prompts'] },
    integrations: { primary: 'assistant guidance only', trackC: false },
  },
  {
    id: 'behavior_message_interpretation',
    group: SKILL_GROUPS.communication_deescalation,
    description: 'Interprets behavior-related messaging without diagnosis or legal conclusions.',
    input: { type: 'communication_prompt', required: ['message'] },
    output: { type: 'communication_support', fields: ['possible_meanings', 'uncertainties'] },
    integrations: { primary: 'assistant guidance only', trackC: false },
  },
  {
    id: 'de_escalation_strategy',
    group: SKILL_GROUPS.communication_deescalation,
    description: 'Proposes practical de-escalation next steps and pause options.',
    input: { type: 'communication_prompt', required: ['message'] },
    output: { type: 'communication_support', fields: ['de_escalation_steps', 'pause_options'] },
    integrations: { primary: 'assistant guidance only', trackC: false },
  },
  {
    id: 'child_safe_conversation',
    group: SKILL_GROUPS.child_safe_interaction,
    description: 'Keeps child-facing outputs age-appropriate and out of adult disputes.',
    input: { type: 'child_context_input', required: ['message'] },
    output: { type: 'child_safe_output', fields: ['child_safe_response', 'boundaries'] },
    integrations: { primary: 'personal-ai child-safe policy', trackC: false },
  },
  {
    id: 'disclosure_sensitive_handling',
    group: SKILL_GROUPS.child_safe_interaction,
    description: 'Handles sensitive disclosures with safety planning and human-review routing.',
    input: { type: 'child_context_input', required: ['message'] },
    output: { type: 'child_safe_output', fields: ['supportive_response', 'review_route'] },
    integrations: { primary: 'personal-ai child-safe policy', trackC: true },
  },
  {
    id: 'developmental_appropriateness',
    group: SKILL_GROUPS.child_safe_interaction,
    description: 'Checks and adapts language for developmental stage appropriateness.',
    input: { type: 'child_context_input', required: ['message'] },
    output: { type: 'child_safe_output', fields: ['age_band', 'adaptations'] },
    integrations: { primary: 'personal-ai child-safe policy', trackC: false },
  },
  {
    id: 'safety_planning',
    group: SKILL_GROUPS.child_safe_interaction,
    description: 'Generates reversible safety-planning prompts with immediate-review triggers.',
    input: { type: 'child_context_input', required: ['message'] },
    output: { type: 'child_safe_output', fields: ['plan_steps', 'escalation_flags'] },
    integrations: { primary: 'personal-ai child-safe policy + case events', trackC: true },
  },
  {
    id: 'boundary_privacy',
    group: SKILL_GROUPS.child_safe_interaction,
    description: 'Checks privacy and boundary protections, including minimization guidance.',
    input: { type: 'child_context_input', required: ['message'] },
    output: { type: 'child_safe_output', fields: ['privacy_flags', 'minimization_guidance'] },
    integrations: { primary: 'personal-ai child-safe policy', trackC: false },
  },
  {
    id: 'child_safe_standards_compliance',
    group: SKILL_GROUPS.compliance_safeguarding,
    description: 'Maps outputs to child-safe standards and safeguarding requirements.',
    input: { type: 'compliance_input', required: ['artifact'] },
    output: { type: 'compliance_output', fields: ['compliance_flags', 'review_requirements'] },
    integrations: { primary: 'policy interpretation + human review', trackC: true },
  },
  {
    id: 'bias_discrimination_detection',
    group: SKILL_GROUPS.compliance_safeguarding,
    description: 'Detects potential bias/discrimination language and reframe guidance.',
    input: { type: 'compliance_input', required: ['artifact'] },
    output: { type: 'compliance_output', fields: ['bias_signals', 'reframes'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: false },
  },
  {
    id: 'cultural_safety',
    group: SKILL_GROUPS.compliance_safeguarding,
    description: 'Flags cultural-safety concerns and safer alternatives.',
    input: { type: 'compliance_input', required: ['artifact'] },
    output: { type: 'compliance_output', fields: ['cultural_safety_concerns', 'alternatives'] },
    integrations: { primary: 'document-intelligence/analyze', trackC: false },
  },
  {
    id: 'policy_interpretation',
    group: SKILL_GROUPS.compliance_safeguarding,
    description: 'Summarizes policy obligations as decision-support with review checkpoints.',
    input: { type: 'compliance_input', required: ['artifact'] },
    output: { type: 'compliance_output', fields: ['policy_summary', 'human_review_checkpoints'] },
    integrations: { primary: 'policy guidance', trackC: true },
  },
]);

const SKILLS_BY_ID = new Map(SKILLS.map((skill) => [skill.id, skill]));

function listSkills() {
  return [...SKILLS];
}

function listSkillsByGroup(group) {
  return SKILLS.filter((skill) => skill.group === group);
}

function getSkill(skillId) {
  return SKILLS_BY_ID.get(String(skillId || '').trim()) || null;
}

module.exports = {
  SKILL_GROUPS,
  SKILLS,
  getSkill,
  listSkills,
  listSkillsByGroup,
};
