const LIMITATIONS =
  "This tool supports human review. Final determinations remain with decision-makers.";

const BEHAVIORAL_RISK_PATTERNS = [
  [/\b(?:physical assault|hit|struck|punched|kicked)\b/gi, "Physical aggression", "high"],
  [/\b(?:verbal abuse|screaming|threatening|threats)\b/gi, "Verbal aggression", "medium"],
  [/\b(?:self-harm|suicidal|attempted suicide)\b/gi, "Self-harm / suicidal ideation", "high"],
  [/\b(?:absconding|running away|missing from care)\b/gi, "Absconding behaviour", "high"],
  [/\b(?:property damage|destruction of property)\b/gi, "Property destruction", "medium"],
  [/\b(?:school refusal|truancy|not attending school)\b/gi, "School non-attendance", "medium"],
  [/\b(?:non-compliant|refuses to engage|refusing to cooperate)\b/gi, "Non-compliance with services", "medium"],
];

const CONTEXTUAL_RISK_PATTERNS = [
  [/\b(?:domestic violence|family violence|DV|IPV)\b/gi, "Domestic/family violence", "refer_to_dv_specialist"],
  [/\b(?:drug use|substance use|alcohol misuse|intoxicated)\b/gi, "Substance use", "substance_use_assessment_required"],
  [/\b(?:mental health|psychiatric|hospitalized|hospitalised for mental)\b/gi, "Mental health concerns", "mental_health_assessment_required"],
  [/\b(?:housing instability|homelessness|eviction|evicted|couch surfing)\b/gi, "Housing instability", "housing_support_required"],
  [/\b(?:financial stress|severe poverty|unable to meet basic needs)\b/gi, "Financial stress", "financial_support_referral"],
  [/\b(?:isolated|no support|no family|alone|no network)\b/gi, "Social isolation", "community_connection_support"],
];

const STRUCTURAL_RISK_PATTERNS = [
  [/\b(?:no referral|not referred|not engaged|refused service)\b/gi, "Service gap — no referral made"],
  [/\b(?:waiting list|long wait|can't access|cannot access)\b/gi, "Service access barrier"],
  [/\b(?:no case plan|no safety plan|plan not in place)\b/gi, "Missing safety or case plan"],
  [/\b(?:worker change|new worker|case transferred)\b/gi, "Continuity of care disrupted"],
];

const RELATIONAL_RISK_PATTERNS = [
  [/\b(?:conflict|arguing|dispute|hostile)\b/gi, "Interpersonal conflict"],
  [/\b(?:poor attachment|no bond|rejected by parent)\b/gi, "Attachment concerns"],
  [/\b(?:controlling|coercive|dominated by)\b/gi, "Coercive control pattern"],
  [/\b(?:estranged|no contact|cut off from)\b/gi, "Estrangement from support"],
];

const PROTECTIVE_FACTOR_PATTERNS = [
  [/\b(?:consistent school attendance|attends school regularly)\b/gi, "Consistent school attendance", "high"],
  [/\b(?:engaged with services|participating in program|completed course)\b/gi, "Engagement with services", "high"],
  [/\b(?:supportive (?:family|partner|extended family|grandparent))\b/gi, "Supportive family network", "high"],
  [/\b(?:stable (?:housing|accommodation|living arrangements))\b/gi, "Stable housing", "high"],
  [/\b(?:employed|working|income)\b/gi, "Employment / income stability", "moderate"],
  [/\b(?:child has positive relationship|child enjoys|child feels safe with)\b/gi, "Positive child relationship", "high"],
  [/\b(?:insight|acknowledged|takes responsibility|self-aware)\b/gi, "Parental insight", "moderate"],
];

const TRIGGER_PATTERNS = [
  [/\b(?:transition|change in routine|new environment)\b/gi, "Transitions"],
  [/\b(?:unmet expectations|not getting what they want)\b/gi, "Unmet expectations"],
  [/\b(?:contact visit|before|after contact)\b/gi, "Contact with other parent"],
  [/\b(?:anniversary|significant date|school holiday)\b/gi, "Significant dates"],
  [/\b(?:under the influence|intoxicated|substance)\b/gi, "Substance use"],
];

export function normalizeRiskText(text) {
  if (typeof text !== "string") throw new Error("Risk assessment requires text.");
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) throw new Error("Risk assessment requires non-empty text.");
  return normalized;
}

export function assessRisk(text, caseContext = null) {
  const source = normalizeRiskText(text);

  const behavioral_cues = extractBehavioralCues(source);
  const contextual_factors = extractContextualFactors(source);
  const structural_factors = extractStructuralFactors(source);
  const relational_factors = extractRelationalFactors(source);
  const protective_factors = extractProtectiveFactors(source);
  const static_risks = extractStaticRisks(source, caseContext);
  const dynamic_risks = buildDynamicRisks(contextual_factors);
  const pattern_analysis = analyzePatterns(source);
  const situational_awareness = assessSituationalAwareness(source, behavioral_cues, protective_factors);

  const risk_domains = {
    behavioral: scoreDomain(behavioral_cues.length, 6),
    contextual: scoreDomain(contextual_factors.length, 5),
    structural: scoreDomain(structural_factors.length, 4),
    relational: scoreDomain(relational_factors.length, 4),
    developmental: scoreDevelopmental(source, caseContext),
  };

  const overall_risk_score = calculateOverallRisk(risk_domains, protective_factors, caseContext);
  const escalation_risk = calculateEscalationRisk(source, behavioral_cues, overall_risk_score);
  const reviewer_prompts = buildReviewerPrompts(risk_domains, protective_factors, behavioral_cues);

  return {
    overall_risk_score,
    risk_domains,
    behavioral_cues,
    protective_factors,
    dynamic_risks,
    static_risks,
    pattern_analysis,
    situational_awareness,
    escalation_risk,
    reviewer_prompts,
    limitations: LIMITATIONS,
    timestamp: new Date().toISOString(),
  };
}

function extractBehavioralCues(text) {
  const cues = [];
  for (const [pattern, cue, severity] of BEHAVIORAL_RISK_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    const matches = [];
    let match = re.exec(text);
    while (match) { matches.push(match[0]); match = re.exec(text); }
    if (matches.length > 0) {
      const trend = detectTrend(text);
      const frequency = matches.length > 3 ? "frequent" : matches.length > 1 ? "occasional" : "single incident";
      cues.push({ cue, frequency, trend, severity });
    }
  }
  return cues;
}

function detectTrend(text) {
  if (/\b(?:escalating|increasing|worsening|more frequent)\b/gi.test(text)) return "increasing";
  if (/\b(?:stable|unchanged|no change|consistent)\b/gi.test(text)) return "stable";
  if (/\b(?:improving|decreasing|less frequent|reduced)\b/gi.test(text)) return "decreasing";
  return "unknown";
}

function extractContextualFactors(text) {
  const factors = [];
  for (const [pattern, factor, intervention] of CONTEXTUAL_RISK_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) factors.push({ factor, intervention });
  }
  return factors;
}

function extractStructuralFactors(text) {
  const factors = [];
  for (const [pattern, description] of STRUCTURAL_RISK_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) factors.push(description);
  }
  return factors;
}

function extractRelationalFactors(text) {
  const factors = [];
  for (const [pattern, description] of RELATIONAL_RISK_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) factors.push(description);
  }
  return factors;
}

function extractProtectiveFactors(text) {
  const factors = [];
  for (const [pattern, factor, strength] of PROTECTIVE_FACTOR_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) factors.push({ factor, strength });
  }
  return factors;
}

function extractStaticRisks(text, context) {
  const risks = [];
  if (/\b(?:prior (?:history|record|involvement)|previous (?:orders?|findings?)|historical)\b/gi.test(text)) {
    risks.push({ risk: "Prior child protection history", evidence: "Prior history referenced in document" });
  }
  if (/\b(?:chronic|long-term|longstanding|years? of)\b/gi.test(text)) {
    risks.push({ risk: "Chronic/long-term concerns", evidence: "Chronic nature of issues noted in document" });
  }
  if (context?.prior_history) {
    risks.push({ risk: "Prior history (from case context)", evidence: "Prior history flag set in case record" });
  }
  return risks;
}

function buildDynamicRisks(contextualFactors) {
  return contextualFactors.map(({ factor, intervention }) => ({ risk: factor, current_level: "high", intervention }));
}

function analyzePatterns(text) {
  const hasEscalation = /\b(?:escalating|escalation|increasing frequency|more frequent|worse)\b/gi.test(text) ||
    /\b(?:crisis|emergency|urgent|immediate risk)\b/gi.test(text);
  const triggers = [];
  for (const [pattern, trigger] of TRIGGER_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) triggers.push(trigger);
  }
  const repetitionMatches = (text.match(/\b(?:again|repeated|recurrent|ongoing|continues to)\b/gi) ?? []).length;
  return {
    repetition: repetitionMatches > 0 ? `Repeated incidents noted (${repetitionMatches} references)` : "No clear repetition pattern detected",
    escalation: hasEscalation ? "Escalation language detected — severity appears to be increasing" : "No clear escalation pattern detected",
    triggers: triggers.length > 0 ? triggers : ["No specific triggers identified"],
  };
}

function assessSituationalAwareness(text, behavioralCues, protectiveFactors) {
  const feelingSafe = protectiveFactors.length >= 3 ? "high" : protectiveFactors.length >= 1 ? "moderate" : "low";
  const ownedResponsibility = /\b(?:acknowledged|takes responsibility|insight|self-aware|recognizes)\b/gi.test(text) ? "high" :
    /\b(?:partly|somewhat|partially acknowledges)\b/gi.test(text) ? "moderate" : "low";
  const expectedPatterns = behavioralCues.length >= 4 ? "high" : behavioralCues.length >= 2 ? "moderate" : "low";
  return { feeling_safe: feelingSafe, owned_responsibility: ownedResponsibility, expected_patterns: expectedPatterns };
}

function scoreDomain(count, maxCount) {
  return Math.min(100, Math.round((count / maxCount) * 100));
}

function scoreDevelopmental(text, context) {
  let score = 30;
  if (context?.child_ages?.some((a) => a <= 3)) score += 30;
  if (/\b(?:developmental delay|below milestones|not meeting milestones)\b/gi.test(text)) score += 20;
  if (/\b(?:age-appropriate|meeting milestones|developmentally on track)\b/gi.test(text)) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function calculateOverallRisk(domains, protectiveFactors, context) {
  const domainAvg = Math.round(
    domains.behavioral * 0.3 + domains.contextual * 0.25 + domains.structural * 0.15 + domains.relational * 0.2 + domains.developmental * 0.1
  );
  const protectiveReduction = Math.min(20, protectiveFactors.length * 4);
  const historyBonus = context?.prior_history ? 10 : 0;
  return Math.max(0, Math.min(100, domainAvg - protectiveReduction + historyBonus));
}

function calculateEscalationRisk(text, behavioralCues, overallScore) {
  let score = overallScore;
  score += behavioralCues.filter((c) => c.trend === "increasing").length * 5;
  score += behavioralCues.filter((c) => c.severity === "high").length * 3;
  if (/\b(?:no change|unchanged|persistent|refused services)\b/gi.test(text)) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildReviewerPrompts(domains, protectiveFactors, behavioralCues) {
  const prompts = [];
  if (domains.behavioral >= 60) {
    prompts.push({ question: "Have behavioural incidents been formally documented with dates, locations, and witnesses?", priority: "high" });
  }
  if (domains.contextual >= 60) {
    prompts.push({ question: "Has a substance use assessment or mental health assessment been completed within the last 90 days?", priority: "high" });
  }
  if (protectiveFactors.length === 0) {
    prompts.push({ question: "What protective factors or strengths exist in this family that could be leveraged for safety planning?", priority: "high" });
  }
  if (behavioralCues.some((c) => c.trend === "increasing")) {
    prompts.push({ question: "Has an escalation safety plan been activated or reviewed given the increasing trend?", priority: "high" });
  }
  prompts.push({ question: "Has the child been seen alone by a worker to assess their views and current experience of safety?", priority: "high" });
  return prompts;
}
