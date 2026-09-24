'use strict';

const ANALYSIS_SKILL_RESULT_SCHEMA = {
  skill_id: 'string',
  status: 'complete|insufficient_evidence|failed',
  findings: 'array<object>',
  confidence: 'number (0..1)',
  evidence_citations: 'array<string>',
  limitations: 'array<string>',
  human_review_required: true,
  failure_behavior: 'string',
  unsafe_output_flags: 'array<string>',
};

const analysisSkillCatalog = [
  {
    skill_id: 'fairness_detection',
    input_format: 'Casework narrative text, transcript excerpts, and metadata context when provided.',
    output_schema: {
      concerns: 'array<{category, statement, explanation, severity}>',
      objective_reframes: 'array<{concern, reframe}>',
    },
    confidence_score: '0..1 calibrated confidence in fairness findings.',
    evidence_citation_or_source_location: 'Quote snippets and source locators (line, paragraph, section, or timestamp when available).',
    limitations: 'Cannot infer intent; may miss context outside supplied material.',
    human_review_requirement: 'Required before any professional action.',
    failure_behavior: 'Return status failed with no generated findings when input is malformed or inaccessible.',
    test_cases: ['Loaded language without evidence', 'Balanced factual observation'],
    unsafe_output_rules: ['Do not label people as inherently dangerous or deceitful.', 'Do not convert fairness findings into case decisions.'],
  },
  {
    skill_id: 'bias_and_discrimination_detection',
    input_format: 'Narrative language about people, culture, gender, disability, race, religion, identity, or family roles.',
    output_schema: {
      bias_signals: 'array<{category, phrase, impact, severity}>',
      discrimination_risks: 'array<{group, mechanism, explanation}>',
    },
    confidence_score: '0..1 confidence in detected bias patterns.',
    evidence_citation_or_source_location: 'Direct phrase-level citations with source location.',
    limitations: 'Pattern detection can over-flag reclaimed language or quoted third-party text.',
    human_review_requirement: 'Required; bias flags are advisory only.',
    failure_behavior: 'Return insufficient_evidence when no attributable language is present.',
    test_cases: ['Stereotype-based attribution', 'Neutral culturally-aware language'],
    unsafe_output_rules: ['Do not infer protected attributes not present in source text.', 'Do not produce group-level risk generalizations.'],
  },
  {
    skill_id: 'coercion_and_framing_detection',
    input_format: 'Statements describing interactions, threats, pressure, manipulation, ultimatums, or framing cues.',
    output_schema: {
      coercion_flags: 'array<{signal, excerpt, severity, rationale}>',
      framing_concerns: 'array<{category, excerpt, explanation}>',
    },
    confidence_score: '0..1 confidence in coercive/framing interpretation.',
    evidence_citation_or_source_location: 'Cited excerpts tied to explicit source locator.',
    limitations: 'Cannot verify speaker intent without corroborating context.',
    human_review_requirement: 'Required; always route coercion findings to human reviewer.',
    failure_behavior: 'Return failed if text cannot be parsed; otherwise insufficient_evidence when no signal exists.',
    test_cases: ['Threat-based compliance language', 'Supportive non-coercive guidance'],
    unsafe_output_rules: ['Do not fabricate abuse allegations.', 'Do not issue legal conclusions from linguistic patterns alone.'],
  },
  {
    skill_id: 'contradiction_detection',
    input_format: 'Pairs or sets of claims in one document that can be cross-compared for consistency.',
    output_schema: {
      contradictions: 'array<{statement_a, statement_b, explanation, severity}>',
      unresolved_questions: 'array<string>',
    },
    confidence_score: '0..1 confidence that statements are materially contradictory.',
    evidence_citation_or_source_location: 'Cite both conflicting statements and their locations.',
    limitations: 'Cannot resolve truth; only flags inconsistency.',
    human_review_requirement: 'Required to adjudicate contradictions.',
    failure_behavior: 'Return insufficient_evidence when fewer than two comparable claims are present.',
    test_cases: ['Date/event mismatch', 'Consistent repeated timeline detail'],
    unsafe_output_rules: ['Do not select a "correct" side without verified evidence.', 'Do not treat contradiction as proof of deception.'],
  },
  {
    skill_id: 'evidence_extraction',
    input_format: 'Narrative claims, cited records, observed behavior, and referenced documents.',
    output_schema: {
      evidence_items: 'array<{claim, evidence, evidence_type, source_locator}>',
      evidence_gaps: 'array<{topic, missing_or_unclear}>',
    },
    confidence_score: '0..1 confidence in evidence-claim linkage.',
    evidence_citation_or_source_location: 'Each item must include source locator and quote/paraphrase boundary.',
    limitations: 'Does not validate document authenticity.',
    human_review_requirement: 'Required before evidence enters professional record.',
    failure_behavior: 'Return failed when source text is unavailable; otherwise empty arrays with insufficient_evidence.',
    test_cases: ['Claim with direct record support', 'Claim with no supporting evidence'],
    unsafe_output_rules: ['Do not invent supporting evidence.', 'Do not upgrade allegation to verified fact without source basis.'],
  },
  {
    skill_id: 'requirement_and_obligation_extraction',
    input_format: 'Court orders, service plans, commitments, deadlines, and mandatory language.',
    output_schema: {
      obligations: 'array<{party, obligation, due_date, status_hint, source_locator}>',
      ambiguous_requirements: 'array<string>',
    },
    confidence_score: '0..1 confidence in obligation parsing.',
    evidence_citation_or_source_location: 'Cite exact requirement text and location.',
    limitations: 'Not legal advice; may miss implied obligations not textually explicit.',
    human_review_requirement: 'Required by worker/supervisor before operational use.',
    failure_behavior: 'Return insufficient_evidence when no obligation language appears.',
    test_cases: ['Explicit due-date requirement', 'Vague encouragement without obligation'],
    unsafe_output_rules: ['Do not interpret legal enforceability beyond text.', 'Do not generate punitive recommendations.'],
  },
  {
    skill_id: 'timeline_extraction',
    input_format: 'Chronological references, dates, relative time phrases, and event narratives.',
    output_schema: {
      timeline_events: 'array<{date, date_precision, event, actors, source_locator}>',
      chronology_gaps: 'array<string>',
    },
    confidence_score: '0..1 confidence in temporal ordering.',
    evidence_citation_or_source_location: 'Attach source locator for each date/event.',
    limitations: 'Relative time phrases may remain ambiguous without anchor dates.',
    human_review_requirement: 'Required for timeline confirmation.',
    failure_behavior: 'Return insufficient_evidence for non-temporal text.',
    test_cases: ['Absolute date sequence', 'Ambiguous phrase like "recently"'],
    unsafe_output_rules: ['Do not fabricate missing dates.', 'Do not infer event order not supported by text.'],
  },
  {
    skill_id: 'risk_signal_extraction',
    input_format: 'Safety-related descriptions, threat indicators, protective factors, and uncertainty markers.',
    output_schema: {
      risk_signals: 'array<{factor, type, severity, evidence_locator}>',
      protective_signals: 'array<{factor, evidence_locator}>',
      uncertainties: 'array<string>',
    },
    confidence_score: '0..1 confidence in extracted risk/protective signal mapping.',
    evidence_citation_or_source_location: 'Each signal must include supporting source location.',
    limitations: 'Signals are not a final risk decision or diagnosis.',
    human_review_requirement: 'Required before any case-level risk action.',
    failure_behavior: 'Return insufficient_evidence when risk context is absent.',
    test_cases: ['Escalating threat narrative', 'Protective support network evidence'],
    unsafe_output_rules: ['Do not output deterministic risk judgments.', 'Do not recommend removal/custody actions automatically.'],
  },
  {
    skill_id: 'concern_classification',
    input_format: 'Detected concerns from safety, wellbeing, compliance, or relational narratives.',
    output_schema: {
      concerns: 'array<{category, severity, description, source_locator}>',
      triage_hints: 'array<string>',
    },
    confidence_score: '0..1 confidence in concern category assignment.',
    evidence_citation_or_source_location: 'Every classified concern cites source location.',
    limitations: 'Category boundaries can overlap; ambiguity should be explicit.',
    human_review_requirement: 'Required for triage and escalation.',
    failure_behavior: 'Return failed only on parsing errors; otherwise empty concern list when none found.',
    test_cases: ['Safety concern classification', 'Administrative-only note with no concern'],
    unsafe_output_rules: ['Do not suppress high-severity concerns due to low confidence.', 'Do not classify unsupported speculative concerns.'],
  },
  {
    skill_id: 'unrealistic_expectation_detection',
    input_format: 'Statements setting goals, compliance expectations, timelines, or behavioral demands.',
    output_schema: {
      unrealistic_expectations: 'array<{expectation, reason, impacted_party, severity}>',
      suggested_reframes: 'array<{expectation, reframe}>',
    },
    confidence_score: '0..1 confidence in expectation realism judgment.',
    evidence_citation_or_source_location: 'Cite expectation statement and contextual clues.',
    limitations: 'Cannot account for external supports not present in input.',
    human_review_requirement: 'Required prior to documenting non-compliance conclusions.',
    failure_behavior: 'Return insufficient_evidence if no expectation statements exist.',
    test_cases: ['Demand with unrealistic timeline', 'Achievable staged expectation'],
    unsafe_output_rules: ['Do not frame unmet unrealistic expectations as parental failure.', 'Do not replace human planning judgment.'],
  },
  {
    skill_id: 'developmental_appropriateness_checks',
    input_format: 'Child-focused language, behavioral expectations, and age/development references.',
    output_schema: {
      developmental_mismatch_flags: 'array<{statement, issue, severity, source_locator}>',
      developmentally_appropriate_alternatives: 'array<string>',
    },
    confidence_score: '0..1 confidence in developmental-fit assessment.',
    evidence_citation_or_source_location: 'Source location for each mismatch flag.',
    limitations: 'Not a clinical developmental assessment.',
    human_review_requirement: 'Required by child-focused practitioner before action.',
    failure_behavior: 'Return insufficient_evidence when child age/stage context is absent.',
    test_cases: ['Expectation beyond age capability', 'Age-appropriate behavioral expectation'],
    unsafe_output_rules: ['Do not diagnose developmental disorders.', 'Do not shame language about child behavior.'],
  },
  {
    skill_id: 'cultural_safety_checks',
    input_format: 'Language about culture, kinship, community, identity, migration, and family practices.',
    output_schema: {
      cultural_safety_concerns: 'array<{issue, excerpt, impact, severity}>',
      culturally_safe_reframes: 'array<string>',
    },
    confidence_score: '0..1 confidence in cultural-safety interpretation.',
    evidence_citation_or_source_location: 'Cite source excerpt for each concern.',
    limitations: 'Cannot replace lived-experience consultation or local cultural authority.',
    human_review_requirement: 'Mandatory cultural/human review for flagged items.',
    failure_behavior: 'Return insufficient_evidence for culture-neutral content.',
    test_cases: ['Dismissive cultural assumption', 'Respectful culturally grounded language'],
    unsafe_output_rules: ['Do not stereotype cultures or communities.', 'Do not prescribe culture-specific conclusions without evidence.'],
  },
  {
    skill_id: 'child_safe_language_checks',
    input_format: 'Any language that may be read by children or used in child-facing communication.',
    output_schema: {
      unsafe_child_language_flags: 'array<{phrase, issue, severity, source_locator}>',
      child_safe_rewrites: 'array<{original, rewrite}>',
    },
    confidence_score: '0..1 confidence in child-safety language assessment.',
    evidence_citation_or_source_location: 'Phrase-level locator for each flag.',
    limitations: 'Cannot determine child reading level without explicit context.',
    human_review_requirement: 'Required before sending child-facing output.',
    failure_behavior: 'Return insufficient_evidence when no child-facing text appears.',
    test_cases: ['Fear-inducing wording', 'Neutral age-appropriate wording'],
    unsafe_output_rules: ['Do not include threatening, shaming, or explicit harmful language in rewrites.', 'Do not expose confidential adult allegations in child-facing rewrites.'],
  },
  {
    skill_id: 'disclosure_sensitive_handling',
    input_format: 'Narratives containing disclosures of harm, fear, abuse, or sensitive personal experiences.',
    output_schema: {
      disclosure_signals: 'array<{type, excerpt, urgency, source_locator}>',
      handling_guidance: 'array<string>',
    },
    confidence_score: '0..1 confidence in disclosure sensitivity detection.',
    evidence_citation_or_source_location: 'Cite disclosure excerpt and source location.',
    limitations: 'Cannot verify factual truth of disclosure; flags sensitivity only.',
    human_review_requirement: 'Immediate human review required for high-urgency disclosures.',
    failure_behavior: 'Return failed if content cannot be safely parsed; otherwise insufficient_evidence when no disclosure is present.',
    test_cases: ['Direct harm disclosure', 'Routine administrative update'],
    unsafe_output_rules: ['Do not dismiss or invalidate disclosures.', 'Do not reveal sensitive disclosure details beyond authorized context.'],
  },
  {
    skill_id: 'privacy_and_boundary_checks',
    input_format: 'Document text, metadata, and output draft for potential over-disclosure or boundary breaches.',
    output_schema: {
      privacy_boundary_flags: 'array<{issue, data_type, source_locator, severity}>',
      minimization_recommendations: 'array<string>',
    },
    confidence_score: '0..1 confidence in privacy/boundary risk detection.',
    evidence_citation_or_source_location: 'Explicit source locator for each flagged data element.',
    limitations: 'Cannot evaluate permissions or legal basis outside supplied context.',
    human_review_requirement: 'Required before release or sharing.',
    failure_behavior: 'Return insufficient_evidence when no sensitive content is present.',
    test_cases: ['Unnecessary personal identifier exposure', 'Properly minimized summary'],
    unsafe_output_rules: ['Do not echo secrets, credentials, or unnecessary identifiers.', 'Do not recommend sharing beyond stated authorization boundaries.'],
  },
];

const analysisSkillIds = analysisSkillCatalog.map((skill) => skill.skill_id);

function createEmptyAnalysisSkills() {
  return analysisSkillCatalog.map((skill) => ({
    skill_id: skill.skill_id,
    status: 'insufficient_evidence',
    findings: [],
    confidence: 0,
    evidence_citations: [],
    limitations: [skill.limitations],
    human_review_required: true,
    failure_behavior: skill.failure_behavior,
    unsafe_output_flags: [],
  }));
}

function normalizeAnalysisSkills(input) {
  const defaultRows = createEmptyAnalysisSkills();
  if (!Array.isArray(input)) return defaultRows;

  const byId = new Map();
  for (const row of input) {
    if (!row || typeof row !== 'object') continue;
    const skillId = typeof row.skill_id === 'string' ? row.skill_id : '';
    if (!analysisSkillIds.includes(skillId)) continue;
    byId.set(skillId, row);
  }

  return defaultRows.map((defaults) => {
    const row = byId.get(defaults.skill_id) || {};
    const confidence = Number.isFinite(row.confidence) ? Number(row.confidence) : defaults.confidence;
    return {
      skill_id: defaults.skill_id,
      status: typeof row.status === 'string' ? row.status : defaults.status,
      findings: Array.isArray(row.findings) ? row.findings : defaults.findings,
      confidence: Math.max(0, Math.min(1, confidence)),
      evidence_citations: Array.isArray(row.evidence_citations) ? row.evidence_citations : defaults.evidence_citations,
      limitations: Array.isArray(row.limitations) ? row.limitations : defaults.limitations,
      human_review_required: true,
      failure_behavior: typeof row.failure_behavior === 'string' && row.failure_behavior ? row.failure_behavior : defaults.failure_behavior,
      unsafe_output_flags: Array.isArray(row.unsafe_output_flags) ? row.unsafe_output_flags : defaults.unsafe_output_flags,
    };
  });
}

module.exports = {
  ANALYSIS_SKILL_RESULT_SCHEMA,
  analysisSkillCatalog,
  analysisSkillIds,
  createEmptyAnalysisSkills,
  normalizeAnalysisSkills,
};
