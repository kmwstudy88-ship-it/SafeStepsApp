import {
  scoreClinicalScale,
  type ClinicalScaleAdministrationForm,
  type ClinicalScaleResponseInput,
  type ClinicalScaleScoreOutput,
} from "./data/clinicalAndParentingScales";
import {
  runTenEngineLongitudinalEvaluation,
  type LongitudinalEvaluationInput,
  type TenEngineLongitudinalEvaluationReport,
} from "./engines/aiLongitudinalEvaluatorEngine";
import {
  buildFivePPsychologicalFormulation,
  type BuildFivePFormulationInput,
  type FivePPsychologicalFormulation,
} from "./engines/aiPsychologistFormulationEngine";
import {
  computeAuditSha256,
  evaluateCouplesDfvSafetyGate,
  runSupportCoachTurn,
  type CouplesDfvSafetyCheckInput,
  type CouplesDfvSafetyCheckResult,
  type SupportCoachTurnInput,
  type SupportCoachTurnOutput,
} from "./engines/aiSupportCoachEngine";
import {
  clearAllQueuedAiSupportItems,
  getPendingAiSupportQueue,
  queueAiSupportSubmission,
  syncPendingAiSupportQueue,
  verifyAiSupportQueueChain,
} from "./engines/aiSupportOfflineSyncQueue";

const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  "http://localhost:3000";

async function postWithOfflineQueueFallback(
  endpoint: string,
  payload: Record<string, unknown>,
  accessToken?: string,
): Promise<void> {
  try {
    const response = await fetch(
      `${DEFAULT_API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      await queueAiSupportSubmission(endpoint, payload);
    }
  } catch {
    await queueAiSupportSubmission(endpoint, payload);
  }
}

export async function submitAiCoachTurn(
  input: SupportCoachTurnInput,
  options?: { preferLocalDeterministic?: boolean; accessToken?: string },
): Promise<SupportCoachTurnOutput> {
  // Always run local deterministic pre-check first for instant Tier-1 crisis protection
  const localResult = runSupportCoachTurn(input);
  if (!localResult.safetyEvaluation.safeToProceed || options?.preferLocalDeterministic) {
    return localResult;
  }

  try {
    const response = await fetch(`${DEFAULT_API_BASE_URL}/ai-support/coach/turn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      const payload = (await response.json()) as {
        ok?: boolean;
        data?: Partial<SupportCoachTurnOutput>;
      };
      if (payload?.data?.assistantMessage) {
        return {
          ...localResult,
          assistantMessage: payload.data.assistantMessage,
          providerTierUsed: payload.data.providerTierUsed ?? localResult.providerTierUsed,
          auditSha256: payload.data.auditSha256 ?? localResult.auditSha256,
        };
      }
    }
  } catch {
    // Offline or local-only mode: return 100% deterministic local clinical engine output
  }

  return localResult;
}

export async function submitCouplesDfvSafetyCheck(
  input: CouplesDfvSafetyCheckInput,
  options?: { accessToken?: string },
): Promise<CouplesDfvSafetyCheckResult> {
  const localResult = evaluateCouplesDfvSafetyGate(input);
  await postWithOfflineQueueFallback(
    "/ai-support/couples-dfv/safety-check",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function submitClinicalScaleScreening(
  scaleId: string,
  responses: ClinicalScaleResponseInput[],
  administrationForm: ClinicalScaleAdministrationForm = "standard_scale",
): Promise<ClinicalScaleScoreOutput> {
  return scoreClinicalScale(scaleId, responses, administrationForm);
}

export async function generatePsychologistFormulation(
  input: BuildFivePFormulationInput,
): Promise<FivePPsychologicalFormulation> {
  return buildFivePPsychologicalFormulation(input);
}

export async function generateLongitudinalEvaluation(
  input: LongitudinalEvaluationInput,
): Promise<TenEngineLongitudinalEvaluationReport> {
  return runTenEngineLongitudinalEvaluation(input);
}

import {
  buildRestorativeFamilyMeetingPlan,
  runContactVisitCoaching,
  type ContactVisitCoachingInput,
  type ContactVisitCoachingResult,
  type RestorativeFamilyMeetingInput,
  type RestorativeFamilyMeetingResult,
} from "./engines/contactVisitAndRestorativeMeetingEngine";
import {
  compileCourtSaferAiAnnexure,
  evaluate360MultiInformantPortal,
  evaluateChildThreeHousesAndSafetyHand,
  prescribeAdaptiveMicroLessonsAndReTests,
  type AdaptiveMicroPrescriptionInput,
  type AdaptiveMicroPrescriptionResult,
  type ChildThreeHousesInput,
  type ChildThreeHousesResult,
  type CourtSaferAiAnnexureInput,
  type CourtSaferAiAnnexureResult,
  type MultiInformant360PortalInput,
  type MultiInformant360PortalResult,
} from "./engines/forensicConvergenceAndChildPlayroomEngine";
import {
  buildFirstNationsSewbYarningMap,
  buildNeuroSleepHouseholdToolkit,
  evaluateKinshipCarerSupport,
  runAddictionRecoveryShield,
  type AddictionRecoveryShieldInput,
  type AddictionRecoveryShieldResult,
  type CulturalSewbYarningInput,
  type CulturalSewbYarningResult,
  type KinshipCarerSupportInput,
  type KinshipCarerSupportResult,
  type NeuroSleepHouseholdInput,
  type NeuroSleepHouseholdResult,
} from "./engines/specializedClinicalPopulationsEngine";
import {
  buildBenignCloakScreenPayload,
  buildLivingDfvSafetyPlan,
  evaluateTechAbuseStalkerwareAudit,
  hashSafetyPin,
  verifyPinOrDuressMode,
  type BenignCloakScreenPayload,
  type LivingDfvSafetyPlanInput,
  type LivingDfvSafetyPlanVaultRecord,
  type PinVerificationInput,
  type PinVerificationResult,
  type StealthCloakTheme,
  type TechAbuseAuditItemInput,
  type TechAbuseAuditResult,
} from "./security/stealthSafetyAndEscapeVaultEngine";

export async function submitClinicianSignOffDecision(params: {
  targetId: string;
  targetType: "formulation" | "evaluation" | "conjoint_clearance";
  reviewState: "clinician_approved" | "clinician_amended" | "contested";
  clinicianNotes: string;
  reviewerName?: string;
}) {
  const reviewedAt = new Date().toISOString();
  const auditSha256 = computeAuditSha256(
    `${params.targetId}:${params.reviewState}:${params.clinicianNotes}:${reviewedAt}`,
  );
  return {
    ...params,
    reviewedAt,
    auditSha256,
  };
}

export function triggerInstantStealthCloak(
  theme: StealthCloakTheme = "household_shopping_checklist",
): BenignCloakScreenPayload {
  return buildBenignCloakScreenPayload(theme);
}

export async function verifyStealthOrDuressPin(
  input: PinVerificationInput,
): Promise<PinVerificationResult> {
  return verifyPinOrDuressMode(input);
}

export async function runTechAbuseSafetyAudit(
  items: TechAbuseAuditItemInput[],
): Promise<TechAbuseAuditResult> {
  return evaluateTechAbuseStalkerwareAudit(items);
}

export async function saveEncryptedDfvSafetyPlan(
  input: LivingDfvSafetyPlanInput,
): Promise<LivingDfvSafetyPlanVaultRecord> {
  return buildLivingDfvSafetyPlan(input);
}

export async function submitContactVisitCoachSession(
  input: ContactVisitCoachingInput,
  options?: { accessToken?: string },
): Promise<ContactVisitCoachingResult> {
  const localResult = runContactVisitCoaching(input);
  await postWithOfflineQueueFallback(
    "/ai-support/visits/coach",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function submitRestorativeFamilyMeetingPlan(
  input: RestorativeFamilyMeetingInput,
  options?: { accessToken?: string },
): Promise<RestorativeFamilyMeetingResult> {
  const localResult = buildRestorativeFamilyMeetingPlan(input);
  await postWithOfflineQueueFallback(
    "/ai-support/family-meeting/repair-script",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function submitAddictionUrgeSurfShield(
  input: AddictionRecoveryShieldInput,
  options?: { accessToken?: string },
): Promise<AddictionRecoveryShieldResult> {
  const localResult = runAddictionRecoveryShield(input);
  await postWithOfflineQueueFallback(
    "/ai-support/addiction/urge-surf",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function submitNeuroSleepHouseholdToolkit(
  input: NeuroSleepHouseholdInput,
  options?: { accessToken?: string },
): Promise<NeuroSleepHouseholdResult> {
  const localResult = buildNeuroSleepHouseholdToolkit(input);
  await postWithOfflineQueueFallback(
    "/ai-support/neuro-sleep/profile",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function submitKinshipCarerProQolCheck(
  input: KinshipCarerSupportInput,
  options?: { accessToken?: string },
): Promise<KinshipCarerSupportResult> {
  const localResult = evaluateKinshipCarerSupport(input);
  await postWithOfflineQueueFallback(
    "/ai-support/kinship-carer/check-in",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function submitCulturalSewbYarningMap(
  input: CulturalSewbYarningInput,
  options?: { accessToken?: string },
): Promise<CulturalSewbYarningResult> {
  const localResult = buildFirstNationsSewbYarningMap(input);
  await postWithOfflineQueueFallback(
    "/ai-support/cultural-sewb/yarning-map",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function generateCourtSaferAiAnnexure(
  input: CourtSaferAiAnnexureInput,
  options?: { accessToken?: string },
): Promise<CourtSaferAiAnnexureResult> {
  const localResult = compileCourtSaferAiAnnexure(input);
  await postWithOfflineQueueFallback(
    "/ai-support/court-annexure/compile",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function submit360MultiInformantPortal(
  input: MultiInformant360PortalInput,
  options?: { accessToken?: string },
): Promise<MultiInformant360PortalResult> {
  const localResult = evaluate360MultiInformantPortal(input);
  await postWithOfflineQueueFallback(
    "/ai-support/informants/submit-360",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function generateAdaptiveMicroPrescriptions(
  input: AdaptiveMicroPrescriptionInput,
  options?: { accessToken?: string },
): Promise<AdaptiveMicroPrescriptionResult> {
  const localResult = prescribeAdaptiveMicroLessonsAndReTests(input);
  await postWithOfflineQueueFallback(
    "/ai-support/prescriptions/generate",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export async function submitChildThreeHousesPlayroom(
  input: ChildThreeHousesInput,
  options?: { accessToken?: string },
): Promise<ChildThreeHousesResult> {
  const localResult = evaluateChildThreeHousesAndSafetyHand(input);
  await postWithOfflineQueueFallback(
    "/ai-support/child/three-houses",
    input as unknown as Record<string, unknown>,
    options?.accessToken,
  );
  return localResult;
}

export {
  clearAllQueuedAiSupportItems,
  getPendingAiSupportQueue,
  hashSafetyPin,
  queueAiSupportSubmission,
  syncPendingAiSupportQueue,
  verifyAiSupportQueueChain,
};

