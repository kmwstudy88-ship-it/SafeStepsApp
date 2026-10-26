const mediaSignalDomains = [
  {
    order: 6,
    id: 'environmental_safety',
    name: 'Environmental Safety',
    signals: ['Hazard mapping (weapons, substances, clutter)', 'Hygiene score', 'Age-appropriate environment suitability'],
    riskFlags: ['Unsafe sleeping setups', 'Visible neglect indicators'],
    protectiveFlags: ['Clean, organised, safe environment'],
  },
  {
    order: 7,
    id: 'substance_use_indicators',
    name: 'Substance Use Indicators',
    signals: ['Intoxication markers (speech, gait, coordination)', 'Paraphernalia detection', 'Alcohol prominence index'],
    riskFlags: ['Impaired supervision', 'Substance use near child'],
    protectiveFlags: ['No indicators present'],
  },
  {
    order: 8,
    id: 'violence_and_coercive_control_indicators',
    name: 'Violence & Coercive Control Indicators',
    signals: ['Threat gestures', 'Blocking exits', 'Towering posture', 'Object slamming', 'Child flinch response'],
    riskFlags: ['Any physical intimidation', 'Child witnessing violence'],
    protectiveFlags: [],
  },
  {
    order: 9,
    id: 'protective_capacity_behaviours',
    name: 'Protective Capacity Behaviours',
    signals: ['Comforting', 'Redirecting', 'Teaching moments', 'Safety planning actions'],
    riskFlags: ['Absence of protective behaviours'],
    protectiveFlags: ['High-frequency protective actions'],
  },
  {
    order: 10,
    id: 'neglect_indicators',
    name: 'Neglect Indicators',
    signals: ['Hygiene deficits', 'Inappropriate clothing', 'Malnutrition signs', 'Unsafe sleep'],
    riskFlags: ['Any neglect marker present'],
    protectiveFlags: ['Consistent care routines'],
  },
  {
    order: 11,
    id: 'communication_style',
    name: 'Communication Style',
    signals: ['Tone warmth', 'Volume stability', 'Clarity', 'Respectfulness'],
    riskFlags: ['Shouting', 'Demeaning language'],
    protectiveFlags: ['Encouraging communication'],
  },
  {
    order: 12,
    id: 'body_language_and_non_verbal_cues',
    name: 'Body Language & Non-Verbal Cues',
    signals: ['Defensive posture', 'Closed stance', 'Dominance posture', 'Child shrinking'],
    riskFlags: ['Parent looming', 'Child fear response'],
    protectiveFlags: ['Open, safe posture'],
  },
  {
    order: 13,
    id: 'timeline_and_consistency_evidence',
    name: 'Timeline & Consistency Evidence',
    signals: ['Timestamp consistency', 'Behaviour pattern repetition', 'Contradiction detection', 'Escalation timeline'],
    riskFlags: ['Edited segments', 'Contradictions with statements'],
    protectiveFlags: ['Stable behaviour patterns'],
  },
  {
    order: 14,
    id: 'contextual_reliability',
    name: 'Contextual Reliability',
    signals: ['Who is filming', 'Selective recording', 'Missing context', 'Staged behaviour detection'],
    riskFlags: ['Biased recording intent'],
    protectiveFlags: ['Neutral filming context'],
  },
  {
    order: 15,
    id: 'digital_integrity_and_authenticity',
    name: 'Digital Integrity & Authenticity',
    signals: ['Metadata validation', 'Deepfake indicators', 'Audio manipulation', 'Frame discontinuities'],
    riskFlags: ['Any tampering evidence'],
    protectiveFlags: ['Full metadata integrity'],
  },
];

function createEmptyMediaAssessment() {
  return {
    domains: mediaSignalDomains.map((domain) => ({
      domain_id: domain.id,
      domain_name: domain.name,
      signals_observed: [],
      risk_flags: [],
      protective_flags: [],
      notes: '',
      confidence: 0,
    })),
  };
}

module.exports = {
  mediaSignalDomains,
  createEmptyMediaAssessment,
};
