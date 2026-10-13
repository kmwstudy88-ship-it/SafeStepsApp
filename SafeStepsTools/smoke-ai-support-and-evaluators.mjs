import http from "node:http";
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
} from "../backend/Services/AiSupport/AiSupportCoachService.js";
import { sha256Hex } from "../backend/Services/AiSupport/SafetyPolicyEnforcer.js";

const ROUTE_DISPATCH = {
  "/ai-support/coach/turn": (body) => processCoachTurn(body),
  "/ai-support/couples-dfv/safety-check": (body) => processCouplesDfvSafetyCheck(body),
  "/ai-support/scales/score": (body) => processScaleScoring(body),
  "/ai-support/psychologist/formulate": (body) => processPsychologicalFormulation(body),
  "/ai-support/evaluator/assess": (body) => processLongitudinalEvaluation(body),
  "/ai-support/clinician/sign-off": (body) => processClinicianSignOff(body, "smoke-clinician"),
  "/ai-support/stealth/verify-pin": (body) => processStealthPinVerification(body),
  "/ai-support/safety-plan/save": (body) => processSafetyPlanVaultSave(body, "smoke-survivor"),
  "/ai-support/visits/coach": (body) => processContactVisitCoaching(body),
  "/ai-support/family-meeting/repair-script": (body) => processRestorativeFamilyMeeting(body),
  "/ai-support/addiction/urge-surf": (body) => processAddictionRecoveryShield(body),
  "/ai-support/neuro-sleep/profile": (body) => processNeuroSleepProfile(body),
  "/ai-support/kinship-carer/check-in": (body) => processKinshipCarerSupport(body),
  "/ai-support/cultural-sewb/yarning-map": (body) => processCulturalSewbYarningMap(body),
  "/ai-support/court-annexure/compile": (body) => processCourtAnnexureCompilation(body),
  "/ai-support/informants/submit-360": (body) => processMultiInformant360Portal(body),
  "/ai-support/prescriptions/generate": (body) => processAdaptiveMicroPrescriptions(body),
  "/ai-support/child/three-houses": (body) => processChildThreeHousesPlayroom(body),
};

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const handler = Object.prototype.hasOwnProperty.call(ROUTE_DISPATCH, req.url)
    ? ROUTE_DISPATCH[req.url]
    : undefined;
  if (req.method === "POST" && typeof handler === "function") {
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
    }
    const body = raw ? JSON.parse(raw) : {};
    const data = await handler(body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, requestId: "smoke-req", data }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "Not found" }));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

async function postJson(path, payload) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      `Expected POST ${path} to return 200, received ${response.status}: ${await response.text()}`,
    );
  }
  const body = await response.json();
  if (!body?.ok || !body?.data) {
    throw new Error(`Invalid envelope from ${path}: ${JSON.stringify(body)}`);
  }
  return body.data;
}

try {
  // 1. Coach Turn
  const turn = await postJson("/ai-support/coach/turn", {
    personaMode: "parent_support_coach",
    clinicalPathway: "parent_co_regulation_cos",
    interactionForm: "reflective_dialogue",
    userMessage: "At bedtime my child felt scared so I knelt down and softened my voice.",
    preferLocalDeterministic: true,
  });
  if (!turn.assistantMessage || turn.auditSha256?.length !== 64) {
    throw new Error("Coach turn smoke check failed.");
  }

  // 2. Couples DFV Silent Pivot
  const dfvPivot = await postJson("/ai-support/couples-dfv/safety-check", {
    feltSafetyScore: 5,
    fearOfRetaliation: true,
  });
  if (!dfvPivot.silentPivotTriggered || dfvPivot.recommendedMode !== "parallel_safe") {
    throw new Error("Couples DFV silent pivot smoke check failed.");
  }

  // 3. Scale Scoring + RCI
  const scale = await postJson("/ai-support/scales/score", {
    scaleId: "phq_9",
    baselineRaw: 12,
    responses: [{ score: 1 }, { score: 1 }, { score: 1 }],
  });
  if (!scale.rci?.statisticallyReliable) {
    throw new Error("Scale RCI smoke check failed.");
  }

  // 4. 5P Psychologist Formulation
  const formulation = await postJson("/ai-support/psychologist/formulate", {
    caseId: "smoke-case-1",
    confidenceOverride: 0.4,
  });
  if (!formulation.uncertaintyDisclosure) {
    throw new Error("5P Psychologist uncertainty banner smoke check failed.");
  }

  // 5. 10-Engine Longitudinal Evaluator
  const evaluation = await postJson("/ai-support/evaluator/assess", {
    caseId: "smoke-case-1",
    feltSafetyScore: 8,
  });
  if (!evaluation.tenEnginesSummary) {
    throw new Error("10-Engine Evaluator smoke check failed.");
  }

  // 6. Clinician Sign-Off
  const signOff = await postJson("/ai-support/clinician/sign-off", {
    targetId: formulation.id,
    reviewState: "clinician_approved",
  });
  if (signOff.reviewState !== "clinician_approved") {
    throw new Error("Clinician sign-off smoke check failed.");
  }

  // 7. Stealth Duress PIN
  const duress = await postJson("/ai-support/stealth/verify-pin", {
    enteredPin: "9999",
    primaryPinHash: sha256Hex("safesteps-pin-salt-v1:2468"),
    duressPinHash: sha256Hex("safesteps-pin-salt-v1:9999"),
  });
  if (duress.mode !== "duress_sanitized_decoy" || !duress.silentCaseworkerAlertDispatched) {
    throw new Error("Stealth Duress PIN smoke check failed.");
  }

  // 8. Living DFV Safety Plan Vault
  const safetyPlan = await postJson("/ai-support/safety-plan/save", {
    safePlacesToGo: ["Police station"],
    trustedAdultsAndNeighbours: ["Aunty"],
    codeWordWithChildrenOrFriends: "Blue folder",
    essentialDocumentsChecklist: [{ packedOrPhotographedInVault: true }],
  });
  if (safetyPlan.readinessPercentage !== 100) {
    throw new Error("Safety plan vault smoke check failed.");
  }

  // 9. Contact Visit Co-Regulation Coach
  const visitCoach = await postJson("/ai-support/visits/coach", {
    parentArousal0to10: 7,
  });
  if (!visitCoach.requiresFiveMinuteSomaticGroundingFirst) {
    throw new Error("Contact visit coach smoke check failed.");
  }

  // 10. Restorative Family Meeting Studio
  const meeting = await postJson("/ai-support/family-meeting/repair-script", {
    couplesDfvStage: "stage_3_conjoint_safety_gated",
    clinicianSafetyClearance: true,
    survivorFeltSafetyScore0to10: 8,
    ruptureRepairDraft: "I'm sorry if you felt scared, but you pushed my buttons.",
  });
  if (!meeting.excuseOrChildBlameDetected) {
    throw new Error("Restorative family meeting smoke check failed.");
  }

  // 11. Addiction Urge-Surfing Shield
  const addiction = await postJson("/ai-support/addiction/urge-surf", {
    cravingBefore0to10: 8,
    cravingAfter0to10: 3,
  });
  if (!addiction.urgeWaveSurfedSuccessfully) {
    throw new Error("Addiction urge-surfing smoke check failed.");
  }

  // 12. Neurodivergent & Trauma Sleep Profile
  const neuro = await postJson("/ai-support/neuro-sleep/profile", {
    neurodivergentTraits: ["autism_sensory_predictability"],
  });
  if (!Array.isArray(neuro.lowArousalPrinciples)) {
    throw new Error("Neuro/sleep profile smoke check failed.");
  }

  // 13. Kinship Carer ProQOL Check-In
  const carer = await postJson("/ai-support/kinship-carer/check-in", {
    burnout0to50: 38,
  });
  if (carer.placementStabilityBand !== "high_burnout_or_sts_urgent_support_red") {
    throw new Error("Kinship carer ProQOL smoke check failed.");
  }

  // 14. First Nations Cultural SEWB Yarning Map
  const sewb = await postJson("/ai-support/cultural-sewb/yarning-map", {
    culturalWorkerCoSigned: true,
    culturalWorkerName: "Uncle David",
  });
  if (!sewb.culturalWorkerCoSigned) {
    throw new Error("Cultural SEWB yarning map smoke check failed.");
  }

  // 15. Court & SAFER Annexure Compiler Gate
  const blockedCourt = await postJson("/ai-support/court-annexure/compile", {
    clinicianApproved: false,
  });
  if (blockedCourt.eligibleForCourtExport !== false) {
    throw new Error("Court annexure unapproved block smoke check failed.");
  }

  // 16. 360° Multi-Informant Portal
  const informants = await postJson("/ai-support/informants/submit-360", {
    parentSelfReportScore0to100: 85,
    observations: [{ rating0to100: 82 }],
  });
  if (informants.convergenceBand !== "strong_360_convergence") {
    throw new Error("360° multi-informant portal smoke check failed.");
  }

  // 17. Closed-Loop Adaptive Micro-Prescriptions
  const rx = await postJson("/ai-support/prescriptions/generate", {
    participantUserId: "parent-1",
  });
  if (!Array.isArray(rx.prescriptions) || rx.prescriptions.length === 0) {
    throw new Error("Adaptive micro-prescriptions smoke check failed.");
  }

  // 18. Child Three Houses Playroom
  const threeHouses = await postJson("/ai-support/child/three-houses", {
    houseOfGoodThings: ["Playing soccer"],
    houseOfWorries: ["Loud noises"],
    houseOfDreams: ["Calm bedtime"],
    fiveFingerTrustedAdults: ["Grandma", "Teacher", "Aunty"],
  });
  if (!threeHouses.safetyNetworkComplete) {
    throw new Error("Child Three Houses smoke check failed.");
  }

  console.log(
    "SafeSteps AI Support Coach, 5P Psychologist, 10-Engine Evaluator & 12-Module HTTP API smoke passed (18/18 endpoints verified).",
  );
} finally {
  server.close();
}
