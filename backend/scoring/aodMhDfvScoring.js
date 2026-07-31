export const INSTRUMENT_CODE = "AOD_MH_DFV_v1";
export const INSTRUMENT_SLUG = "aod-mh-dfv-v1";

export const DOMAIN_ITEMS = {
  DFV_SAFETY: ["DFV1", "DFV2", "DFV3", "DFV4"],
  AOD_IMPACT: ["AOD1", "AOD2", "AOD3", "AOD4"],
  MH_FUNCTIONAL: ["MH1", "MH2", "MH3", "MH4"],
  PROTECTIVE_CAPACITY: ["PC1", "PC2", "PC3"],
  PERPETRATOR_ACCOUNTABILITY: ["PA1", "PA2", "PA3"],
  SERVICE_COORDINATION: ["SC1", "SC2"],
  CHILD_IMPACT: ["CI1", "CI2"],
};

export const CRITICAL_OVERRIDES = {
  DFV1_HIGH: { item: "DFV1", threshold: 3, domain: "DFV_SAFETY" },
  DFV3_HIGH: { item: "DFV3", threshold: 3, domain: "DFV_SAFETY" },
  AOD4_HIGH: { item: "AOD4", threshold: 3, domain: "AOD_IMPACT" },
  MH2_HIGH: { item: "MH2", threshold: 3, domain: "MH_FUNCTIONAL" },
  PA3_HIGH: { item: "PA3", threshold: 3, domain: "PERPETRATOR_ACCOUNTABILITY" },
};

export const SCORING_BANDS = [
  ["Low Concern", 0, 25],
  ["Moderate Concern", 26, 50],
  ["High Concern", 51, 75],
  ["Critical Concern", 76, 100],
];

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

export function bandForScore(score) {
  for (const [name, low, high] of SCORING_BANDS) {
    if (score >= low && score <= high) return name;
  }
  return SCORING_BANDS[SCORING_BANDS.length - 1][0];
}

export function scoreDomain(domainCode, itemScores) {
  const items = DOMAIN_ITEMS[domainCode];
  if (!items) {
    throw new Error(`Unknown AOD/MH/DFV domain: ${domainCode}`);
  }

  const values = items
    .map((item) => itemScores[item])
    .filter((value) => value !== undefined && value !== null);
  const rawAvg = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  return {
    domainCode,
    rawAvg,
    normalizedScore: roundScore((rawAvg / 4) * 100),
    itemScores: Object.fromEntries(items.map((item) => [item, itemScores[item] ?? null])),
  };
}

export function evaluateCriticalOverrides(itemScores) {
  const triggered = [];
  for (const [code, config] of Object.entries(CRITICAL_OVERRIDES)) {
    const value = itemScores[config.item];
    if (value !== undefined && value !== null && value >= config.threshold) {
      triggered.push(code);
    }
  }
  return triggered;
}

export function evaluateCrossDomainRules(triggeredOverrides, domainResults, priorDomainScores = null) {
  const flags = [];
  const dfvOverrideActive = triggeredOverrides.some(
    (code) => CRITICAL_OVERRIDES[code]?.domain === "DFV_SAFETY",
  );

  if (dfvOverrideActive && priorDomainScores) {
    const previousAod = priorDomainScores.AOD_IMPACT;
    const currentAod = domainResults.AOD_IMPACT.normalizedScore;
    if (previousAod !== undefined && previousAod !== null && currentAod < previousAod) {
      flags.push({
        ruleCode: "DFV_OVERRIDES_AOD_TREND",
        flagText: "AOD improvement detected but suppressed in composite due to active DFV safety critical override.",
      });
    }
  }

  if (triggeredOverrides.includes("PA3_HIGH")) {
    flags.push({
      ruleCode: "SEPARATE_VICTIM_PERPETRATOR_PLANS",
      flagText:
        "Ongoing perpetrator risk indicator triggered. Verify victim-parent case plan and perpetrator accountability tracking remain scored as separate units.",
    });
  }

  return flags;
}

export function scoreInstrument(itemScores, options = {}) {
  const { priorDomainScores = null, domainWeights = null } = options;
  const domainResults = Object.fromEntries(
    Object.keys(DOMAIN_ITEMS).map((domainCode) => [domainCode, scoreDomain(domainCode, itemScores)]),
  );
  const triggeredOverrides = evaluateCriticalOverrides(itemScores);
  const weights =
    domainWeights ?? Object.fromEntries(Object.keys(DOMAIN_ITEMS).map((domainCode) => [domainCode, 1]));
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);

  if (totalWeight <= 0) {
    throw new Error("AOD/MH/DFV domain weights must have a positive total.");
  }

  const weightedComposite =
    Object.keys(DOMAIN_ITEMS).reduce(
      (sum, domainCode) => sum + domainResults[domainCode].normalizedScore * (weights[domainCode] ?? 0),
      0,
    ) / totalWeight;

  let forcedBand = null;
  let compositeScore = weightedComposite;
  if (triggeredOverrides.length > 0) {
    forcedBand = "Critical Concern";
    compositeScore = Math.max(compositeScore, 76);
  }

  return {
    instrumentCode: INSTRUMENT_CODE,
    instrumentSlug: INSTRUMENT_SLUG,
    domainResults,
    triggeredOverrides,
    forcedBand,
    compositeScore: roundScore(compositeScore),
    band: forcedBand ?? bandForScore(compositeScore),
    crossDomainFlags: evaluateCrossDomainRules(triggeredOverrides, domainResults, priorDomainScores),
  };
}
