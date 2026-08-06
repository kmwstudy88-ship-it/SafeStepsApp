/**
 * Document Intelligence Engine
 *
 * Provides nine analytical sub-engines that can be applied to any case document
 * or free-form text.  Each engine operates on plain string input and returns a
 * strongly-typed, human-reviewable result.  No AI model is called directly from
 * this module — results are deterministic rule-based analyses intended to surface
 * signals for worker review and to pre-populate server-side AI prompts.
 *
 * Engines
 * -------
 * 1. Fairness Detection
 * 2. Contradiction Detection
 * 3. Evidence Extraction
 * 4. Requirement Extraction
 * 5. Timeline Extraction
 * 6. Risk Assessment
 * 7. Concern Classification
 * 8. Unrealistic Expectation Detection
 * 9. Bias Detection
 */

import {
  biasCategories,
  coreFairnessRules,
  detectHighRiskLanguage,
  fairnessDomains,
  highRiskLanguage,
  prohibitedAiFinalisations,
  type FairnessDomainId,
} from "./fairnessGovernanceFramework";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function sentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function lower(text: string) {
  return text.toLowerCase();
}

// ---------------------------------------------------------------------------
// 1. Fairness Detection
// ---------------------------------------------------------------------------

export type FairnessSignal = {
  domain: FairnessDomainId;
  question: string;
  triggered: boolean;
  triggers: string[];
};

export type FairnessDetectionResult = {
  engine: "fairness_detection";
  score: number;
  maxScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  signals: FairnessSignal[];
  highRiskPhrases: string[];
  prohibitedFinalisations: string[];
  applicableRules: string[];
  reviewRequired: boolean;
  summary: string;
};

const FAIRNESS_DOMAIN_TRIGGERS: Record<FairnessDomainId, string[]> = {
  procedural_fairness: ["not informed", "no notice", "wasn't told", "no opportunity", "no right of reply", "unaware"],
  evidentiary_fairness: ["no evidence", "lack of evidence", "evidence not considered", "excluded evidence", "no documentation"],
  cultural_fairness: [
    "cultural background",
    "cultural practice",
    "interpreter",
    "language barrier",
    "cultural norm",
    "traditional",
    "indigenous",
    "aboriginal",
  ],
  disability_fairness: ["disability", "adjustment", "impairment", "accessibility", "wheelchair", "vision impaired", "hearing impaired"],
  socioeconomic_fairness: [
    "poverty",
    "financial hardship",
    "homeless",
    "unemployed",
    "housing instability",
    "cannot afford",
    "low income",
  ],
  assessor_fairness: ["inconsistent", "bias", "partial", "conflict of interest", "unqualified", "not impartial"],
  algorithmic_fairness: ["automated", "algorithm", "system generated", "ai decision", "machine", "automated flag"],
  outcome_fairness: ["different outcome", "treated differently", "disparate", "inconsistent outcome", "similar cases"],
};

export function detectFairness(text: string): FairnessDetectionResult {
  const t = lower(text);

  const signals: FairnessSignal[] = fairnessDomains.map(({ id, question }) => {
    const triggers = (FAIRNESS_DOMAIN_TRIGGERS[id] ?? []).filter((kw) => t.includes(kw));
    return { domain: id, question, triggered: triggers.length > 0, triggers };
  });

  const triggeredCount = signals.filter((s) => s.triggered).length;
  const highRiskPhrases = detectHighRiskLanguage(text);
  const prohibitedFound = prohibitedAiFinalisations.filter((item) => t.includes(item));

  const score = triggeredCount + highRiskPhrases.length + prohibitedFound.length;
  const maxScore = fairnessDomains.length + highRiskLanguage.length + prohibitedAiFinalisations.length;

  const riskLevel: FairnessDetectionResult["riskLevel"] =
    score === 0 ? "low" : score <= 2 ? "medium" : score <= 5 ? "high" : "critical";

  const applicableRules = coreFairnessRules.filter((_rule, i) => {
    if (i === 1 && signals.find((s) => s.domain === "socioeconomic_fairness")?.triggered) return true;
    if (i === 2 && signals.find((s) => s.domain === "disability_fairness")?.triggered) return true;
    if (i === 6 && signals.find((s) => s.domain === "algorithmic_fairness")?.triggered) return true;
    return score > 0;
  });

  const reviewRequired = riskLevel !== "low";

  const summary =
    triggeredCount === 0 && highRiskPhrases.length === 0
      ? "No immediate fairness signals detected. Standard review applies."
      : `${triggeredCount} fairness domain(s) triggered, ${highRiskPhrases.length} high-risk phrase(s) found. Worker review is required before finalisation.`;

  return {
    engine: "fairness_detection",
    score,
    maxScore,
    riskLevel,
    signals,
    highRiskPhrases,
    prohibitedFinalisations: prohibitedFound,
    applicableRules,
    reviewRequired,
    summary,
  };
}

// ---------------------------------------------------------------------------
// 2. Contradiction Detection
// ---------------------------------------------------------------------------

export type ContradictionCandidate = {
  sentenceA: string;
  sentenceB: string;
  type: "negation" | "date_conflict" | "status_conflict" | "quantity_conflict" | "person_conflict";
  confidence: "low" | "medium" | "high";
  flag: string;
};

export type ContradictionDetectionResult = {
  engine: "contradiction_detection";
  contradictions: ContradictionCandidate[];
  totalFound: number;
  highConfidenceCount: number;
  reviewRequired: boolean;
  summary: string;
};

const NEGATION_PAIRS: [string, string][] = [
  ["is safe", "is not safe"],
  ["engaged", "not engaged"],
  ["completed", "did not complete"],
  ["present", "absent"],
  ["attended", "did not attend"],
  ["compliant", "non-compliant"],
  ["cooperative", "uncooperative"],
  ["stable", "unstable"],
  ["sober", "intoxicated"],
  ["disclosed", "denied"],
  ["agreed", "refused"],
  ["improving", "deteriorating"],
];

const DATE_PATTERN = /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}-\d{2}-\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi;

export function detectContradictions(text: string): ContradictionDetectionResult {
  const parts = sentences(text);
  const found: ContradictionCandidate[] = [];

  // Negation pair detection
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const a = lower(parts[i]);
      const b = lower(parts[j]);

      for (const [positive, negative] of NEGATION_PAIRS) {
        if (a.includes(positive) && b.includes(negative)) {
          found.push({
            sentenceA: parts[i],
            sentenceB: parts[j],
            type: "negation",
            confidence: "high",
            flag: `"${positive}" vs "${negative}"`,
          });
        } else if (a.includes(negative) && b.includes(positive)) {
          found.push({
            sentenceA: parts[i],
            sentenceB: parts[j],
            type: "negation",
            confidence: "high",
            flag: `"${negative}" vs "${positive}"`,
          });
        }
      }

      // Date conflict: two different explicit dates in close proximity about same subject
      const datesA = parts[i].match(DATE_PATTERN);
      const datesB = parts[j].match(DATE_PATTERN);
      if (datesA && datesB && j <= i + 3) {
        const unique = new Set([...(datesA ?? []).map(lower), ...(datesB ?? []).map(lower)]);
        if (unique.size > 1 && (datesA ?? []).some((d) => !(datesB ?? []).map(lower).includes(lower(d)))) {
          found.push({
            sentenceA: parts[i],
            sentenceB: parts[j],
            type: "date_conflict",
            confidence: "medium",
            flag: `Differing dates: ${[...(datesA ?? [])].join(", ")} vs ${[...(datesB ?? [])].join(", ")}`,
          });
        }
      }
    }
  }

  // Status conflict: same subject with contradictory status words in same sentence window
  const statusPairs: [string, string][] = [
    ["open", "closed"],
    ["active", "inactive"],
    ["in progress", "completed"],
    ["ongoing", "resolved"],
  ];
  for (let i = 0; i < parts.length - 1; i++) {
    const a = lower(parts[i]);
    const b = lower(parts[i + 1]);
    for (const [s1, s2] of statusPairs) {
      if ((a.includes(s1) && b.includes(s2)) || (a.includes(s2) && b.includes(s1))) {
        found.push({
          sentenceA: parts[i],
          sentenceB: parts[i + 1],
          type: "status_conflict",
          confidence: "medium",
          flag: `Status conflict: "${s1}" vs "${s2}"`,
        });
      }
    }
  }

  const unique = deduplicate(found, (c) => `${c.sentenceA}||${c.sentenceB}`);
  const highConfidenceCount = unique.filter((c) => c.confidence === "high").length;
  const reviewRequired = unique.length > 0;

  const summary =
    unique.length === 0
      ? "No contradictions detected."
      : `${unique.length} potential contradiction(s) found (${highConfidenceCount} high-confidence). Worker review is required.`;

  return {
    engine: "contradiction_detection",
    contradictions: unique,
    totalFound: unique.length,
    highConfidenceCount,
    reviewRequired,
    summary,
  };
}

// ---------------------------------------------------------------------------
// 3. Evidence Extraction
// ---------------------------------------------------------------------------

export type ExtractedEvidence = {
  sentence: string;
  category:
    | "direct_observation"
    | "reported_information"
    | "documented_fact"
    | "professional_opinion"
    | "historical_record"
    | "court_order"
    | "service_record"
    | "collateral";
  strength: "weak" | "moderate" | "strong";
  tags: string[];
};

export type EvidenceExtractionResult = {
  engine: "evidence_extraction";
  items: ExtractedEvidence[];
  totalFound: number;
  strongCount: number;
  gaps: string[];
  summary: string;
};

const EVIDENCE_PATTERNS: { category: ExtractedEvidence["category"]; keywords: string[]; strength: ExtractedEvidence["strength"] }[] = [
  {
    category: "direct_observation",
    keywords: ["observed", "witnessed", "seen", "noted during visit", "home visit", "worker saw", "I observed", "appeared to"],
    strength: "strong",
  },
  {
    category: "documented_fact",
    keywords: ["confirmed", "documented", "recorded", "report states", "file indicates", "records show", "according to file"],
    strength: "strong",
  },
  {
    category: "court_order",
    keywords: ["court order", "court ordered", "magistrate", "family court", "judge", "tribunal", "orders that"],
    strength: "strong",
  },
  {
    category: "service_record",
    keywords: [
      "service provider",
      "attended",
      "completed program",
      "engaged with",
      "referred to",
      "case notes",
      "service notes",
      "progress report",
    ],
    strength: "moderate",
  },
  {
    category: "professional_opinion",
    keywords: ["assessment indicates", "in my opinion", "assessed as", "clinically", "psychologist", "psychiatrist", "doctor", "paediatrician"],
    strength: "moderate",
  },
  {
    category: "reported_information",
    keywords: ["reported", "stated", "alleged", "claims", "says", "told worker", "according to parent", "according to"],
    strength: "weak",
  },
  {
    category: "historical_record",
    keywords: ["previously", "history of", "prior", "past involvement", "historical", "earlier", "in the past"],
    strength: "weak",
  },
  {
    category: "collateral",
    keywords: ["collateral", "teacher reported", "school said", "neighbour", "family member", "third party"],
    strength: "moderate",
  },
];

const REQUIRED_EVIDENCE_AREAS = [
  "child safety",
  "parenting capacity",
  "housing",
  "substance use",
  "domestic violence",
  "mental health",
  "child development",
  "support network",
];

export function extractEvidence(text: string): EvidenceExtractionResult {
  const parts = sentences(text);
  const items: ExtractedEvidence[] = [];

  for (const sentence of parts) {
    const t = lower(sentence);
    for (const pattern of EVIDENCE_PATTERNS) {
      const matchedKeywords = pattern.keywords.filter((kw) => t.includes(kw));
      if (matchedKeywords.length > 0) {
        items.push({ sentence, category: pattern.category, strength: pattern.strength, tags: matchedKeywords });
        break; // first matching category wins
      }
    }
  }

  const coveredAreas = REQUIRED_EVIDENCE_AREAS.filter((area) => lower(text).includes(area));
  const gaps = REQUIRED_EVIDENCE_AREAS.filter((area) => !coveredAreas.includes(area));
  const strongCount = items.filter((e) => e.strength === "strong").length;

  const summary =
    items.length === 0
      ? "No evidence statements identified. Manual evidence review required."
      : `${items.length} evidence item(s) extracted (${strongCount} strong). ${gaps.length > 0 ? `Gaps: ${gaps.join(", ")}.` : "All standard areas covered."}`;

  return {
    engine: "evidence_extraction",
    items,
    totalFound: items.length,
    strongCount,
    gaps,
    summary,
  };
}

// ---------------------------------------------------------------------------
// 4. Requirement Extraction
// ---------------------------------------------------------------------------

export type ExtractedRequirement = {
  sentence: string;
  requirementType:
    | "legal_order"
    | "case_plan_condition"
    | "service_engagement"
    | "behaviour_change"
    | "reporting_obligation"
    | "supervision_condition"
    | "training_completion"
    | "assessment_completion";
  obligationLevel: "must" | "should" | "may";
  party: "parent" | "worker" | "service_provider" | "court" | "child" | "agency" | "unknown";
  timeframe: string | null;
};

export type RequirementExtractionResult = {
  engine: "requirement_extraction";
  requirements: ExtractedRequirement[];
  totalFound: number;
  overdueRiskItems: ExtractedRequirement[];
  summary: string;
};

const MUST_WORDS = ["must", "required to", "is ordered", "shall", "is expected to", "will complete", "needs to"];
const SHOULD_WORDS = ["should", "is encouraged to", "is recommended", "is requested", "is asked to"];
const MAY_WORDS = ["may", "can", "is permitted to", "has the option"];

const REQUIREMENT_TYPE_PATTERNS: { type: ExtractedRequirement["requirementType"]; keywords: string[] }[] = [
  { type: "legal_order", keywords: ["court order", "court ordered", "magistrate directed", "judge ordered", "orders that"] },
  { type: "case_plan_condition", keywords: ["case plan", "case plan requirement", "case plan goal", "case plan objective"] },
  { type: "service_engagement", keywords: ["attend", "engage with", "participate in", "enrol in", "complete program", "access service"] },
  { type: "behaviour_change", keywords: ["must not ", "cease", "refrain from", "stop using", "change behaviour", "demonstrate"] },
  { type: "reporting_obligation", keywords: ["report to", "notify", "inform worker", "update worker", "advise", "disclose"] },
  { type: "supervision_condition", keywords: ["supervised", "under supervision", "supervised contact", "supervised visits"] },
  { type: "training_completion", keywords: ["complete training", "parenting program", "complete course", "skills program"] },
  { type: "assessment_completion", keywords: ["undergo assessment", "complete assessment", "assessment required", "psychological assessment", "drug test"] },
];

const PARTY_PATTERNS: { party: ExtractedRequirement["party"]; keywords: string[] }[] = [
  { party: "parent", keywords: ["parent", "mother", "father", "carer", "guardian", "mr", "ms", "mrs"] },
  { party: "worker", keywords: ["worker", "case manager", "social worker", "officer", "practitioner"] },
  { party: "service_provider", keywords: ["service provider", "provider", "organisation", "agency partner"] },
  { party: "court", keywords: ["court", "magistrate", "judge", "tribunal"] },
  { party: "child", keywords: ["child", "children", "young person"] },
  { party: "agency", keywords: ["department", "child safety", "dcj", "docs", "cyfs", "agency"] },
];

const TIMEFRAME_PATTERN = /\b(within \d+ \w+|by \w+ \d{4}|before \w+|immediately|forthwith|as soon as|within \w+ days?|in \d+ weeks?)\b/gi;

export function extractRequirements(text: string): RequirementExtractionResult {
  const parts = sentences(text);
  const requirements: ExtractedRequirement[] = [];

  for (const sentence of parts) {
    const t = lower(sentence);

    const obligationLevel: ExtractedRequirement["obligationLevel"] = MUST_WORDS.some((w) => t.includes(w))
      ? "must"
      : SHOULD_WORDS.some((w) => t.includes(w))
        ? "should"
        : MAY_WORDS.some((w) => t.includes(w))
          ? "may"
          : ("must" as ExtractedRequirement["obligationLevel"]);

    const matchedType = REQUIREMENT_TYPE_PATTERNS.find((p) => p.keywords.some((kw) => t.includes(kw)));
    if (!matchedType) continue;

    const matchedParty = PARTY_PATTERNS.find((p) => p.keywords.some((kw) => t.includes(kw)));
    const timeframeMatch = sentence.match(TIMEFRAME_PATTERN);

    requirements.push({
      sentence,
      requirementType: matchedType.type,
      obligationLevel,
      party: matchedParty?.party ?? "unknown",
      timeframe: timeframeMatch ? timeframeMatch[0] : null,
    });
  }

  const overdueRiskItems = requirements.filter(
    (r) => r.obligationLevel === "must" && r.timeframe !== null,
  );

  const summary =
    requirements.length === 0
      ? "No formal requirements identified. Manual review recommended."
      : `${requirements.length} requirement(s) extracted. ${overdueRiskItems.length} include mandatory timeframes and should be tracked.`;

  return {
    engine: "requirement_extraction",
    requirements,
    totalFound: requirements.length,
    overdueRiskItems,
    summary,
  };
}

// ---------------------------------------------------------------------------
// 5. Timeline Extraction
// ---------------------------------------------------------------------------

export type TimelineEvent = {
  sentence: string;
  rawDate: string;
  normalizedDate: string | null;
  eventType:
    | "incident"
    | "assessment"
    | "court_event"
    | "service_event"
    | "family_event"
    | "notification"
    | "contact"
    | "removal"
    | "reunification"
    | "other";
  subject: string | null;
};

export type TimelineExtractionResult = {
  engine: "timeline_extraction";
  events: TimelineEvent[];
  totalFound: number;
  orderedEvents: TimelineEvent[];
  chronologyGaps: string[];
  summary: string;
};

const TIMELINE_EVENT_PATTERNS: { type: TimelineEvent["eventType"]; keywords: string[] }[] = [
  { type: "incident", keywords: ["incident", "reported", "alleged", "substantiated", "investigation", "harm", "injury"] },
  { type: "assessment", keywords: ["assessed", "assessment", "reviewed", "evaluation", "scored"] },
  { type: "court_event", keywords: ["court", "hearing", "orders", "judgment", "adjourned", "magistrate"] },
  { type: "service_event", keywords: ["attended", "completed", "program", "service", "referral", "engaged"] },
  { type: "family_event", keywords: ["born", "death", "separation", "relationship", "moved", "relocated", "marriage"] },
  { type: "notification", keywords: ["notification", "notified", "report received", "concern raised", "intake"] },
  { type: "contact", keywords: ["contact", "visit", "supervised", "phone call", "meeting"] },
  { type: "removal", keywords: ["removed", "placed in care", "placed with", "foster care", "out-of-home"] },
  { type: "reunification", keywords: ["reunified", "returned home", "returned to parent", "restored", "home placement"] },
];

const MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec";
const DATE_EXTRACT_PATTERN = new RegExp(
  `\\b(\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4}|\\d{4}-\\d{2}-\\d{2}|(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{4}|\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4})\\b`,
  "gi",
);

function tryNormalizeDate(raw: string): string | null {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

export function extractTimeline(text: string): TimelineExtractionResult {
  const parts = sentences(text);
  const events: TimelineEvent[] = [];

  for (const sentence of parts) {
    const t = lower(sentence);
    const dateMatches = sentence.match(DATE_EXTRACT_PATTERN);
    if (!dateMatches || dateMatches.length === 0) continue;

    const matchedType = TIMELINE_EVENT_PATTERNS.find((p) => p.keywords.some((kw) => t.includes(kw)));

    for (const rawDate of dateMatches) {
      events.push({
        sentence,
        rawDate,
        normalizedDate: tryNormalizeDate(rawDate),
        eventType: matchedType?.type ?? "other",
        subject: extractSubject(sentence),
      });
    }
  }

  const orderedEvents = [...events]
    .filter((e) => e.normalizedDate !== null)
    .sort((a, b) => (a.normalizedDate! < b.normalizedDate! ? -1 : 1));

  const chronologyGaps = detectChronologyGaps(orderedEvents);

  const summary =
    events.length === 0
      ? "No dated events extracted. Timeline cannot be constructed from available text."
      : `${events.length} dated event(s) extracted. ${chronologyGaps.length > 0 ? `${chronologyGaps.length} chronological gap(s) noted.` : "Chronology appears continuous."}`;

  return {
    engine: "timeline_extraction",
    events,
    totalFound: events.length,
    orderedEvents,
    chronologyGaps,
    summary,
  };
}

function extractSubject(sentence: string): string | null {
  const subjectMatch = sentence.match(/\b(the child|the parent|the mother|the father|the family|the carer|the worker|[A-Z][a-z]+ [A-Z][a-z]+)\b/);
  return subjectMatch ? subjectMatch[1] : null;
}

function detectChronologyGaps(orderedEvents: TimelineEvent[]): string[] {
  const gaps: string[] = [];
  for (let i = 1; i < orderedEvents.length; i++) {
    const prev = new Date(orderedEvents[i - 1].normalizedDate!);
    const curr = new Date(orderedEvents[i].normalizedDate!);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365) {
      gaps.push(
        `Gap of ${Math.round(diffDays / 30)} months between ${orderedEvents[i - 1].normalizedDate} and ${orderedEvents[i].normalizedDate}`,
      );
    }
  }
  return gaps;
}

// ---------------------------------------------------------------------------
// 6. Risk Assessment
// ---------------------------------------------------------------------------

export type RiskFactor = {
  category:
    | "child_safety"
    | "domestic_violence"
    | "substance_use"
    | "mental_health"
    | "housing_instability"
    | "historical_abuse"
    | "parental_capacity"
    | "protective_factors_absent"
    | "social_isolation"
    | "non_compliance";
  sentence: string;
  keywords: string[];
  severity: "low" | "medium" | "high" | "critical";
};

export type RiskAssessmentResult = {
  engine: "risk_assessment";
  factors: RiskFactor[];
  totalFactors: number;
  criticalCount: number;
  highCount: number;
  overallRiskLevel: "low" | "medium" | "high" | "critical";
  immediateActionRequired: boolean;
  protectiveFactorsPresent: string[];
  summary: string;
};

const RISK_PATTERNS: { category: RiskFactor["category"]; keywords: string[]; severity: RiskFactor["severity"] }[] = [
  {
    category: "child_safety",
    keywords: ["immediate danger", "at risk of harm", "unsafe", "physical injury", "emergency removal", "safety concern"],
    severity: "critical",
  },
  {
    category: "domestic_violence",
    keywords: ["domestic violence", "family violence", "coercive control", "assault", "threatened", "fear for safety"],
    severity: "high",
  },
  {
    category: "substance_use",
    keywords: ["substance use", "drug use", "alcohol", "intoxicated", "using drugs", "relapsed", "overdose"],
    severity: "high",
  },
  {
    category: "mental_health",
    keywords: ["mental health", "psychiatric", "depression", "anxiety", "psychosis", "suicidal", "self-harm"],
    severity: "medium",
  },
  {
    category: "housing_instability",
    keywords: ["homeless", "unstable housing", "evicted", "no fixed address", "couch surfing", "temporary accommodation"],
    severity: "medium",
  },
  {
    category: "historical_abuse",
    keywords: ["history of abuse", "previous substantiation", "prior removal", "past violence", "childhood trauma"],
    severity: "medium",
  },
  {
    category: "parental_capacity",
    keywords: ["unable to care", "not meeting needs", "neglect", "fails to supervise", "inadequate care"],
    severity: "high",
  },
  {
    category: "protective_factors_absent",
    keywords: ["no support", "isolated", "no family network", "no services", "declined referral", "refused help"],
    severity: "medium",
  },
  {
    category: "social_isolation",
    keywords: ["socially isolated", "no friends", "no community", "withdrawn", "disengaged"],
    severity: "low",
  },
  {
    category: "non_compliance",
    keywords: ["non-compliant", "refused", "did not attend", "disengaged from", "failed to", "missed appointments"],
    severity: "medium",
  },
];

const PROTECTIVE_FACTOR_KEYWORDS = [
  "protective factor",
  "support network",
  "engaged with services",
  "attending program",
  "stable housing",
  "employment",
  "positive parenting",
  "insight",
  "motivated to change",
  "family support",
  "improvement noted",
];

export function assessRisk(text: string): RiskAssessmentResult {
  const parts = sentences(text);
  const factors: RiskFactor[] = [];

  for (const sentence of parts) {
    const t = lower(sentence);
    for (const pattern of RISK_PATTERNS) {
      const matched = pattern.keywords.filter((kw) => t.includes(kw));
      if (matched.length > 0) {
        factors.push({ category: pattern.category, sentence, keywords: matched, severity: pattern.severity });
      }
    }
  }

  const t = lower(text);
  const protectiveFactorsPresent = PROTECTIVE_FACTOR_KEYWORDS.filter((kw) => t.includes(kw));

  const criticalCount = factors.filter((f) => f.severity === "critical").length;
  const highCount = factors.filter((f) => f.severity === "high").length;

  const overallRiskLevel: RiskAssessmentResult["overallRiskLevel"] =
    criticalCount > 0 ? "critical" : highCount >= 2 ? "high" : highCount === 1 ? "medium" : factors.length > 0 ? "low" : "low";

  const immediateActionRequired = criticalCount > 0;

  const summary =
    factors.length === 0
      ? "No risk indicators detected in available text. Standard monitoring applies."
      : `${factors.length} risk factor(s) identified. Overall risk: ${overallRiskLevel.toUpperCase()}. ${immediateActionRequired ? "IMMEDIATE ACTION REQUIRED." : ""} ${protectiveFactorsPresent.length} protective factor(s) noted.`;

  return {
    engine: "risk_assessment",
    factors,
    totalFactors: factors.length,
    criticalCount,
    highCount,
    overallRiskLevel,
    immediateActionRequired,
    protectiveFactorsPresent,
    summary,
  };
}

// ---------------------------------------------------------------------------
// 7. Concern Classification
// ---------------------------------------------------------------------------

export type ClassifiedConcern = {
  sentence: string;
  concernType:
    | "child_wellbeing"
    | "parental_capacity"
    | "domestic_violence"
    | "substance_use"
    | "mental_health"
    | "housing"
    | "financial_hardship"
    | "cultural_safety"
    | "education"
    | "medical"
    | "legal"
    | "compliance"
    | "relationship"
    | "other";
  severity: "low" | "moderate" | "serious" | "critical";
  actionable: boolean;
  suggestedAction: string;
};

export type ConcernClassificationResult = {
  engine: "concern_classification";
  concerns: ClassifiedConcern[];
  totalFound: number;
  criticalConcerns: ClassifiedConcern[];
  actionableCount: number;
  topConcernTypes: string[];
  summary: string;
};

const CONCERN_PATTERNS: {
  type: ClassifiedConcern["concernType"];
  keywords: string[];
  severity: ClassifiedConcern["severity"];
  action: string;
}[] = [
  {
    type: "child_wellbeing",
    keywords: ["child appears", "child is at risk", "child was injured", "children are at risk", "child safety concern", "young person at risk"],
    severity: "serious",
    action: "Conduct child-focused safety assessment.",
  },
  {
    type: "domestic_violence",
    keywords: ["domestic violence", "family violence", "assault", "threatened", "abusive behaviour", "coercive"],
    severity: "critical",
    action: "Activate safety planning and DV specialist referral.",
  },
  {
    type: "substance_use",
    keywords: ["substance use", "alcohol use", "drug use", "intoxicated", "using drugs", "using alcohol", "relapsed"],
    severity: "serious",
    action: "Refer for AOD assessment and support.",
  },
  {
    type: "mental_health",
    keywords: ["mental health", "depression", "anxiety", "psychosis", "psychiatric", "suicidal"],
    severity: "serious",
    action: "Refer to mental health services and support planning.",
  },
  {
    type: "housing",
    keywords: ["housing", "homeless", "evicted", "eviction", "unstable", "no fixed address", "accommodation"],
    severity: "moderate",
    action: "Refer to housing support service.",
  },
  {
    type: "financial_hardship",
    keywords: ["financial", "poverty", "debt", "cannot afford", "no income", "low income"],
    severity: "low",
    action: "Refer to financial counselling and entitlements support.",
  },
  {
    type: "cultural_safety",
    keywords: ["cultural", "aboriginal", "indigenous", "language", "interpreter", "cultural practice"],
    severity: "moderate",
    action: "Engage cultural liaison and ensure culturally safe practice.",
  },
  {
    type: "education",
    keywords: ["school", "education", "attendance", "not attending", "learning difficulties", "suspended"],
    severity: "moderate",
    action: "Liaise with school and education support.",
  },
  {
    type: "medical",
    keywords: ["medical", "health", "diagnosis", "condition", "medication", "treatment", "hospital"],
    severity: "moderate",
    action: "Ensure medical follow-up and health coordination.",
  },
  {
    type: "legal",
    keywords: ["court", "charges", "legal", "criminal", "order", "proceedings", "bail"],
    severity: "serious",
    action: "Coordinate with legal services and monitor compliance.",
  },
  {
    type: "compliance",
    keywords: ["non-compliant", "missed", "failed to", "refused", "did not attend", "disengaged"],
    severity: "serious",
    action: "Review case plan compliance and escalate as required.",
  },
  {
    type: "parental_capacity",
    keywords: ["unable to", "not meeting", "neglect", "inadequate", "fails to", "incapable"],
    severity: "critical",
    action: "Conduct parental capacity assessment.",
  },
  {
    type: "relationship",
    keywords: ["relationship", "conflict", "separation", "co-parenting", "estranged"],
    severity: "low",
    action: "Refer to relationship support or mediation.",
  },
];

export function classifyConcerns(text: string): ConcernClassificationResult {
  const parts = sentences(text);
  const concerns: ClassifiedConcern[] = [];

  for (const sentence of parts) {
    const t = lower(sentence);
    for (const pattern of CONCERN_PATTERNS) {
      const matched = pattern.keywords.filter((kw) => t.includes(kw));
      if (matched.length > 0) {
        concerns.push({
          sentence,
          concernType: pattern.type,
          severity: pattern.severity,
          actionable: true,
          suggestedAction: pattern.action,
        });
        break;
      }
    }
  }

  const criticalConcerns = concerns.filter((c) => c.severity === "critical");
  const actionableCount = concerns.filter((c) => c.actionable).length;

  const typeCounts = concerns.reduce<Record<string, number>>((acc, c) => {
    acc[c.concernType] = (acc[c.concernType] ?? 0) + 1;
    return acc;
  }, {});
  const topConcernTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  const summary =
    concerns.length === 0
      ? "No classifiable concerns detected. Review document content manually."
      : `${concerns.length} concern(s) classified. ${criticalConcerns.length} critical. Top concern types: ${topConcernTypes.join(", ")}.`;

  return {
    engine: "concern_classification",
    concerns,
    totalFound: concerns.length,
    criticalConcerns,
    actionableCount,
    topConcernTypes,
    summary,
  };
}

// ---------------------------------------------------------------------------
// 8. Unrealistic Expectation Detection
// ---------------------------------------------------------------------------

export type UnrealisticExpectation = {
  sentence: string;
  pattern: string;
  category:
    | "timeframe_too_short"
    | "multiple_simultaneous_demands"
    | "prerequisite_missing"
    | "resource_unavailable"
    | "literacy_or_language_barrier"
    | "trauma_response_mislabelled"
    | "systemic_barrier_ignored";
  explanation: string;
  recommendedAdjustment: string;
};

export type UnrealisticExpectationResult = {
  engine: "unrealistic_expectation_detection";
  expectations: UnrealisticExpectation[];
  totalFound: number;
  reviewRequired: boolean;
  summary: string;
};

const UNREALISTIC_PATTERNS: {
  pattern: string;
  triggers: string[];
  category: UnrealisticExpectation["category"];
  explanation: string;
  adjustment: string;
}[] = [
  {
    pattern: "immediate behaviour change",
    triggers: ["must immediately", "within 24 hours", "before next visit", "by tomorrow", "must stop immediately"],
    category: "timeframe_too_short",
    explanation: "Sustained behaviour change typically requires weeks to months of support, not hours.",
    adjustment: "Set staged milestones with achievable short-term, medium-term and long-term goals.",
  },
  {
    pattern: "multiple simultaneous program requirements",
    triggers: ["must attend", "must also complete", "as well as", "in addition to attending", "alongside"],
    category: "multiple_simultaneous_demands",
    explanation: "Requiring multiple programs concurrently may be impossible given work, care and transport obligations.",
    adjustment: "Sequence requirements and prioritise based on safety need and parent capacity.",
  },
  {
    pattern: "expected to engage despite no service available",
    triggers: ["no waitlist", "no available service", "service not available", "no local service", "waitlist of"],
    category: "resource_unavailable",
    explanation: "Parents cannot be held non-compliant for failing to access services that are unavailable.",
    adjustment: "Identify alternative services or adjust the expectation to account for service availability.",
  },
  {
    pattern: "complex literacy or language requirements without support",
    triggers: ["must read", "must sign", "must complete form", "must submit written", "review the document"],
    category: "literacy_or_language_barrier",
    explanation: "Written requirements may be inaccessible for parents with literacy difficulties or NESB backgrounds.",
    adjustment: "Provide oral explanations, plain-language documents and interpreter support as needed.",
  },
  {
    pattern: "trauma response interpreted as non-compliance",
    triggers: ["refused to engage", "shut down", "became emotional", "walked out", "did not respond", "was defensive"],
    category: "trauma_response_mislabelled",
    explanation: "Trauma responses including shutdown, avoidance and distress are often mislabelled as non-compliance or lack of motivation.",
    adjustment: "Apply trauma-informed lens; consult with trauma specialist before recording as non-compliance.",
  },
  {
    pattern: "poverty-driven barrier treated as parental choice",
    triggers: ["chose not to", "failed to purchase", "did not provide", "has not bought", "could not provide"],
    category: "systemic_barrier_ignored",
    explanation: "Failure to provide material items may reflect financial constraint, not disengagement or lack of care.",
    adjustment: "Assess financial situation and refer to material aid before recording as a capacity concern.",
  },
  {
    pattern: "change required before support provided",
    triggers: ["before receiving services", "once stable", "when ready", "after demonstrating"],
    category: "prerequisite_missing",
    explanation: "Requiring change before providing support may be circular — parents cannot change without support.",
    adjustment: "Provide support concurrent with expectation of change, not contingent on change occurring first.",
  },
];

export function detectUnrealisticExpectations(text: string): UnrealisticExpectationResult {
  const parts = sentences(text);
  const expectations: UnrealisticExpectation[] = [];

  for (const sentence of parts) {
    const t = lower(sentence);
    for (const pattern of UNREALISTIC_PATTERNS) {
      const matched = pattern.triggers.filter((kw) => t.includes(kw));
      if (matched.length > 0) {
        expectations.push({
          sentence,
          pattern: pattern.pattern,
          category: pattern.category,
          explanation: pattern.explanation,
          recommendedAdjustment: pattern.adjustment,
        });
        break;
      }
    }
  }

  const unique = deduplicate(expectations, (e) => e.sentence);
  const reviewRequired = unique.length > 0;

  const summary =
    unique.length === 0
      ? "No unrealistic expectations detected."
      : `${unique.length} potentially unrealistic expectation(s) identified. Worker review is required to ensure requirements are fair and achievable.`;

  return {
    engine: "unrealistic_expectation_detection",
    expectations: unique,
    totalFound: unique.length,
    reviewRequired,
    summary,
  };
}

// ---------------------------------------------------------------------------
// 9. Bias Detection
// ---------------------------------------------------------------------------

export type BiasIndicator = {
  sentence: string;
  biasType: (typeof biasCategories)[number];
  phrase: string;
  explanation: string;
  reviewPrompt: string;
};

export type BiasDetectionResult = {
  engine: "bias_detection";
  indicators: BiasIndicator[];
  totalFound: number;
  biasTypesFound: string[];
  highRiskPhrases: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  reviewRequired: boolean;
  summary: string;
};

const BIAS_TYPE_TRIGGERS: Partial<Record<(typeof biasCategories)[number], string[]>> = {
  "confirmation bias": [
    "as expected",
    "as previously noted",
    "consistent with prior",
    "further confirms",
    "as anticipated",
  ],
  anchoring: ["initial assessment", "first impression", "originally assessed", "early indication"],
  "recency bias": ["recently", "in the last week", "over the past few days", "just this week"],
  "negativity bias": ["despite", "however", "notwithstanding", "although progress", "even though"],
  "cultural bias": ["cultural background", "cultural practice", "unusual", "different from norm", "non-standard"],
  "class bias": ["lives in", "low-income area", "housing commission", "social housing", "welfare"],
  "disability bias": ["limited ability", "struggles with", "unable to understand", "cognitive limitations"],
  "gender bias": ["mother should", "father rarely", "typical of mothers", "as a woman", "male behaviour"],
  "racial or ethnic bias": ["background", "ethnicity", "cultural group", "community", "origin"],
  "language bias": ["poor english", "limited english", "does not understand", "language difficulties"],
  "automation bias": ["system flagged", "algorithm identified", "risk score", "tool assessed", "risk rating"],
  "outcome bias": ["given the outcome", "because of what happened", "in light of events", "following the incident"],
};

const BIAS_EXPLANATIONS: Partial<Record<(typeof biasCategories)[number], string>> = {
  "confirmation bias": "New information may be being interpreted to fit an existing view rather than assessed independently.",
  anchoring: "The assessment may be anchored to early information which has not been adequately revisited.",
  "recency bias": "Recent events may be weighted more heavily than the overall pattern of behaviour and change.",
  "negativity bias": "Positive changes and protective factors may be discounted or minimised.",
  "cultural bias": "Cultural practices may be interpreted through a western or dominant cultural framework.",
  "class bias": "Socioeconomic circumstances may be conflated with parental motivation or capacity.",
  "disability bias": "Disability may be conflated with parental incapacity without adequate adjustment or support.",
  "gender bias": "Expectations or assessments may differ based on the parent's gender rather than evidence.",
  "racial or ethnic bias": "Racial or ethnic background may be influencing interpretation of behaviour or risk.",
  "language bias": "Language difficulties may be misinterpreted as lack of understanding, engagement or capacity.",
  "automation bias": "An automated risk tool may be over-relied upon without adequate human verification.",
  "outcome bias": "The assessment may be influenced by knowing the outcome rather than the quality of the decision at the time.",
};

const BIAS_REVIEW_PROMPTS: Partial<Record<(typeof biasCategories)[number], string>> = {
  "confirmation bias": "Would this evidence be interpreted the same way if we had no prior information about this person?",
  anchoring: "Have we revisited our initial assessment as new evidence emerged?",
  "recency bias": "Are we giving appropriate weight to the longer-term pattern of change?",
  "negativity bias": "Have we given adequate weight to strengths and protective factors?",
  "cultural bias": "Have we consulted a cultural advisor before interpreting this practice as a concern?",
  "class bias": "Have we distinguished financial hardship from unwillingness or neglect?",
  "disability bias": "Have we ensured all adjustments are in place before assessing capacity?",
  "gender bias": "Would we apply the same expectation or concern to a parent of a different gender?",
  "racial or ethnic bias": "Have we applied the same standards as we would to families from the dominant cultural group?",
  "language bias": "Have we ensured adequate interpreter support and accessible communication?",
  "automation bias": "Have we independently verified the automated risk finding with our own assessment?",
  "outcome bias": "Are we evaluating the decision process fairly, independent of the eventual outcome?",
};

export function detectBias(text: string): BiasDetectionResult {
  const parts = sentences(text);
  const indicators: BiasIndicator[] = [];
  const highRiskPhrases = detectHighRiskLanguage(text);

  for (const sentence of parts) {
    const t = lower(sentence);
    for (const biasType of biasCategories) {
      const triggers = BIAS_TYPE_TRIGGERS[biasType] ?? [];
      const matched = triggers.filter((kw) => t.includes(kw));
      for (const phrase of matched) {
        indicators.push({
          sentence,
          biasType,
          phrase,
          explanation: BIAS_EXPLANATIONS[biasType] ?? "Potential bias signal detected.",
          reviewPrompt: BIAS_REVIEW_PROMPTS[biasType] ?? "Review this statement for potential bias before finalising.",
        });
      }
    }
  }

  const uniqueIndicators = deduplicate(indicators, (i) => `${i.sentence}||${i.biasType}`);
  const biasTypesFound = [...new Set(uniqueIndicators.map((i) => i.biasType))];

  const score = uniqueIndicators.length + highRiskPhrases.length;
  const riskLevel: BiasDetectionResult["riskLevel"] =
    score === 0 ? "low" : score <= 2 ? "medium" : score <= 5 ? "high" : "critical";

  const reviewRequired = riskLevel !== "low";

  const summary =
    uniqueIndicators.length === 0 && highRiskPhrases.length === 0
      ? "No bias indicators detected."
      : `${uniqueIndicators.length} bias indicator(s) found across ${biasTypesFound.length} bias type(s). ${highRiskPhrases.length} high-risk phrase(s) also detected. Worker review required.`;

  return {
    engine: "bias_detection",
    indicators: uniqueIndicators,
    totalFound: uniqueIndicators.length,
    biasTypesFound,
    highRiskPhrases,
    riskLevel,
    reviewRequired,
    summary,
  };
}

// ---------------------------------------------------------------------------
// Composite: run all nine engines in one call
// ---------------------------------------------------------------------------

export type DocumentIntelligenceEngineResult = {
  fairnessDetection: FairnessDetectionResult;
  contradictionDetection: ContradictionDetectionResult;
  evidenceExtraction: EvidenceExtractionResult;
  requirementExtraction: RequirementExtractionResult;
  timelineExtraction: TimelineExtractionResult;
  riskAssessment: RiskAssessmentResult;
  concernClassification: ConcernClassificationResult;
  unrealisticExpectationDetection: UnrealisticExpectationResult;
  biasDetection: BiasDetectionResult;
};

export function runDocumentIntelligenceEngines(text: string): DocumentIntelligenceEngineResult {
  return {
    fairnessDetection: detectFairness(text),
    contradictionDetection: detectContradictions(text),
    evidenceExtraction: extractEvidence(text),
    requirementExtraction: extractRequirements(text),
    timelineExtraction: extractTimeline(text),
    riskAssessment: assessRisk(text),
    concernClassification: classifyConcerns(text),
    unrealisticExpectationDetection: detectUnrealisticExpectations(text),
    biasDetection: detectBias(text),
  };
}

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function deduplicate<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
