import express from "express";
import {
  processAdaptiveMicroPrescriptions,
  processAddictionRecoveryShield,
  processChildThreeHousesPlayroom,
  processClinicianSignOff,
  processCoachTurn,
  processContactVisitCoaching,
  processCouplesDfvSafetyCheck,
  processCourtAnnexureCompilation,
  processCulturalSewbYarningMap,
  processKinshipCarerSupport,
  processLongitudinalEvaluation,
  processMultiInformant360Portal,
  processNeuroSleepProfile,
  processPsychologicalFormulation,
  processRestorativeFamilyMeeting,
  processSafetyPlanVaultSave,
  processScaleScoring,
  processStealthPinVerification,
} from "../../Services/AiSupport/AiSupportCoachService.js";
import { badRequest } from "../../lib/apiError.js";
import {
  AI_COACH_ROLES,
  DOCUMENT_ROLES,
  STAFF_DOCUMENT_ROLES,
  requireAnyRole,
} from "../../middleware/authorize.js";
import { requireAuthenticatedUser } from "../../middleware/requireAuthenticatedUser.js";
import { createRateLimiter } from "../../middleware/userApiRateLimit.js";

const router = express.Router();
const aiSupportRateLimit = createRateLimiter();
router.use(aiSupportRateLimit);

const coachAuth = [aiSupportRateLimit, requireAuthenticatedUser, requireAnyRole(...AI_COACH_ROLES)];
const adultAndStaffAuth = [aiSupportRateLimit, requireAuthenticatedUser, requireAnyRole("carer", ...DOCUMENT_ROLES)];
const clinicianAuth = [aiSupportRateLimit, requireAuthenticatedUser, requireAnyRole(...STAFF_DOCUMENT_ROLES)];

router.post("/coach/turn", ...coachAuth, async (req, res, next) => {
  try {
    const userMessage = typeof req.body?.userMessage === "string" ? req.body.userMessage.trim() : "";
    if (!userMessage) {
      throw badRequest("userMessage is required for /ai-support/coach/turn.");
    }

    const isChildRole = (req.safeStepsAuth?.roles ?? []).includes("child");
    const effectiveBody = isChildRole
      ? {
          ...req.body,
          personaMode: "child_support_coach",
          clinicalPathway: "child_feeling_safe_voice",
        }
      : req.body;

    const result = await processCoachTurn(effectiveBody);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/couples-dfv/safety-check", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    if (req.body?.feltSafetyScore === undefined || req.body?.feltSafetyScore === null) {
      throw badRequest("feltSafetyScore (0-10) is required for /ai-support/couples-dfv/safety-check.");
    }
    const result = processCouplesDfvSafetyCheck(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/scales/score", ...coachAuth, async (req, res, next) => {
  try {
    if (!req.body?.scaleId) {
      throw badRequest("scaleId is required for /ai-support/scales/score.");
    }
    const result = processScaleScoring(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/psychologist/formulate", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processPsychologicalFormulation(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/evaluator/assess", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processLongitudinalEvaluation(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/clinician/sign-off", ...clinicianAuth, async (req, res, next) => {
  try {
    if (!req.body?.targetId) {
      throw badRequest("targetId is required for /ai-support/clinician/sign-off.");
    }
    const reviewerId = req.safeStepsAuth?.userId || "clinician";
    const result = processClinicianSignOff(req.body, reviewerId);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/stealth/verify-pin", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    if (!req.body?.enteredPin || !req.body?.primaryPinHash) {
      throw badRequest("enteredPin and primaryPinHash are required for /ai-support/stealth/verify-pin.");
    }
    const result = processStealthPinVerification(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/safety-plan/save", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const userId = req.safeStepsAuth?.userId || "survivor";
    const result = processSafetyPlanVaultSave(req.body, userId);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/visits/coach", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processContactVisitCoaching(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/family-meeting/repair-script", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processRestorativeFamilyMeeting(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/addiction/urge-surf", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processAddictionRecoveryShield(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/neuro-sleep/profile", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processNeuroSleepProfile(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/kinship-carer/check-in", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processKinshipCarerSupport(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/cultural-sewb/yarning-map", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processCulturalSewbYarningMap(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/court-annexure/compile", ...clinicianAuth, async (req, res, next) => {
  try {
    const result = processCourtAnnexureCompilation(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/informants/submit-360", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processMultiInformant360Portal(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/prescriptions/generate", ...adultAndStaffAuth, async (req, res, next) => {
  try {
    const result = processAdaptiveMicroPrescriptions(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/child/three-houses", ...coachAuth, async (req, res, next) => {
  try {
    const result = processChildThreeHousesPlayroom(req.body);
    res.json({ ok: true, requestId: req.id, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;

