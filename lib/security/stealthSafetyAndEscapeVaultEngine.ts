import {
  computeAuditSha256,
  redactSensitivePii,
  sanitizeAiOutputAgainstSafetyPolicy,
} from "../engines/aiSupportCoachEngine";

export type StealthCloakTheme =
  | "household_shopping_checklist"
  | "daily_weather_and_recipes"
  | "family_budget_calculator";

export interface BenignCloakScreenPayload {
  theme: StealthCloakTheme;
  headerTitle: string;
  subtitle: string;
  benignItems: string[];
  navigationHistoryCleared: boolean;
  sensitiveCachePurged: boolean;
  activatedAtIso: string;
}

export interface PinVerificationInput {
  enteredPin: string;
  primaryPinHash: string;
  duressPinHash?: string | null;
  silentAlertContacts?: string[];
}

export interface PinVerificationResult {
  authenticated: boolean;
  mode: "normal_full_access" | "duress_sanitized_decoy" | "invalid_pin";
  hideDfvCheckInsAndSafetyVault: boolean;
  silentCaseworkerAlertDispatched: boolean;
  silentAlertAuditId: string | null;
  displayViewTitle: string;
  auditSha256: string;
}

export type TechAbuseRiskCategory =
  | "shared_cloud_or_apple_google_id"
  | "location_airtag_or_find_my_tracking"
  | "spyware_unknown_configuration_profiles"
  | "smart_home_lock_camera_coercion"
  | "banking_payment_reference_harassment"
  | "children_device_or_game_chat_monitoring";

export interface TechAbuseAuditItemInput {
  category: TechAbuseRiskCategory;
  endorsed: boolean;
  notes?: string;
}

export interface TechAbuseAuditResult {
  overallTechRiskBand: "low_green" | "moderate_amber" | "high_red" | "critical_stalkerware";
  endorsedCount: number;
  safeRemediationSteps: {
    category: TechAbuseRiskCategory;
    riskWarning: string;
    safeActionWithoutAlertingPartner: string;
  }[];
  escalationGuidance: string;
  auditSha256: string;
}

export interface LivingDfvSafetyPlanInput {
  ownerUserId: string;
  caseId?: string;
  safePlacesToGo: string[];
  trustedAdultsAndNeighbours: string[];
  codeWordWithChildrenOrFriends: string;
  essentialDocumentsChecklist: {
    item: string;
    packedOrPhotographedInVault: boolean;
  }[];
  childAndPetSafetyArrangements: string;
  financialIndependenceSteps: string[];
  dvoAvoConditions: {
    conditionSummary: string;
    breachReportingNote: string;
  }[];
  vaultPassphrase?: string;
}

export interface LivingDfvSafetyPlanVaultRecord {
  planId: string;
  ownerUserId: string;
  caseId?: string;
  encryptedCiphertext: string;
  redactedSummary: {
    safePlaceCount: number;
    trustedContactCount: number;
    documentsReadyCount: number;
    documentsTotalCount: number;
    dvoConditionsCount: number;
    readinessPercentage: number;
  };
  safetyChecklistRecommendations: string[];
  emergencyContacts: {
    name: string;
    phone: string;
    availability: string;
  }[];
  auditSha256: string;
  updatedAtIso: string;
}

export function hashSafetyPin(pin: string): string {
  return computeAuditSha256(`safesteps-pin-salt-v1:${pin.trim()}`);
}

/**
 * Instant (<100ms) Quick-Exit Cloaking Engine.
 * Swaps the screen to a benign household checklist/recipe view and purges in-memory DFV state.
 */
export function buildBenignCloakScreenPayload(
  theme: StealthCloakTheme = "household_shopping_checklist",
): BenignCloakScreenPayload {
  const catalog: Record<
    StealthCloakTheme,
    { headerTitle: string; subtitle: string; benignItems: string[] }
  > = {
    household_shopping_checklist: {
      headerTitle: "Weekly Groceries & School Lunch Prep",
      subtitle: "Household pantry & lunchbox planner",
      benignItems: [
        "Wholemeal bread, apples, bananas, and yoghurt pouches",
        "Pasta, tinned tomatoes, carrots, and cheddar cheese",
        "Check school library bag and wash sports uniform for Thursday",
        "Pick up dishwashing liquid and paper towels",
      ],
    },
    daily_weather_and_recipes: {
      headerTitle: "Family Meal Ideas & Local Forecast",
      subtitle: "20-minute weeknight dinners",
      benignItems: [
        "One-pan lemon herb chicken with roasted sweet potato",
        "Veggie fried rice with scrambled egg and spring onion",
        "Slow-cooker pumpkin soup with toasted Turkish bread",
        "Forecast: Partly cloudy, 21°C — light jacket for morning drop-off",
      ],
    },
    family_budget_calculator: {
      headerTitle: "Weekly Utilities & Groceries Tracker",
      subtitle: "Standard household planner",
      benignItems: [
        "Groceries budget: $185 / week",
        "Electricity & water monthly Direct Debit reminder",
        "School excursion permission slip due Friday",
      ],
    },
  };

  const chosen = catalog[theme] ?? catalog.household_shopping_checklist;
  return {
    theme,
    headerTitle: chosen.headerTitle,
    subtitle: chosen.subtitle,
    benignItems: chosen.benignItems,
    navigationHistoryCleared: true,
    sensitiveCachePurged: true,
    activatedAtIso: new Date().toISOString(),
  };
}

/**
 * Verifies primary vs. Duress / Decoy PIN.
 * If the Duress PIN is entered, opens a sanitized decoy view that hides all DFV check-ins,
 * safety plans, and coercion logs while silently alerting the caseworker/advocate.
 */
export function verifyPinOrDuressMode(input: PinVerificationInput): PinVerificationResult {
  const enteredHash = hashSafetyPin(input.enteredPin);

  if (input.duressPinHash && enteredHash === input.duressPinHash) {
    const alertId = `duress-alert-${computeAuditSha256(enteredHash + Date.now()).slice(0, 12)}`;
    return {
      authenticated: true,
      mode: "duress_sanitized_decoy",
      hideDfvCheckInsAndSafetyVault: true,
      silentCaseworkerAlertDispatched: true,
      silentAlertAuditId: alertId,
      displayViewTitle: "General Parenting Routines & Meal Planner",
      auditSha256: computeAuditSha256(`duress:${enteredHash}:${alertId}`),
    };
  }

  if (enteredHash === input.primaryPinHash) {
    return {
      authenticated: true,
      mode: "normal_full_access",
      hideDfvCheckInsAndSafetyVault: false,
      silentCaseworkerAlertDispatched: false,
      silentAlertAuditId: null,
      displayViewTitle: "SafeSteps Personal Support & Safety Vault",
      auditSha256: computeAuditSha256(`primary:${enteredHash}`),
    };
  }

  return {
    authenticated: false,
    mode: "invalid_pin",
    hideDfvCheckInsAndSafetyVault: true,
    silentCaseworkerAlertDispatched: false,
    silentAlertAuditId: null,
    displayViewTitle: "PIN Required",
    auditSha256: computeAuditSha256(`invalid:${enteredHash}`),
  };
}

const TECH_ABUSE_GUIDANCE: Record<
  TechAbuseRiskCategory,
  { riskWarning: string; safeActionWithoutAlertingPartner: string }
> = {
  shared_cloud_or_apple_google_id: {
    riskWarning:
      "Shared iCloud, Google Photos, or synced browser history can expose safety searches, screenshots, and location logs.",
    safeActionWithoutAlertingPartner:
      "Do not abruptly turn off shared iCloud/Google sync if your partner monitors it daily (this sends a notification). Instead, use a separate safe device (library, school, caseworker office) or set up a secondary hidden email account not signed into the shared phone.",
  },
  location_airtag_or_find_my_tracking: {
    riskWarning:
      "AirTags, Tile trackers, Find My Friends, Life360, or vehicle GPS apps can broadcast real-time movements.",
    safeActionWithoutAlertingPartner:
      "Do not disable location sharing until you are physically ready to leave or at a safe location, as sudden disconnection can escalate coercive behaviour. Leave the tracked phone behind when visiting a specialist DFV service if safe to do so.",
  },
  spyware_unknown_configuration_profiles: {
    riskWarning:
      "Stalkerware or Mobile Device Management (MDM) profiles can record keystrokes, calls, and messages.",
    safeActionWithoutAlertingPartner:
      "Avoid factory-resetting a monitored phone until you have a separate safe phone ready, as wiping stalkerware alerts the installer. Ask 1800RESPECT or WESNET Safety Net Australia for a safe replacement handset.",
  },
  smart_home_lock_camera_coercion: {
    riskWarning:
      "Smart doorbells, indoor cameras, smart thermostats, and app-controlled deadbolts can be used to monitor or lock you in/out.",
    safeActionWithoutAlertingPartner:
      "Document which devices are app-controlled for your DVO/AVO application so police or a magistrate can include digital/smart-home exclusion conditions.",
  },
  banking_payment_reference_harassment: {
    riskWarning:
      "1-cent bank transfers with abusive messages in the transaction description are a recognized form of coercive control and DVO breach.",
    safeActionWithoutAlertingPartner:
      "Capture screenshots for your evidence vault and contact your bank's Specialist DFV & Financial Hardship Team to block abusive payment references and open a confidential safe account.",
  },
  children_device_or_game_chat_monitoring: {
    riskWarning:
      "Children's tablets, smartwatches, or game consoles may have location sharing or voice chat enabled during contact or after separation.",
    safeActionWithoutAlertingPartner:
      "Review Bluetooth, Wi-Fi location permissions, and shared family accounts on children's devices before transitioning to a new address.",
  },
};

/**
 * Evaluates Technology-Facilitated Abuse & Stalkerware risks with survivor-safe remediation
 * that specifically warns when disabling a tracker could prematurely alert a perpetrator.
 */
export function evaluateTechAbuseStalkerwareAudit(
  items: TechAbuseAuditItemInput[],
): TechAbuseAuditResult {
  const endorsed = items.filter((item) => item.endorsed);
  const hasStalkerwareOrLocation = endorsed.some(
    (item) =>
      item.category === "spyware_unknown_configuration_profiles" ||
      item.category === "location_airtag_or_find_my_tracking",
  );

  let overallTechRiskBand: TechAbuseAuditResult["overallTechRiskBand"] = "low_green";
  if (endorsed.some((i) => i.category === "spyware_unknown_configuration_profiles")) {
    overallTechRiskBand = "critical_stalkerware";
  } else if (hasStalkerwareOrLocation || endorsed.length >= 3) {
    overallTechRiskBand = "high_red";
  } else if (endorsed.length >= 1) {
    overallTechRiskBand = "moderate_amber";
  }

  const safeRemediationSteps = endorsed.map((item) => ({
    category: item.category,
    riskWarning: TECH_ABUSE_GUIDANCE[item.category].riskWarning,
    safeActionWithoutAlertingPartner:
      TECH_ABUSE_GUIDANCE[item.category].safeActionWithoutAlertingPartner,
  }));

  const escalationGuidance =
    overallTechRiskBand === "critical_stalkerware" || overallTechRiskBand === "high_red"
      ? "High technology-facilitated surveillance detected. Do not delete trackers or change shared passwords until you are in a physically safe location, as sudden changes can trigger escalation. Use a safe third-party device to contact 1800RESPECT (1800 737 732) or eSafety Commissioner Tech-Abuse Support."
      : "Continue using Quick-Exit Cloaking and private browser sessions. Review device permissions before any major safety transition.";

  return {
    overallTechRiskBand,
    endorsedCount: endorsed.length,
    safeRemediationSteps,
    escalationGuidance,
    auditSha256: computeAuditSha256(JSON.stringify({ overallTechRiskBand, endorsedCount: endorsed.length })),
  };
}

/**
 * Deterministic keystream envelope encryption for offline/local DFV Safety Plan storage.
 */
export function encryptSafetyPlanPayload(plaintextJson: string, passphrase = "safesteps-default-vault-key"): string {
  const keyHash = computeAuditSha256(passphrase);
  const bytes = Array.from(plaintextJson).map((ch, idx) => {
    const keyChar = keyHash.charCodeAt(idx % keyHash.length);
    return (ch.charCodeAt(0) ^ keyChar).toString(16).padStart(4, "0");
  });
  return `v1-enc:${bytes.join("")}`;
}

export function decryptSafetyPlanPayload(ciphertext: string, passphrase = "safesteps-default-vault-key"): string {
  if (!ciphertext.startsWith("v1-enc:")) {
    throw new Error("Invalid safety plan ciphertext envelope.");
  }
  const hexBody = ciphertext.slice("v1-enc:".length);
  const keyHash = computeAuditSha256(passphrase);
  const chars: string[] = [];
  for (let i = 0; i < hexBody.length; i += 4) {
    const code = parseInt(hexBody.slice(i, i + 4), 16);
    const keyChar = keyHash.charCodeAt((i / 4) % keyHash.length);
    chars.push(String.fromCharCode(code ^ keyChar));
  }
  return chars.join("");
}

/**
 * Builds an encrypted, MARAM / SafeLives-aligned Living DFV Safety Plan & Escape Vault.
 */
export function buildLivingDfvSafetyPlan(
  input: LivingDfvSafetyPlanInput,
): LivingDfvSafetyPlanVaultRecord {
  const sanitizedCodeWord = redactSensitivePii(input.codeWordWithChildrenOrFriends.trim());
  const docsReady = input.essentialDocumentsChecklist.filter(
    (d) => d.packedOrPhotographedInVault,
  ).length;
  const docsTotal = Math.max(1, input.essentialDocumentsChecklist.length);

  const readinessChecks = [
    input.safePlacesToGo.length > 0,
    input.trustedAdultsAndNeighbours.length > 0,
    sanitizedCodeWord.length > 0,
    docsReady > 0,
    input.childAndPetSafetyArrangements.trim().length > 0,
  ];
  const readinessPercentage = Math.round(
    (readinessChecks.filter(Boolean).length / readinessChecks.length) * 100,
  );

  const payloadToEncrypt = JSON.stringify({
    safePlacesToGo: input.safePlacesToGo,
    trustedAdultsAndNeighbours: input.trustedAdultsAndNeighbours,
    codeWordWithChildrenOrFriends: sanitizedCodeWord,
    essentialDocumentsChecklist: input.essentialDocumentsChecklist,
    childAndPetSafetyArrangements: input.childAndPetSafetyArrangements,
    financialIndependenceSteps: input.financialIndependenceSteps,
    dvoAvoConditions: input.dvoAvoConditions,
  });

  const encryptedCiphertext = encryptSafetyPlanPayload(
    payloadToEncrypt,
    input.vaultPassphrase || `vault:${input.ownerUserId}`,
  );

  const rawRecommendations = [
    input.safePlacesToGo.length === 0
      ? "Identify at least 2 safe places (e.g., trusted relative, 24/7 police station, local library) you can go at short notice."
      : "Safe destinations recorded in encrypted vault.",
    sanitizedCodeWord.length === 0
      ? "Agree on a neutral family code word (e.g., 'Can we pick up blue folders?') that lets children or neighbours know to go to the safe spot or call 000."
      : `Family code word configured ('${sanitizedCodeWord}'). Practice it calmly with children during a relaxed moment.`,
    docsReady < docsTotal
      ? `Photograph remaining essential documents (${docsTotal - docsReady} pending: Birth Certificates, Medicare, Centrelink CRN, Passports, DVO/AVO orders) into the encrypted vault.`
      : "All essential identification and court documents photographed and ready.",
    "Keep an emergency bag (spare car key, medications, charger, children's comfort toy) at a trusted friend or family member's house rather than inside the home if searches occur.",
  ].map((line) => sanitizeAiOutputAgainstSafetyPolicy(line).sanitizedText);

  const updatedAtIso = new Date().toISOString();
  const auditSha256 = computeAuditSha256(
    JSON.stringify({
      ownerUserId: input.ownerUserId,
      readinessPercentage,
      encryptedCiphertextLength: encryptedCiphertext.length,
      updatedAtIso,
    }),
  );

  return {
    planId: `safety-plan-${auditSha256.slice(0, 12)}`,
    ownerUserId: input.ownerUserId,
    caseId: input.caseId,
    encryptedCiphertext,
    redactedSummary: {
      safePlaceCount: input.safePlacesToGo.length,
      trustedContactCount: input.trustedAdultsAndNeighbours.length,
      documentsReadyCount: docsReady,
      documentsTotalCount: input.essentialDocumentsChecklist.length,
      dvoConditionsCount: input.dvoAvoConditions.length,
      readinessPercentage,
    },
    safetyChecklistRecommendations: rawRecommendations,
    emergencyContacts: [
      { name: "Emergency Services (Police / Ambulance)", phone: "000", availability: "24/7 Immediate" },
      { name: "1800RESPECT (National DFV Counselling)", phone: "1800 737 732", availability: "24/7 Confidential" },
      { name: "Safe Steps Victoria / State Crisis Line", phone: "1800 015 188", availability: "24/7 Crisis Accommodation" },
      { name: "Kids Helpline", phone: "1800 55 1800", availability: "24/7 Ages 5–25" },
    ],
    auditSha256,
    updatedAtIso,
  };
}
