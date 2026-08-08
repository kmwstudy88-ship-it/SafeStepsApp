const LIMITATIONS =
  "This tool supports human review. Final determinations remain with decision-makers.";

const NEGATION_PAIRS = [
  [/\bwas (?:not |not )?home\b/gi, /\bwas not home\b/gi, "Conflicting accounts of presence at home"],
  [/\bdid (?:not )?attend\b/gi, /\bdid not attend\b/gi, "Conflicting attendance claim"],
  [/\b(?:no|without) (?:history of )?(?:violence|abuse|neglect)\b/gi, /\bhistory of (?:violence|abuse|neglect)\b/gi, "Conflicting safety history"],
  [/\bsober\b/gi, /\bintoxicated\b/gi, "Conflicting account of sobriety"],
  [/\bdoes not use (?:drugs|alcohol|substances)\b/gi, /\b(?:drug|alcohol|substance) use\b/gi, "Conflicting substance use claim"],
];

const CAPACITY_CONFLICT_PAIRS = [
  [/\bunable to (?:care|parent|supervise)\b/gi, /\bcapable? (?:of )?(?:caring|parenting|providing)\b/gi, "capacity_conflict"],
  [/\bnever harmed (?:the )?child\b/gi, /\bchild was harmed\b/gi, "safety_conflict"],
];

export function normalizeContradictionText(text) {
  if (typeof text !== "string") throw new Error("Contradiction analysis requires text.");
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) throw new Error("Contradiction analysis requires non-empty text.");
  return normalized;
}

export function analyzeContradictions(text, _caseContext = null) {
  const source = normalizeContradictionText(text);

  const contradictions = detectNegationContradictions(source);
  const consistency_gaps = detectConsistencyGaps(source);
  const evidence_conflicts = detectEvidenceConflicts(source);
  const reviewer_prompts = buildReviewerPrompts(contradictions, consistency_gaps);
  const cross_document_confidence = buildCrossDocumentConfidence(source);

  const contradiction_score = calculateContradictionScore({
    contradictionCount: contradictions.length,
    gapCount: consistency_gaps.length,
    conflictCount: evidence_conflicts.length,
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

function detectNegationContradictions(text) {
  const results = [];

  for (const [_patternA, negatedPattern, description] of NEGATION_PAIRS) {
    const allMatches = matchAll(text, _patternA);
    const negMatches = matchAll(text, negatedPattern);
    const positiveMatches = allMatches.filter((m) => !negatedPattern.test(m));
    negatedPattern.lastIndex = 0;

    if (positiveMatches.length > 0 && negMatches.length > 0) {
      results.push({
        type: "direct_conflict",
        severity: "high",
        statement_a: { source: "Document (positive claim)", text: truncate(positiveMatches[0]) },
        statement_b: { source: "Document (negating claim)", text: truncate(negMatches[0]) },
        gap_description: description,
        resolution_suggestion: "Obtain corroborating documentation from an independent source and reconcile the timeline.",
      });
    }
  }

  for (const [patternA, patternB, type] of CAPACITY_CONFLICT_PAIRS) {
    const matchesA = matchAll(text, patternA);
    const matchesB = matchAll(text, patternB);
    if (matchesA.length > 0 && matchesB.length > 0) {
      results.push({
        type,
        severity: "high",
        statement_a: { source: "Document (claim A)", text: truncate(matchesA[0]) },
        statement_b: { source: "Document (claim B)", text: truncate(matchesB[0]) },
        gap_description: "Contradictory claims in the same document",
        resolution_suggestion: "Seek independent assessment with dated evidence.",
      });
    }
  }

  const absolutePositive = matchAll(text, /\balways (?:was|is|has been)\b/gi);
  const absoluteNegative = matchAll(text, /\bnever (?:was|is|has been|happened)\b/gi);
  if (absolutePositive.length > 0 && absoluteNegative.length > 0) {
    results.push({
      type: "scope_conflict",
      severity: "medium",
      statement_a: { source: "Document (absolute positive)", text: truncate(absolutePositive[0]) },
      statement_b: { source: "Document (absolute negative)", text: truncate(absoluteNegative[0]) },
      gap_description: "Conflicting absolute statements",
      resolution_suggestion: "Replace absolute language with dated, source-attributed observations.",
    });
  }

  return results;
}

function detectConsistencyGaps(text) {
  const gaps = [];
  const dateCount = matchAll(text, /\b20\d{2}-\d{2}-\d{2}\b/g).length +
    matchAll(text, /\b\d{1,2}\/\d{1,2}\/20\d{2}\b/g).length +
    matchAll(text, /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi).length;

  if (dateCount > 3) {
    gaps.push({ type: "timeline_density", description: `Document contains ${dateCount} temporal references — verify they form a consistent timeline.`, severity: "low" });
  }
  if (/\b(?:before|after|prior to|subsequent to)\b/gi.test(text)) {
    gaps.push({ type: "sequence_claim", description: "Document uses sequence claims (before/after) that should be verified against dated records.", severity: "medium" });
  }
  if (/\b(?:I was told|allegedly|reportedly|it is claimed)\b/gi.test(text)) {
    gaps.push({ type: "hearsay_dependency", description: "Document relies on hearsay or secondhand accounts that may conflict with primary sources.", severity: "medium" });
  }
  if (/\b(?:I (?:don't|do not) recall|I (?:can't|cannot) remember|I am unsure)\b/gi.test(text)) {
    gaps.push({ type: "memory_gap", description: "Witness reports memory gaps that create potential consistency issues.", severity: "low" });
  }
  return gaps;
}

function detectEvidenceConflicts(text) {
  const conflicts = [];
  if (/\b(?:no record|not documented|not on file)\b/gi.test(text) &&
    /\b(?:as documented|as recorded|per records)\b/gi.test(text)) {
    conflicts.push({ type: "documentation_conflict", description: "Document simultaneously claims absence and presence of records.", severity: "high" });
  }
  if (/\bpolice (?:were not called|were not involved|did not attend)\b/gi.test(text) &&
    /\bpolice (?:were called|attended|responded)\b/gi.test(text)) {
    conflicts.push({ type: "third_party_conflict", description: "Conflicting claims about police involvement.", severity: "high" });
  }
  if (/\b(?:no referral|was not referred)\b/gi.test(text) &&
    /\b(?:referral|was referred|referred to)\b/gi.test(text)) {
    conflicts.push({ type: "service_referral_conflict", description: "Conflicting statements about service referrals.", severity: "medium" });
  }
  return conflicts;
}

function buildReviewerPrompts(contradictions, gaps) {
  const prompts = [];
  if (contradictions.some((c) => c.type === "direct_conflict")) {
    prompts.push({ question: "Can independent records resolve the direct conflicts identified?", priority: "high" });
  }
  if (contradictions.some((c) => c.type === "capacity_conflict")) {
    prompts.push({ question: "Has an independent parenting capacity assessment been completed with a clear date and scope?", priority: "high" });
  }
  if (gaps.some((g) => g.type === "timeline_density")) {
    prompts.push({ question: "Has a chronological case timeline been constructed and cross-referenced with all source documents?", priority: "medium" });
  }
  if (gaps.some((g) => g.type === "hearsay_dependency")) {
    prompts.push({ question: "Can secondary accounts be corroborated with primary source documentation?", priority: "medium" });
  }
  prompts.push({ question: "Are all conflicting statements attributed to a specific source, date, and author?", priority: "high" });
  return prompts;
}

function buildCrossDocumentConfidence(text) {
  const confidence = {};
  const sources = [
    [/\b(?:affidavit|statutory declaration)\b/gi, "Affidavit"],
    [/\b(?:worker|caseworker) (?:report|note)\b/gi, "Worker report"],
    [/\b(?:school|teacher) (?:report|note)\b/gi, "School report"],
    [/\b(?:medical|doctor|GP) (?:report|certificate)\b/gi, "Medical report"],
    [/\bpolice (?:report|statement)\b/gi, "Police report"],
  ];
  for (const [pattern, label] of sources) {
    const count = matchAll(text, pattern).length;
    if (count > 0) confidence[label] = Math.min(0.95, 0.5 + count * 0.1);
    pattern.lastIndex = 0;
  }
  return confidence;
}

function calculateContradictionScore({ contradictionCount, gapCount, conflictCount }) {
  const score = 100 - contradictionCount * 15 - gapCount * 7 - conflictCount * 12;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function matchAll(text, pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
  const re = new RegExp(pattern.source, flags);
  const results = [];
  let match = re.exec(text);
  while (match) {
    results.push(match[0]);
    match = re.exec(text);
  }
  return results;
}

function truncate(text, maxLen = 120) {
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}
