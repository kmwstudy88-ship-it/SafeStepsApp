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

const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  "http://localhost:3000";

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

  try {
    await fetch(`${DEFAULT_API_BASE_URL}/ai-support/couples-dfv/safety-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      },
      body: JSON.stringify(input),
    });
  } catch {
    // Local deterministic result is authoritative and immediate
  }

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
): Promise<ContactVisitCoachingResult> {
  return runContactVisitCoaching(input);
}

export async function submitRestorativeFamilyMeetingPlan(
  input: RestorativeFamilyMeetingInput,
): Promise<RestorativeFamilyMeetingResult> {
  return buildRestorativeFamilyMeetingPlan(input);
}

export async function submitAddictionUrgeSurfShield(
  input: AddictionRecoveryShieldInput,
): Promise<AddictionRecoveryShieldResult> {
  return runAddictionRecoveryShield(input);
}

export async function submitNeuroSleepHouseholdToolkit(
  input: NeuroSleepHouseholdInput,
): Promise<NeuroSleepHouseholdResult> {
  return buildNeuroSleepHouseholdToolkit(input);
}

export async function submitKinshipCarerProQolCheck(
  input: KinshipCarerSupportInput,
): Promise<KinshipCarerSupportResult> {
  return evaluateKinshipCarerSupport(input);
}

export async function submitCulturalSewbYarningMap(
  input: CulturalSewbYarningInput,
): Promise<CulturalSewbYarningResult> {
  return buildFirstNationsSewbYarningMap(input);
}

export async function generateCourtSaferAiAnnexure(
  input: CourtSaferAiAnnexureInput,
): Promise<CourtSaferAiAnnexureResult> {
  return compileCourtSaferAiAnnexure(input);
}

export async function submit360MultiInformantPortal(
  input: MultiInformant360PortalInput,
): Promise<MultiInformant360PortalResult> {
  return evaluate360MultiInformantPortal(input);
}

export async function generateAdaptiveMicroPrescriptions(
  input: AdaptiveMicroPrescriptionInput,
): Promise<AdaptiveMicroPrescriptionResult> {
  return prescribeAdaptiveMicroLessonsAndReTests(input);
}

export async function submitChildThreeHousesPlayroom(
  input: ChildThreeHousesInput,
): Promise<ChildThreeHousesResult> {
  return evaluateChildThreeHousesAndSafetyHand(input);
}

export { hashSafetyPin };

