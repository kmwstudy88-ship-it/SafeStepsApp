const DIMENSIONS = Object.freeze([
  "attunement",
  "responsiveness",
  "co_regulation",
  "communication",
  "boundaries",
  "repair",
  "child_agency",
  "shared_enjoyment",
]);

function validRating(value) {
  return Number.isInteger(value) && value >= 0 && value <= 4;
}

function groupByDimension(observations) {
  const grouped = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, []]));
  for (const observation of observations) {
    if (!DIMENSIONS.includes(observation?.dimension) || !validRating(observation?.rating)) continue;
    grouped[observation.dimension].push(observation);
  }
  return grouped;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function trendFor(items) {
  if (items.length < 3) return "insufficient_history";
  const sorted = [...items].sort(
    (left, right) => new Date(left.observedAt).getTime() - new Date(right.observedAt).getTime(),
  );
  const midpoint = Math.floor(sorted.length / 2);
  const early = average(sorted.slice(0, midpoint).map((item) => item.rating));
  const recent = average(sorted.slice(midpoint).map((item) => item.rating));
  const change = recent - early;
  if (change >= 0.5) return "strengthening";
  if (change <= -0.5) return "needs_review";
  return "stable";
}

function confidenceFor(items) {
  if (items.length === 0) return "INSUFFICIENT";
  const sessions = new Set(items.map((item) => item.sessionId).filter(Boolean)).size;
  const contexts = new Set(items.map((item) => item.context).filter(Boolean)).size;
  const observers = new Set(items.map((item) => item.observerId).filter(Boolean)).size;
  if (sessions >= 5 && contexts >= 2 && observers >= 2) return "HIGH";
  if (sessions >= 3 && contexts >= 2) return "MODERATE";
  return "LOW";
}

function dimensionSummary(dimension, items) {
  const mean = average(items.map((item) => item.rating));
  const confidence = confidenceFor(items);
  return {
    dimension,
    observationCount: items.length,
    averageRating: mean === null ? null : Number(mean.toFixed(2)),
    trend: trendFor(items),
    confidence,
    strength: mean !== null && mean >= 3 && confidence !== "LOW",
    supportOpportunity: mean !== null && mean < 2 && confidence !== "LOW",
  };
}

export function validateInteractionObservation(observation) {
  const errors = [];
  if (!DIMENSIONS.includes(observation?.dimension)) errors.push("dimension_invalid");
  if (!validRating(observation?.rating)) errors.push("rating_must_be_0_to_4");
  if (!observation?.sessionId) errors.push("session_required");
  if (!observation?.observedAt || Number.isNaN(new Date(observation.observedAt).getTime())) {
    errors.push("observed_at_required");
  }
  if (!observation?.context) errors.push("context_required");
  if (!observation?.observerRole) errors.push("observer_role_required");
  if (typeof observation?.behaviourAnchor !== "string" || observation.behaviourAnchor.trim().length < 10) {
    errors.push("behaviour_anchor_required");
  }
  return { valid: errors.length === 0, errors };
}

export function analyseParentChildRelationship(input) {
  const observations = Array.isArray(input?.observations)
    ? input.observations.filter((item) => validateInteractionObservation(item).valid)
    : [];
  const grouped = groupByDimension(observations);
  const dimensions = DIMENSIONS.map((dimension) => dimensionSummary(dimension, grouped[dimension]));
  const sessions = new Set(observations.map((item) => item.sessionId)).size;
  const contexts = new Set(observations.map((item) => item.context)).size;
  const childVoiceRecords = Array.isArray(input?.childVoice)
    ? input.childVoice.filter((item) => item && item.sharedForRelationshipReview === true)
    : [];

  const limitations = [];
  if (sessions < 3) limitations.push("minimum_three_sessions_not_met");
  if (contexts < 2) limitations.push("multiple_contexts_not_met");
  if (childVoiceRecords.length === 0) limitations.push("no_child_voice_shared_for_review");
  if (observations.some((item) => item.gameId) && !input?.gameLibraryPurposeConfirmed) {
    limitations.push("game_library_purpose_not_confirmed");
  }

  return {
    sessionsObserved: sessions,
    contextsObserved: contexts,
    validObservationCount: observations.length,
    dimensions,
    strengths: dimensions.filter((item) => item.strength).map((item) => item.dimension),
    supportOpportunities: dimensions
      .filter((item) => item.supportOpportunity)
      .map((item) => item.dimension),
    childVoice: {
      sharedRecordCount: childVoiceRecords.length,
      records: childVoiceRecords,
      privateRecordsExcluded: true,
    },
    limitations,
    readyForProfessionalReview: sessions >= 3 && contexts >= 2,
    professionalReviewRequired: true,
    automatedParentingCapacityConclusionPermitted: false,
    assessmentPurpose:
      "Interaction games support structured observation, relationship building, communication and repair. They are not curriculum.",
    decisionBoundary:
      "Observations describe patterns across contexts and time. They cannot independently determine parenting capacity, contact, removal, abuse, or case outcome.",
  };
}

export function verifyInteractionGameInventory(gameIds, expectedCount = 150) {
  const normalized = [...new Set((gameIds ?? []).map(String))];
  const expected = Array.from({ length: expectedCount }, (_, index) => `game_${index + 1}`);
  const missing = expected.filter((id) => !normalized.includes(id));
  const unexpected = normalized.filter((id) => !expected.includes(id));
  return {
    expectedCount,
    presentCount: normalized.filter((id) => expected.includes(id)).length,
    complete: missing.length === 0 && unexpected.length === 0,
    missing,
    unexpected,
  };
}

export { DIMENSIONS };
