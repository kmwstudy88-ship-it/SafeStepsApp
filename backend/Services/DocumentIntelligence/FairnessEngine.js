const LIMITATIONS =
  "This tool supports human review. Final determinations remain with decision-makers.";

const RULES = {
  gender_bias: [
    [/mother (?:should|must) (?:always|naturally)/gi, "Assumes caregiving role by gender.", "high"],
    [/father(?:s)? (?:are|is) (?:not|less) (?:nurturing|suited)/gi, "Frames fathers as less capable without evidence.", "high"],
  ],
  socioeconomic_bias: [
    [/poor (?:housing|income|neighborhood) means/gi, "Treats poverty indicators as automatic neglect.", "high"],
    [/unemployed (?:therefore|so) (?:unfit|unsafe)/gi, "Infers parenting capacity from employment status alone.", "high"],
  ],
  disability_bias: [
    [/disabled (?:parent|mother|father) (?:cannot|can't) parent/gi, "Disability is framed as incapacity without functional evidence.", "high"],
    [/mental illness (?:makes|means) (?:them )?dangerous/gi, "Stigmatizing mental-health generalization.", "high"],
  ],
  cultural_religious_bias: [
    [/their culture (?:is|seems) (?:backward|primitive|unsafe)/gi, "Dismissive cultural language.", "high"],
    [/religious practice (?:is|was) (?:strange|abnormal)/gi, "Stigmatizes religious identity without safety evidence.", "high"],
  ],
  racial_ethnic_bias: [
    [/those people/gi, "Dehumanizing collective reference.", "high"],
    [/(?:race|ethnicity) (?:makes|means) (?:them )?(?:aggressive|unreliable)/gi, "Racial/ethnic stereotyping.", "high"],
  ],
  neurodivergence_bias: [
    [/adhd (?:parent|mother|father) (?:cannot|can't) (?:organize|parent)/gi, "Neurodivergence treated as automatic incapacity.", "high"],
    [/autistic (?:parent|person) (?:lacks|has no) empathy/gi, "Stereotypes autism and parenting capacity.", "high"],
  ],
  sexual_orientation_gender_identity_bias: [
    [/same-sex parents? (?:are|is) confusing for children/gi, "Sexual orientation bias in parenting assessment.", "high"],
    [/trans(?:gender)? (?:parent|mother|father) (?:is|are) unstable/gi, "Gender identity stigma.", "high"],
  ],
};

const coercionRules = [
  [/you must .* or lose custody/gi, "Direct coercive custody threat.", "high"],
  [/if you don't .* we will take(?: away)? your child/gi, "Punitive conditional language.", "high"],
  [/clearly guilty/gi, "Assumes guilt without evidence.", "high"],
  [/why did you fail/gi, "Leading and loaded questioning tone.", "medium"],
];

const discriminationRules = [
  [/not suitable because of (?:religion|culture|race|disability|gender identity|sexual orientation)/gi, "Explicit discriminatory framing.", "high"],
  [/should not parent due to (?:disability|mental health|autism|adhd)/gi, "Protected-attribute exclusion.", "high"],
  [/(?:race|ethnicity) (?:makes|means) (?:them )?(?:aggressive|unreliable)/gi, "Discriminatory inference from race or ethnicity.", "high"],
];

const framingRules = [
  [/\b(?:always|never)\b/gi, "Absolute wording can overstate conclusions.", "medium"],
  [/\bbad parent\b/gi, "Label-based framing instead of behavior-specific findings.", "high"],
];

const unrealisticRules = [
  [/(?:[1-5]) year old should (?:self-soothe alone overnight|manage emotions like an adult)/gi, "Developmental expectation mismatch for younger child.", "high"],
  [/child should never cry/gi, "Unrealistic emotional regulation expectation.", "medium"],
];

export function analyzeFairnessDocument(text) {
  const source = normalizeFairnessText(text);

  const bias_indicators = Object.entries(RULES).flatMap(([category, rules]) =>
    collectMatches(source, rules, category),
  );
  const coercion_flags = collectMatches(source, coercionRules, "coercive_language");
  const discrimination_risks = collectMatches(source, discriminationRules, "discrimination_risk");
  const framing_concerns = collectMatches(source, framingRules, "framing_concern");
  const unrealistic_expectations = collectMatches(source, unrealisticRules, "developmental_mismatch");

  if (!/\bbest interests? of (?:the )?child\b/i.test(source)) {
    framing_concerns.push({
      category: "child_best_interest_missing",
      severity: "medium",
      evidence: "No explicit reference to the child's best interests was found.",
      explanation: "Assessments should explicitly connect findings to the child's best interests.",
    });
  }

  const fairness_score = calculateFairnessScore({
    text: source,
    biasCount: bias_indicators.length,
    coercionCount: coercion_flags.length,
    discriminationCount: discrimination_risks.length,
    framingCount: framing_concerns.length,
    unrealisticCount: unrealistic_expectations.length,
  });

  return {
    fairness_score,
    bias_indicators,
    coercion_flags,
    discrimination_risks,
    framing_concerns,
    unrealistic_expectations,
    remediation_recommendations: buildRecommendations({
      bias_indicators,
      coercion_flags,
      discrimination_risks,
      framing_concerns,
      unrealistic_expectations,
    }),
    limitations: LIMITATIONS,
    timestamp: new Date().toISOString(),
  };
}

export function normalizeFairnessText(text) {
  if (typeof text !== "string") throw new Error("Fairness analysis requires text.");
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) throw new Error("Fairness analysis requires non-empty text.");
  return normalized;
}

function collectMatches(text, rules, category) {
  return rules.flatMap(([pattern, explanation, severity]) => {
    const matches = [];
    let current = pattern.exec(text);
    while (current) {
      const index = current.index ?? text.indexOf(current[0]);
      matches.push({
        category,
        severity,
        evidence: buildEvidenceSnippet(text, index, current[0].length),
        explanation,
      });
      current = pattern.exec(text);
    }
    pattern.lastIndex = 0;
    return matches;
  });
}

function buildEvidenceSnippet(text, index, length) {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + length + 40);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function calculateFairnessScore(input) {
  let score =
    100 -
    input.biasCount * 8 -
    input.coercionCount * 10 -
    input.discriminationCount * 9 -
    input.framingCount * 4 -
    input.unrealisticCount * 6;
  score += Math.min(6, (input.text.match(/\b(strength|supportive|protective|progress|improved|engaged|stable)\b/gi) ?? []).length * 2);
  score -= Math.min(8, (input.text.match(/\b(risk|unsafe|failure|noncompliant|dangerous|neglect)\b/gi) ?? []).length);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildRecommendations(input) {
  const recommendations = [];
  const categories = [...new Set(input.bias_indicators.map((item) => item.category))];
  for (const category of categories) {
    recommendations.push({
      concern: String(category).replaceAll("_", " "),
      reframe: "Focus on observed parenting behaviour, evidence quality, and child outcomes rather than assumptions.",
    });
  }
  if (input.coercion_flags.length) {
    recommendations.push({
      concern: "Coercive or punitive language",
      reframe: "Use collaborative, support-focused wording and separate expectations from threats.",
    });
  }
  if (input.discrimination_risks.length) {
    recommendations.push({
      concern: "Potential discriminatory framing",
      reframe: "Document individualized evidence and include culturally safe, disability-aware reasoning.",
    });
  }
  if (input.framing_concerns.length) {
    recommendations.push({
      concern: "Absolute or judgmental framing",
      reframe: "Replace always/never labels with date-stamped examples and explicit source references.",
    });
  }
  if (input.unrealistic_expectations.length) {
    recommendations.push({
      concern: "Developmental mismatch",
      reframe: "Align expectations to child developmental stage and available supports.",
    });
  }
  return recommendations.slice(0, 12);
}
