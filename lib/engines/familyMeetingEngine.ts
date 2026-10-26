/**
 * SafeSteps Family Meeting Consensus & De-escalation Engine
 *
 * Implements explicit meeting session workflows:
 *   - Nomination collection and moderation
 *   - Negotiation and consensus resolution
 *   - Circuit-breaker protocols and neutral fallbacks
 *   - Reflection analysis and participation streak progression
 *
 * Decision-support only; never substitutes for qualified family dispute mediation.
 */

export type ConsensusType = "Unanimous" | "Majority" | "Compromise" | "Deferred";

export type FamilyMeetingMemberVote = {
  memberId: string;
  role: "Child" | "Parent" | "Carer" | "Support";
  preferredActivityId: string;
  ranking?: string[];
  comments?: string;
};

export type FamilyMeetingSessionInput = {
  familyId: string;
  sessionWeek: number;
  nominations: {
    activityId: string;
    title: string;
    nominatedByRole: "Child" | "Parent" | "Family";
    category: "outdoor" | "craft" | "cooking" | "storytelling" | "game" | "calm_reflection";
  }[];
  votes: FamilyMeetingMemberVote[];
  consensusTimerSeconds: number;
  timerExpired: boolean;
  deadlockReported: boolean;
  conflictFlagRaised: boolean;
  reflectionRatings?: {
    overallFun: number; // 1-5
    communicationHarmony: number; // 1-5
  };
  previousStreak: number;
};

export type CircuitBreakerStatus = {
  triggered: boolean;
  reason: "None" | "TimerExpired" | "Deadlock" | "ConflictReported";
  recommendedFallbackActivity: string;
  deEscalationPrompts: string[];
};

export type FamilyMeetingSessionResult = {
  familyId: string;
  sessionWeek: number;
  consensusType: ConsensusType;
  selectedActivityId: string | null;
  selectedActivityTitle: string | null;
  circuitBreaker: CircuitBreakerStatus;
  updatedStreak: number;
  harmonyLevel: "high" | "moderate" | "strained" | "unrated";
  clinicianTelemetryAlerts: string[];
  decisionSupportOnly: true;
  humanReviewRequired: true;
};

const SAFE_DEFAULT_FALLBACKS = [
  "Mindful Nature Walk & Scavenger Hunt",
  "Quiet Drawing & Shared Listening Music",
  "Calm Cooperative Card Game",
  "Family Story Time & Hot Chocolate",
];

const DE_ESCALATION_PROMPTS = [
  "Take a 10-minute pause: step outside, drink water, take 5 slow breaths.",
  "Remember our family rule: everyone's voice is respected and no one gets blamed.",
  "Switch to the agreed neutral fallback activity so everyone can relax.",
  "You can always pass on an activity and choose quiet quiet time instead.",
];

export function evaluateFamilyMeetingSession(
  input: FamilyMeetingSessionInput,
): FamilyMeetingSessionResult {
  const clinicianAlerts: string[] = [];

  // 1. Evaluate Circuit Breaker conditions
  let circuitBreakerTriggered = false;
  let circuitBreakerReason: CircuitBreakerStatus["reason"] = "None";

  if (input.conflictFlagRaised) {
    circuitBreakerTriggered = true;
    circuitBreakerReason = "ConflictReported";
    clinicianAlerts.push("Active conflict or tension flagged during family meeting negotiation.");
  } else if (input.timerExpired) {
    circuitBreakerTriggered = true;
    circuitBreakerReason = "TimerExpired";
    clinicianAlerts.push("Meeting consensus timer elapsed before agreement was reached.");
  } else if (input.deadlockReported) {
    circuitBreakerTriggered = true;
    circuitBreakerReason = "Deadlock";
    clinicianAlerts.push("Voting deadlock reported; consensus could not be formed naturally.");
  }

  const fallbackIndex = (input.sessionWeek - 1) % SAFE_DEFAULT_FALLBACKS.length;
  const circuitBreaker: CircuitBreakerStatus = {
    triggered: circuitBreakerTriggered,
    reason: circuitBreakerReason,
    recommendedFallbackActivity: SAFE_DEFAULT_FALLBACKS[fallbackIndex],
    deEscalationPrompts: DE_ESCALATION_PROMPTS,
  };

  // 2. Evaluate Consensus if not broken by circuit breaker
  let consensusType: ConsensusType = "Deferred";
  let selectedActivityId: string | null = null;
  let selectedActivityTitle: string | null = null;

  if (circuitBreakerTriggered) {
    consensusType = "Deferred";
    selectedActivityId = "safe_fallback";
    selectedActivityTitle = circuitBreaker.recommendedFallbackActivity;
  } else if (input.votes.length === 0) {
    consensusType = "Deferred";
  } else {
    // Count votes per activity
    const voteCounts = new Map<string, number>();
    for (const v of input.votes) {
      voteCounts.set(v.preferredActivityId, (voteCounts.get(v.preferredActivityId) || 0) + 1);
    }

    const totalVotes = input.votes.length;
    let highestCount = 0;
    let winningActivityId: string | null = null;

    for (const [actId, count] of voteCounts.entries()) {
      if (count > highestCount) {
        highestCount = count;
        winningActivityId = actId;
      }
    }

    if (highestCount === totalVotes && totalVotes > 1) {
      consensusType = "Unanimous";
      selectedActivityId = winningActivityId;
    } else if (highestCount > totalVotes / 2) {
      consensusType = "Majority";
      selectedActivityId = winningActivityId;
    } else if (highestCount > 0) {
      consensusType = "Compromise";
      selectedActivityId = winningActivityId;
    }

    const matchedNomination = input.nominations.find((n) => n.activityId === selectedActivityId);
    selectedActivityTitle = matchedNomination ? matchedNomination.title : selectedActivityId;
  }

  // 3. Evaluate harmony and streak progression
  let harmonyLevel: FamilyMeetingSessionResult["harmonyLevel"] = "unrated";
  if (input.reflectionRatings) {
    const avg = (input.reflectionRatings.overallFun + input.reflectionRatings.communicationHarmony) / 2;
    if (avg >= 4) harmonyLevel = "high";
    else if (avg >= 2.5) harmonyLevel = "moderate";
    else {
      harmonyLevel = "strained";
      clinicianAlerts.push("Post-activity reflection scored below 2.5/5 on harmony; check in with family.");
    }
  }

  const updatedStreak = circuitBreakerTriggered
    ? input.previousStreak // Preserve streak without resetting to avoid punitive gamification
    : input.votes.length > 0 ? input.previousStreak + 1 : input.previousStreak;

  return {
    familyId: input.familyId,
    sessionWeek: input.sessionWeek,
    consensusType,
    selectedActivityId,
    selectedActivityTitle,
    circuitBreaker,
    updatedStreak,
    harmonyLevel,
    clinicianTelemetryAlerts: clinicianAlerts,
    decisionSupportOnly: true,
    humanReviewRequired: true,
  };
}
