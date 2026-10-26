'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const TOPIC_RULES = [
  {
    topic: 'attendance_and_participation',
    positive: /\b(attended\s+all|completed\s+every|present\s+at\s+all|never\s+missed|100%\s+attendance|consistently\s+attended)\b/i,
    negative: /\b(missed\s+(?:several|multiple|two|three|\d+)|failed\s+to\s+attend|absent\s+from|did\s+not\s+attend|no[-\s]?show)\b/i,
    severity: 'high',
    explanation: 'Conflicting statements regarding program or visit attendance within the same record.',
  },
  {
    topic: 'engagement_and_cooperation',
    positive: /\b(cooperative|fully\s+engaged|actively\s+participated|open\s+and\s+communicative|responsive)\b/i,
    negative: /\b(uncooperative|refused\s+to\s+engage|withdrawn\s+and\s+hostile|non[-\s]?responsive|disengaged)\b/i,
    severity: 'medium',
    explanation: 'Conflicting characterizations of participant engagement without clarifying whether behavior shifted over time.',
  },
  {
    topic: 'home_environment_stability',
    positive: /\b(home\s+was\s+clean|safe\s+and\s+appropriate\s+housing|well[-\s]?maintained\s+residence|adequate\s+food\s+and\s+utilities)\b/i,
    negative: /\b(unsafe\s+housing|utilities\s+disconnected|uninhabitable|hazards\s+observed\s+in\s+the\s+home|no\s+running\s+water)\b/i,
    severity: 'high',
    explanation: 'Conflicting observations about housing conditions without dated differentiation.',
  },
  {
    topic: 'sobriety_and_screening',
    positive: /\b(all\s+screens\s+negative|tested\s+negative|maintained\s+sobriety|no\s+substance\s+use)\b/i,
    negative: /\b(tested\s+positive|missed\s+urinalysis|relapse\s+reported|substance\s+use\s+observed)\b/i,
    severity: 'high',
    explanation: 'Conflicting statements about substance screening results or sobriety status.',
  },
];

async function contradictionDetectionHandler({ input = {} }) {
  const text = extractInputText(input);
  const sentences = splitSentencesWithLocators(text);

  if (sentences.length < 2) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'Fewer than two comparable statements were supplied; contradiction analysis requires at least two statements.',
        'Cannot adjudicate factual truth; only flags internal inconsistencies for human review.',
      ],
      fields: {
        contradictions: [],
        unresolved_questions: [],
      },
    });
  }

  const contradictions = [];
  const unresolvedQuestions = [];
  const citations = [];

  for (const rule of TOPIC_RULES) {
    const positives = sentences.filter((s) => rule.positive.test(s.text));
    const negatives = sentences.filter((s) => rule.negative.test(s.text));
    if (positives.length > 0 && negatives.length > 0) {
      const pos = positives[0];
      const neg = negatives[0];
      contradictions.push({
        topic: rule.topic,
        statement_a: pos.text,
        statement_b: neg.text,
        locator_a: pos.locator,
        locator_b: neg.locator,
        explanation: rule.explanation,
        severity: rule.severity,
      });
      unresolvedQuestions.push(
        `Clarify the discrepancy on ${rule.topic.replace(/_/g, ' ')} between ${pos.locator} and ${neg.locator} (e.g., different dates, sources, or observation windows).`,
      );
      citations.push(`${pos.locator} "${pos.text}"`, `${neg.locator} "${neg.text}"`);
    }
  }

  const explicitMarkers = sentences.filter((s) => /\b(contradicts|inconsistent\s+with|conflicting\s+account|however\s+earlier\s+stated)\b/i.test(s.text));
  for (const item of explicitMarkers) {
    if (!citations.some((c) => c.startsWith(item.locator))) {
      const prev = sentences[Math.max(0, item.index - 2)] || item;
      contradictions.push({
        topic: 'explicit_narrative_discrepancy',
        statement_a: prev.text,
        statement_b: item.text,
        locator_a: prev.locator,
        locator_b: item.locator,
        explanation: 'Narrative explicitly notes a conflicting or inconsistent account.',
        severity: 'medium',
      });
      unresolvedQuestions.push(`Verify primary source records to clarify the discrepancy noted at ${item.locator}.`);
      citations.push(`${prev.locator} "${prev.text}"`, `${item.locator} "${item.text}"`);
    }
  }

  const confidence = contradictions.length > 0
    ? Math.min(0.9, 0.68 + contradictions.length * 0.08)
    : 0.74;

  return buildSkillEnvelope({
    status: 'complete',
    findings: contradictions,
    confidence,
    evidenceCitations: citations,
    limitations: [
      'Flags potential inconsistencies only; cannot resolve which account is accurate without primary evidence.',
      'Statements from different dates may reflect genuine change over time rather than contradiction.',
    ],
    fields: {
      contradictions,
      unresolved_questions: unresolvedQuestions,
    },
  });
}

module.exports = { contradictionDetectionHandler };
