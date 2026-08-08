export type ContradictionSeverity = "low" | "medium" | "high";

export type ContradictionCaseContext = {
  case_type?: "reunification" | "custody" | "protection" | "intervention_order" | null;
  family_composition?: "single_parent" | "two_parent" | "multi_generational" | "other" | null;
  child_ages?: number[] | null;
};

export type ContradictionStatement = {
  source: string;
  text: string;
};

export type Contradiction = {
  type: string;
  severity: ContradictionSeverity;
  statement_a: ContradictionStatement;
  statement_b: ContradictionStatement;
  gap_description: string;
  resolution_suggestion: string;
};

export type ConsistencyGap = {
  type: string;
  description: string;
  severity: ContradictionSeverity;
};

export type ReviewerPrompt = {
  question: string;
  priority: "high" | "medium" | "low";
};

export type ContradictionDetectionResult = {
  contradiction_score: number;
  contradictions: Contradiction[];
  consistency_gaps: ConsistencyGap[];
  cross_document_confidence: Record<string, number>;
  evidence_conflicts: ConsistencyGap[];
  reviewer_prompts: ReviewerPrompt[];
  limitations: string;
  timestamp: string;
};

const LIMITATIONS =
  "This tool supports human review. Final determinations remain with decision-makers.";

const NEGATION_PAIRS: Array<[RegExp, RegExp, string]> = [
  [
    /\bwas (?:not |not )?home\b/gi,
    /\bwas not home\b/gi,
    "Conflicting accounts of presence at home",
  ],
  [
    /\bdid (?:not )?attend\b/gi,
    /\bdid not attend\b/gi,
    "Conflicting attendance claim",
  ],
  [
    /\b(?:no|without) (?:history of )?(?:violence|abuse|neglect)\b/gi,
    /\bhistory of (?:violence|abuse|neglect)\b/gi,
    "Conflicting safety history",
  ],
  [
    /\bsober\b/gi,
    /\bintoxicated\b/gi,
    "Conflicting account of sobriety",
  ],
  [
    /\bdoes not use (?:drugs|alcohol|substances)\b/gi,
    /\b(?:drug|alcohol|substance) use\b/gi,
    "Conflicting substance use claim",
  ],
];

const CAPACITY_CONFLICT_PATTERNS: Array<[RegExp, string]> = [
  [/\bunable to (?:care|parent|supervise)\b/gi, "Parenting capacity negated"],
  [/\bcapable? (?:of )?(?:caring|parenting|providing)\b/gi, "Parenting capacity affirmed"],
  [/\bnever harmed (?:the )?child\b/gi, "Safety claim made"],
  [/\bchild was harmed\b/gi, "Harm documented"],
];

const TEMPORAL_CONFLICT_PATTERNS: Array<[RegExp, string]> = [
  [/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi, "month reference"],
  [/\b20\d{2}-\d{2}-\d{2}\b/g, "ISO date"],
  [/\b\d{1,2}\/\d{1,2}\/20\d{2}\b/g, "date reference"],
  [/\b\d{1,2} (?:days?|weeks?|months?) ago\b/gi, "relative date"],
];

const ABSOLUTE_CLAIM_PATTERNS: Array<[RegExp, string, ContradictionSeverity]> = [
  [/\balways (?:was|is|has been)\b/gi, "Absolute positive claim", "medium"],
  [/\bnever (?:was|is|has been|happened)\b/gi, "Absolute negative claim", "medium"],
  [/\bevery (?:time|occasion|visit)\b/gi, "Absolute frequency claim", "low"],
  [/\bnot once\b/gi, "Absolute frequency negation", "medium"],
];

export function normalizeContradictionText(text: string): string {
  if (typeof text !== "string") throw new Error("Contradiction analysis requires text.");
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) throw new Error("Contradiction analysis requires non-empty text.");
  return normalized;
}

export function analyzeContradictions(
  text: string,
  _caseContext?: ContradictionCaseContext | null,
): ContradictionDetectionResult {
  const source = normalizeContradictionText(text);

  const contradictions: Contradiction[] = detectNegationContradictions(source);
  const consistency_gaps: ConsistencyGap[] = detectConsistencyGaps(source);
  const evidence_conflicts: ConsistencyGap[] = detectEvidenceConflicts(source);
  const reviewer_prompts: ReviewerPrompt[] = buildReviewerPrompts(contradictions, consistency_gaps);
  const cross_document_confidence = buildCrossDocumentConfidence(source);

  const contradiction_score = calculateContradictionScore({
    contradictionCount: contradictions.length,
    gapCount: consistency_gaps.length,
    conflictCount: evidence_conflicts.length,
    textLength: source.length,
  });

  return {
    contradiction_score,
    contradictions,
    consistency_gaps,
    cross_document_confidence,
    evidence_conflicts,
    reviewer_prompts,
    limitations: LIMITATIONS,
    timestamp: new Date().toISOString(),
  };
}

function detectNegationContradictions(text: string): Contradiction[] {
  const results: Contradiction[] = [];

  for (const [_patternA, negatedPattern, description] of NEGATION_PAIRS) {
    const negMatches = matchAll(text, negatedPattern);
    const allMatches = matchAll(text, _patternA);

    const positiveMatches = allMatches.filter((m) => !negatedPattern.test(m));
    negatedPattern.lastIndex = 0;

    if (positiveMatches.length > 0 && negMatches.length > 0) {
      results.push({
        type: "direct_conflict",
        severity: "high",
        statement_a: {
          source: "Document (positive claim)",
          text: truncate(positiveMatches[0]),
        },
        statement_b: {
          source: "Document (negating claim)",
          text: truncate(negMatches[0]),
        },
        gap_description: description,
        resolution_suggestion:
          "Obtain corroborating documentation from an independent source and reconcile the timeline.",
      });
    }
  }

  for (const [patternA, labelA] of CAPACITY_CONFLICT_PATTERNS) {
    const matchesA = matchAll(text, patternA);
    if (matchesA.length > 0) {
      const oppositeIndex = CAPACITY_CONFLICT_PATTERNS.indexOf([patternA, labelA] as typeof CAPACITY_CONFLICT_PATTERNS[0]);
      if (oppositeIndex % 2 === 0 && CAPACITY_CONFLICT_PATTERNS[oppositeIndex + 1]) {
        const [patternB, labelB] = CAPACITY_CONFLICT_PATTERNS[oppositeIndex + 1];
        const matchesB = matchAll(text, patternB);
        if (matchesB.length > 0) {
          results.push({
            type: "capacity_conflict",
            severity: "high",
            statement_a: { source: `Document (${labelA})`, text: truncate(matchesA[0]) },
            statement_b: { source: `Document (${labelB})`, text: truncate(matchesB[0]) },
            gap_description: "Contradictory parenting capacity claims in the same document",
            resolution_suggestion:
              "Seek independent assessment of parenting capacity with dated evidence.",
          });
        }
      }
    }
  }

  const absoluteClaims = collectAbsoluteClaims(text);
  if (absoluteClaims.positive.length > 0 && absoluteClaims.negative.length > 0) {
    results.push({
      type: "scope_conflict",
      severity: "medium",
      statement_a: {
        source: "Document (absolute positive)",
        text: truncate(absoluteClaims.positive[0]),
      },
      statement_b: {
        source: "Document (absolute negative)",
        text: truncate(absoluteClaims.negative[0]),
      },
      gap_description: "Conflicting absolute statements found in document",
      resolution_suggestion:
        "Replace absolute language with dated, source-attributed observations.",
    });
  }

  return results;
}

function detectConsistencyGaps(text: string): ConsistencyGap[] {
  const gaps: ConsistencyGap[] = [];

  const dateMatches: string[] = [];
  for (const [pattern] of TEMPORAL_CONFLICT_PATTERNS) {
    const found = matchAll(text, pattern);
    dateMatches.push(...found);
    pattern.lastIndex = 0;
  }

  if (dateMatches.length > 3) {
    gaps.push({
      type: "timeline_density",
      description: `Document contains ${dateMatches.length} temporal references — verify they form a consistent timeline.`,
      severity: "low",
    });
  }

  if (/\b(?:before|after|prior to|subsequent to)\b/gi.test(text)) {
    gaps.push({
      type: "sequence_claim",
      description: "Document uses sequence claims (before/after) that should be verified against dated records.",
      severity: "medium",
    });
  }

  if (/\b(?:I was told|allegedly|reportedly|it is claimed)\b/gi.test(text)) {
    gaps.push({
      type: "hearsay_dependency",
      description: "Document relies on hearsay or secondhand accounts that may conflict with primary sources.",
      severity: "medium",
    });
  }

  if (/\b(?:I (?:don't|do not) recall|I (?:can't|cannot) remember|I am unsure)\b/gi.test(text)) {
    gaps.push({
      type: "memory_gap",
      description: "Witness reports memory gaps that create potential consistency issues.",
      severity: "low",
    });
  }

  return gaps;
}

function detectEvidenceConflicts(text: string): ConsistencyGap[] {
  const conflicts: ConsistencyGap[] = [];

  if (/\b(?:no record|no documentation|not documented|not on file)\b/gi.test(text) &&
    /\b(?:as documented|as recorded|per records|according to records)\b/gi.test(text)) {
    conflicts.push({
      type: "documentation_conflict",
      description: "Document simultaneously claims absence and presence of records.",
      severity: "high",
    });
  }

  if (/\bpolice (?:were not called|were not involved|did not attend)\b/gi.test(text) &&
    /\bpolice (?:were called|attended|responded)\b/gi.test(text)) {
    conflicts.push({
      type: "third_party_conflict",
      description: "Conflicting claims about police involvement.",
      severity: "high",
    });
  }

  if (/\b(?:no referral|was not referred)\b/gi.test(text) &&
    /\b(?:referral|was referred|referred to)\b/gi.test(text)) {
    conflicts.push({
      type: "service_referral_conflict",
      description: "Conflicting statements about service referrals.",
      severity: "medium",
    });
  }

  return conflicts;
}

function buildReviewerPrompts(
  contradictions: Contradiction[],
  gaps: ConsistencyGap[],
): ReviewerPrompt[] {
  const prompts: ReviewerPrompt[] = [];

  if (contradictions.some((c) => c.type === "direct_conflict")) {
    prompts.push({
      question: "Can independent records (e.g. visit logs, third-party reports) resolve the direct conflicts identified?",
      priority: "high",
    });
  }

  if (contradictions.some((c) => c.type === "capacity_conflict")) {
    prompts.push({
      question: "Has an independent parenting capacity assessment been completed with a clear date and scope?",
      priority: "high",
    });
  }

  if (gaps.some((g) => g.type === "timeline_density")) {
    prompts.push({
      question: "Has a chronological case timeline been constructed and cross-referenced with all source documents?",
      priority: "medium",
    });
  }

  if (gaps.some((g) => g.type === "hearsay_dependency")) {
    prompts.push({
      question: "Can secondary accounts be corroborated with primary source documentation?",
      priority: "medium",
    });
  }

  prompts.push({
    question: "Are all conflicting statements attributed to a specific source, date, and author?",
    priority: "high",
  });

  return prompts;
}

function buildCrossDocumentConfidence(text: string): Record<string, number> {
  const confidence: Record<string, number> = {};
  const sourcePatterns: Array<[RegExp, string]> = [
    [/\b(?:affidavit|statutory declaration)\b/gi, "Affidavit"],
    [/\b(?:worker|caseworker|social worker) (?:report|note|record)\b/gi, "Worker report"],
    [/\b(?:school|teacher|educator) (?:report|note)\b/gi, "School report"],
    [/\b(?:medical|doctor|GP|physician) (?:report|certificate|note)\b/gi, "Medical report"],
    [/\b(?:police|law enforcement) (?:report|statement|record)\b/gi, "Police report"],
  ];

  for (const [pattern, label] of sourcePatterns) {
    if (pattern.test(text)) {
      const mentionCount = matchAll(text, pattern).length;
      confidence[label] = Math.min(0.95, 0.5 + mentionCount * 0.1);
    }
    pattern.lastIndex = 0;
  }

  return confidence;
}

function calculateContradictionScore(input: {
  contradictionCount: number;
  gapCount: number;
  conflictCount: number;
  textLength: number;
}): number {
  let score =
    100 -
    input.contradictionCount * 15 -
    input.gapCount * 7 -
    input.conflictCount * 12;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function collectAbsoluteClaims(text: string): { positive: string[]; negative: string[] } {
  const positive: string[] = [];
  const negative: string[] = [];

  for (const [pattern, , ] of ABSOLUTE_CLAIM_PATTERNS) {
    const found = matchAll(text, pattern);
    if (/never|not once/.test(String(pattern))) {
      negative.push(...found);
    } else {
      positive.push(...found);
    }
    pattern.lastIndex = 0;
  }

  return { positive, negative };
}

function matchAll(text: string, pattern: RegExp): string[] {
  const results: string[] = [];
  const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
  const re = new RegExp(pattern.source, flags);
  let match = re.exec(text);
  while (match) {
    results.push(match[0]);
    match = re.exec(text);
  }
  return results;
}

function truncate(text: string, maxLen = 120): string {
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}
