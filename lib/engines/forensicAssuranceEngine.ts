/**
 * SafeSteps Forensic & Legal Decision-Assurance Engine
 *
 * Implements evidentiary quality, chain-of-custody, and procedural fairness review:
 *   - Verifies cryptographic hash integrity and source provenance
 *   - Classifies evidential reliability (primary observation vs uncorroborated hearsay)
 *   - Evaluates procedural fairness (right of response and documented disagreements)
 *   - Enforces proportionality checks between risk evidence and proposed restrictions
 *
 * Decision-support only; does not produce court rulings or legal determinations.
 */

export type EvidentialQualityTier = "primary_verified" | "corroborated_record" | "unverified_allegation" | "hearsay";

export type ForensicEvidenceArtifact = {
  artifactId: string;
  title: string;
  sourceType: "worker_direct_observation" | "sworn_affidavit" | "official_agency_log" | "third_party_report" | "anonymous_intake";
  sha256Digest?: string;
  integrityVerified: boolean;
  containsDirectObservation: boolean;
  containsHearsayOrRumor: boolean;
  participantGivenOpportunityToRespond: boolean;
  participantResponseRecorded?: boolean;
  conflatesMaterialHardshipWithNeglect?: boolean;
  ignoresAgencyWaitlistBarrier?: boolean;
  observedAt: string;
};

export type ForensicAssuranceInput = {
  caseId: string;
  artifacts: ForensicEvidenceArtifact[];
  proposedInterventionSeverity: "low_monitoring" | "supervised_contact" | "suspended_contact" | "care_application";
  supervisoryEndorsementPresent: boolean;
};

export type ForensicQualityBreakdown = {
  totalArtifactsCount: number;
  primaryVerifiedCount: number;
  unverifiedOrHearsayCount: number;
  cryptographicallySealedCount: number;
  proceduralFairnessCompliancePercent: number; // 0-100
};

export type ForensicAssuranceResult = {
  caseId: string;
  courtPackReadiness: "ready_for_review" | "procedural_defects_present" | "high_evidentiary_risk";
  evidenceReliabilityScore: number; // 0-100
  breakdown: ForensicQualityBreakdown;
  fairnessDefectFlags: string[];
  proportionalityConcerns: string[];
  mandatorySupervisorCheckpoints: string[];
  decisionSupportOnly: true;
  humanReviewRequired: true;
};

export function evaluateForensicAssurance(
  input: ForensicAssuranceInput,
): ForensicAssuranceResult {
  const fairnessDefectFlags: string[] = [];
  const proportionalityConcerns: string[] = [];
  const supervisorCheckpoints: string[] = [];

  let primaryCount = 0;
  let hearsayCount = 0;
  let sealedCount = 0;
  let respondedCount = 0;

  for (const art of input.artifacts) {
    if (art.integrityVerified && art.sha256Digest) {
      sealedCount += 1;
    }

    if (art.containsDirectObservation && !art.containsHearsayOrRumor) {
      primaryCount += 1;
    }

    if (art.containsHearsayOrRumor || art.sourceType === "anonymous_intake") {
      hearsayCount += 1;
      fairnessDefectFlags.push(
        `Artifact "${art.title}" (${art.artifactId}) contains hearsay or anonymous content; cannot be used as sole basis for restrictive measures.`,
      );
    }

    if (art.participantGivenOpportunityToRespond) {
      respondedCount += 1;
    } else {
      fairnessDefectFlags.push(
        `Procedural fairness defect: Participant was not given opportunity to respond to claims in "${art.title}".`,
      );
    }

    if (art.conflatesMaterialHardshipWithNeglect) {
      fairnessDefectFlags.push(
        `Poverty != Neglect defect: Artifact "${art.title}" (${art.artifactId}) conflates material hardship with child neglect without prior Economic & Concrete Supports (ECS) stabilization.`,
      );
      if (
        input.proposedInterventionSeverity === "suspended_contact" ||
        input.proposedInterventionSeverity === "care_application"
      ) {
        proportionalityConcerns.push(
          `Disproportionate intervention: "${art.title}" relies on unmitigated material hardship/poverty to justify restrictive separation.`,
        );
      }
    }

    if (art.ignoresAgencyWaitlistBarrier) {
      fairnessDefectFlags.push(
        `Systemic barrier defect: Artifact "${art.title}" (${art.artifactId}) alleges service non-compliance while parent was on a documented agency/provider waitlist.`,
      );
      if (
        input.proposedInterventionSeverity === "suspended_contact" ||
        input.proposedInterventionSeverity === "care_application"
      ) {
        proportionalityConcerns.push(
          `Disproportionate intervention: "${art.title}" penalizes parent for agency/provider waitlist delays outside parental control.`,
        );
      }
    }
  }

  const total = Math.max(1, input.artifacts.length);
  const proceduralFairnessCompliancePercent = Math.round((respondedCount / total) * 100);

  // Proportionality check
  if (
    (input.proposedInterventionSeverity === "suspended_contact" || input.proposedInterventionSeverity === "care_application") &&
    primaryCount === 0 &&
    hearsayCount > 0
  ) {
    proportionalityConcerns.push(
      "High-severity restriction proposed based solely on uncorroborated hearsay without verified primary observations.",
    );
  }

  if (!input.supervisoryEndorsementPresent) {
    supervisorCheckpoints.push(
      "Independent supervisory endorsement is mandatory prior to releasing forensic case packet.",
    );
  }

  // Calculate reliability score
  const integrityRatio = sealedCount / total;
  const primaryRatio = primaryCount / total;
  const hearsayPenalty = (hearsayCount / total) * 30;
  const rawReliability = (integrityRatio * 40) + (primaryRatio * 50) + (proceduralFairnessCompliancePercent * 0.1) - hearsayPenalty;
  const evidenceReliabilityScore = Math.max(0, Math.min(100, Math.round(rawReliability)));

  let courtPackReadiness: ForensicAssuranceResult["courtPackReadiness"] = "ready_for_review";
  if (proportionalityConcerns.length > 0 || evidenceReliabilityScore < 40) {
    courtPackReadiness = "high_evidentiary_risk";
  } else if (fairnessDefectFlags.length > 0 || !input.supervisoryEndorsementPresent) {
    courtPackReadiness = "procedural_defects_present";
  }

  return {
    caseId: input.caseId,
    courtPackReadiness,
    evidenceReliabilityScore,
    breakdown: {
      totalArtifactsCount: input.artifacts.length,
      primaryVerifiedCount: primaryCount,
      unverifiedOrHearsayCount: hearsayCount,
      cryptographicallySealedCount: sealedCount,
      proceduralFairnessCompliancePercent,
    },
    fairnessDefectFlags: [...new Set(fairnessDefectFlags)],
    proportionalityConcerns,
    mandatorySupervisorCheckpoints: supervisorCheckpoints,
    decisionSupportOnly: true,
    humanReviewRequired: true,
  };
}
