export type FairnessSeverity = "low" | "medium" | "high";

export type FairnessCaseContext = {
  case_type?: "reunification" | "custody" | "protection" | "intervention_order" | null;
  family_composition?: "single_parent" | "two_parent" | "multi_generational" | "other" | null;
  child_ages?: number[] | null;
  jurisdictions?: string[] | null;
  cultural_background?: string | null;
};

export type BiasCategory =
  | "gender_bias"
  | "socioeconomic_bias"
  | "disability_bias"
  | "cultural_religious_bias"
  | "racial_ethnic_bias"
  | "neurodivergence_bias"
  | "sexual_orientation_gender_identity_bias";

export type FairnessBiasIndicator = {
  category: BiasCategory;
  severity: FairnessSeverity;
  evidence: string;
  explanation: string;
};

export type FairnessConcern = {
  category: string;
  severity: FairnessSeverity;
  evidence: string;
  explanation: string;
};

export type FairnessRecommendation = {
  concern: string;
  reframe: string;
};

export type FairnessDetectionResult = {
  fairness_score: number;
  bias_indicators: FairnessBiasIndicator[];
  coercion_flags: FairnessConcern[];
  discrimination_risks: FairnessConcern[];
  framing_concerns: FairnessConcern[];
  unrealistic_expectations: FairnessConcern[];
  remediation_recommendations: FairnessRecommendation[];
  limitations: string;
  timestamp: string;
};

type Rule = {
  pattern: RegExp;
  severity: FairnessSeverity;
  explanation: string;
};

const LIMITATIONS =
  "This tool supports human review. Final determinations remain with decision-makers.";

const biasRules: Record<BiasCategory, Rule[]> = {
  gender_bias: [
    { pattern: /\bmother (?:should|must) (?:always|naturally)\b/gi, severity: "high", explanation: "Assumes caregiving role by gender." },
    { pattern: /\bfather(?:s)? (?:are|is) (?:not|less) (?:nurturing|suited)\b/gi, severity: "high", explanation: "Frames fathers as less capable without evidence." },
    { pattern: /\bmaternal instinct\b/gi, severity: "medium", explanation: "Uses gendered assumptions in place of observed parenting evidence." },
  ],
  socioeconomic_bias: [
    { pattern: /\bpoor (?:housing|income|neighborhood) means\b/gi, severity: "high", explanation: "Treats poverty indicators as automatic neglect." },
    { pattern: /\bunemployed (?:therefore|so) (?:unfit|unsafe)\b/gi, severity: "high", explanation: "Infers parenting capacity from employment status alone." },
    { pattern: /\bcan't afford\b/gi, severity: "medium", explanation: "Financial hardship language needs context and service-access framing." },
  ],
  disability_bias: [
    { pattern: /\bdisabled (?:parent|mother|father) (?:cannot|can't|is unable to) parent\b/gi, severity: "high", explanation: "Disability is framed as incapacity without functional evidence." },
    { pattern: /\bmental illness (?:makes|means) (?:them )?dangerous\b/gi, severity: "high", explanation: "Stigmatizing mental-health generalization." },
    { pattern: /\bwheelchair[- ]bound\b/gi, severity: "medium", explanation: "Outdated disability framing." },
  ],
  cultural_religious_bias: [
    { pattern: /\btheir culture (?:is|seems) (?:backward|primitive|unsafe)\b/gi, severity: "high", explanation: "Dismissive cultural language." },
    { pattern: /\breligious practice (?:is|was) (?:strange|abnormal)\b/gi, severity: "high", explanation: "Stigmatizes religious identity without safety evidence." },
    { pattern: /\bthey should abandon (?:their )?(?:culture|religion)\b/gi, severity: "high", explanation: "Pressures assimilation instead of child-safety focus." },
  ],
  racial_ethnic_bias: [
    { pattern: /\bthose people\b/gi, severity: "high", explanation: "Dehumanizing collective reference." },
    { pattern: /\b(?:race|ethnicity) (?:makes|means) (?:them )?(?:aggressive|unreliable)\b/gi, severity: "high", explanation: "Racial/ethnic stereotyping." },
    { pattern: /\b(?:foreign|immigrant) families (?:are|tend to be) (?:noncompliant|dishonest)\b/gi, severity: "high", explanation: "Generalizes risk by ethnicity/migration status." },
  ],
  neurodivergence_bias: [
    { pattern: /\badhd (?:parent|mother|father) (?:cannot|can't) (?:organize|parent)\b/gi, severity: "high", explanation: "Neurodivergence treated as automatic incapacity." },
    { pattern: /\bautistic (?:parent|person) (?:lacks|has no) empathy\b/gi, severity: "high", explanation: "Stereotypes autism and parenting capacity." },
    { pattern: /\bneurodivergent(?: children?)? (?:are|is) manipulative\b/gi, severity: "high", explanation: "Stigmatizing neurodivergence language." },
  ],
  sexual_orientation_gender_identity_bias: [
    { pattern: /\bsame-sex parents? (?:are|is) confusing for children\b/gi, severity: "high", explanation: "Sexual orientation bias in parenting assessment." },
    { pattern: /\btrans(?:gender)? (?:parent|mother|father) (?:is|are) unstable\b/gi, severity: "high", explanation: "Gender identity stigma." },
    { pattern: /\btraditional family(?: only)?\b/gi, severity: "medium", explanation: "May exclude family structures without safety basis." },
  ],
};

const coercionRules: Rule[] = [
  { pattern: /\byou must .* or lose custody\b/gi, severity: "high", explanation: "Direct coercive custody threat." },
  { pattern: /\bif you don't .* we will take(?: away)? your child\b/gi, severity: "high", explanation: "Punitive conditional language." },
  { pattern: /\bclearly guilty\b/gi, severity: "high", explanation: "Assumes guilt without evidence." },
  { pattern: /\bwhy did you fail\b/gi, severity: "medium", explanation: "Leading and loaded questioning tone." },
];

const discriminationRules: Rule[] = [
  { pattern: /\bnot suitable because of (?:religion|culture|race|disability|gender identity|sexual orientation)\b/gi, severity: "high", explanation: "Explicit discriminatory framing." },
  { pattern: /\bshould not parent due to (?:disability|mental health|autism|adhd)\b/gi, severity: "high", explanation: "Protected-attribute exclusion." },
  { pattern: /\b(?:race|ethnicity) (?:makes|means) (?:them )?(?:aggressive|unreliable)\b/gi, severity: "high", explanation: "Discriminatory inference from race or ethnicity." },
  { pattern: /\bunfit due to (?:ethnicity|immigration status)\b/gi, severity: "high", explanation: "Discriminatory inference from protected identity." },
];

const framingRules: Rule[] = [
  { pattern: /\b(?:always|never)\b/gi, severity: "medium", explanation: "Absolute wording can overstate conclusions." },
  { pattern: /\bobviously\b/gi, severity: "low", explanation: "Judgmental framing without sourced evidence." },
  { pattern: /\bbad parent\b/gi, severity: "high", explanation: "Label-based framing instead of behavior-specific findings." },
];

const unrealisticExpectationRules: Rule[] = [
  { pattern: /\b(?:[1-5]) year old should (?:self-soothe alone overnight|manage emotions like an adult)\b/gi, severity: "high", explanation: "Developmental expectation mismatch for younger child." },
  { pattern: /\bchild should never cry\b/gi, severity: "medium", explanation: "Unrealistic emotional regulation expectation." },
  { pattern: /\b(?:[6-9]) year old should supervise siblings overnight\b/gi, severity: "high", explanation: "Age-inappropriate caregiving expectation." },
];

const positiveSignals = /\b(strength|supportive|protective|progress|improved|engaged|stable)\b/gi;
const concernSignals = /\b(risk|unsafe|failure|noncompliant|dangerous|neglect)\b/gi;
const bestInterestSignal = /\bbest interests? of (?:the )?child\b/i;

export function analyzeFairnessDocument(text: string, _context?: FairnessCaseContext | null): FairnessDetectionResult {
  const source = normalizeFairnessText(text);

  const bias_indicators = (Object.entries(biasRules) as [BiasCategory, Rule[]][])
    .flatMap(([category, rules]) =>
      collectMatches(source, rules).map((match) => ({
        category,
        severity: match.severity,
        evidence: match.evidence,
        explanation: match.explanation,
      })),
    )
    .slice(0, 40);

  const coercion_flags = collectMatches(source, coercionRules).map((match) => ({
    category: "coercive_language",
    severity: match.severity,
    evidence: match.evidence,
    explanation: match.explanation,
  }));

  const discrimination_risks = collectMatches(source, discriminationRules).map((match) => ({
    category: "discrimination_risk",
    severity: match.severity,
    evidence: match.evidence,
    explanation: match.explanation,
  }));

  const framing_concerns = collectMatches(source, framingRules).map((match) => ({
    category: "framing_concern",
    severity: match.severity,
    evidence: match.evidence,
    explanation: match.explanation,
  }));

  const unrealistic_expectations = collectMatches(source, unrealisticExpectationRules).map((match) => ({
    category: "developmental_mismatch",
    severity: match.severity,
    evidence: match.evidence,
    explanation: match.explanation,
  }));

  if (!bestInterestSignal.test(source)) {
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

export function normalizeFairnessText(text: string) {
  if (typeof text !== "string") {
    throw new Error("Fairness analysis requires text.");
  }
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) {
    throw new Error("Fairness analysis requires non-empty text.");
  }
  return normalized;
}

function collectMatches(text: string, rules: Rule[]) {
  return rules.flatMap((rule) => matchRule(text, rule));
}

function matchRule(text: string, rule: Rule) {
  const flags = rule.pattern.flags.includes("g") ? rule.pattern.flags : `${rule.pattern.flags}g`;
  const expression = new RegExp(rule.pattern.source, flags);
  const matches: Array<{ severity: FairnessSeverity; evidence: string; explanation: string }> = [];
  let current: RegExpExecArray | null = expression.exec(text);
  while (current) {
    const index = current.index ?? text.indexOf(current[0]);
    matches.push({
      severity: rule.severity,
      evidence: buildEvidenceSnippet(text, index, current[0].length),
      explanation: rule.explanation,
    });
    current = expression.exec(text);
  }
  return matches;
}

function buildEvidenceSnippet(text: string, index: number, length: number) {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + length + 40);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function calculateFairnessScore(input: {
  text: string;
  biasCount: number;
  coercionCount: number;
  discriminationCount: number;
  framingCount: number;
  unrealisticCount: number;
}) {
  const positiveCount = countMatches(input.text, positiveSignals);
  const concernCount = countMatches(input.text, concernSignals);

  let score =
    100 -
    input.biasCount * 8 -
    input.coercionCount * 10 -
    input.discriminationCount * 9 -
    input.framingCount * 4 -
    input.unrealisticCount * 6;

  score += Math.min(6, positiveCount * 2);
  score -= Math.min(8, concernCount);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function countMatches(text: string, pattern: RegExp) {
  return (text.match(pattern) ?? []).length;
}

function buildRecommendations(input: {
  bias_indicators: FairnessBiasIndicator[];
  coercion_flags: FairnessConcern[];
  discrimination_risks: FairnessConcern[];
  framing_concerns: FairnessConcern[];
  unrealistic_expectations: FairnessConcern[];
}): FairnessRecommendation[] {
  const recommendations: FairnessRecommendation[] = [];

  const categories = new Set(input.bias_indicators.map((item) => item.category));
  for (const category of categories) {
    recommendations.push({
      concern: category.replaceAll("_", " "),
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
