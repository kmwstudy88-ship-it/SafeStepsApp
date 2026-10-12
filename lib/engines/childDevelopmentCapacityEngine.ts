import {
  CapacityConcernDomain,
  CapacityResponseLevel,
  CapacityScenario,
  childDevelopmentCapacityScenarios,
} from "../data/childDevelopmentCapacityAssessment";

export type CapacityAssessmentResponse = {
  scenarioId: string;
  responseLevel: CapacityResponseLevel;
  rawParentQuote: string;
  workerNotes?: string;
};

export type CapacityDomainSummary = {
  domain: CapacityConcernDomain;
  tested: number;
  protective: number;
  conditional: number;
  highRisk: number;
  scorePercentage: number;
};

export type CapacityAssessmentSummary = {
  totalScenarios: number;
  protectiveResponses: number;
  conditionalResponses: number;
  highRiskResponses: number;
  scorePercentage: number;
  requiresSupervisorReview: boolean;
  domainSummaries: CapacityDomainSummary[];
  reportLanguage: string;
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function scenarioById(scenarios: CapacityScenario[]) {
  return new Map(scenarios.map((scenario) => [scenario.id, scenario]));
}

export function scoreCapacityResponse(level: CapacityResponseLevel) {
  if (level === 3) return 100;
  if (level === 2) return 50;
  return 0;
}

export function summarizeCapacityAssessment(
  responses: CapacityAssessmentResponse[],
  scenarios: CapacityScenario[] = childDevelopmentCapacityScenarios,
): CapacityAssessmentSummary {
  const scenarioMap = scenarioById(scenarios);
  const validResponses = responses.filter((response) => scenarioMap.has(response.scenarioId));
  const totalScenarios = validResponses.length;
  const protectiveResponses = validResponses.filter((response) => response.responseLevel === 3).length;
  const conditionalResponses = validResponses.filter((response) => response.responseLevel === 2).length;
  const highRiskResponses = validResponses.filter((response) => response.responseLevel === 1).length;
  const scorePercentage =
    totalScenarios > 0
      ? round(validResponses.reduce((sum, response) => sum + scoreCapacityResponse(response.responseLevel), 0) / totalScenarios)
      : 0;

  const domains = [...new Set(scenarios.map((scenario) => scenario.domain))];
  const domainSummaries = domains
    .map((domain) => {
      const domainScenarioIds = new Set(scenarios.filter((scenario) => scenario.domain === domain).map((scenario) => scenario.id));
      const domainResponses = validResponses.filter((response) => domainScenarioIds.has(response.scenarioId));
      const tested = domainResponses.length;

      return {
        domain,
        tested,
        protective: domainResponses.filter((response) => response.responseLevel === 3).length,
        conditional: domainResponses.filter((response) => response.responseLevel === 2).length,
        highRisk: domainResponses.filter((response) => response.responseLevel === 1).length,
        scorePercentage:
          tested > 0
            ? round(domainResponses.reduce((sum, response) => sum + scoreCapacityResponse(response.responseLevel), 0) / tested)
            : 0,
      };
    })
    .filter((summary) => summary.tested > 0);

  const requiresSupervisorReview = highRiskResponses > 0 || scorePercentage < 70;

  return {
    totalScenarios,
    protectiveResponses,
    conditionalResponses,
    highRiskResponses,
    scorePercentage,
    requiresSupervisorReview,
    domainSummaries,
    reportLanguage: buildCapacityReportLanguage({
      totalScenarios,
      protectiveResponses,
      conditionalResponses,
      highRiskResponses,
      scorePercentage,
      requiresSupervisorReview,
    }),
  };
}

export function buildCapacityReportLanguage(input: {
  totalScenarios: number;
  protectiveResponses: number;
  conditionalResponses: number;
  highRiskResponses: number;
  scorePercentage: number;
  requiresSupervisorReview: boolean;
}) {
  if (input.totalScenarios === 0) {
    return "No scenario responses have been recorded. This tool cannot support a capacity summary until responses are documented.";
  }

  const reviewText = input.requiresSupervisorReview
    ? "Supervisor review is recommended before relying on this assessment for planning decisions."
    : "Responses show currently documented protective capacity across the tested scenarios; continue to compare with live observations and collateral evidence.";

  return [
    `${input.totalScenarios} scenarios were reviewed.`,
    `${input.protectiveResponses} responses demonstrated protective capacity, ${input.conditionalResponses} were conditional or incomplete, and ${input.highRiskResponses} were high-risk.`,
    `The structured score is ${input.scorePercentage}%.`,
    reviewText,
  ].join(" ");
}

export function buildEvidenceBasedCaseNote(input: {
  scenario: CapacityScenario;
  response: CapacityAssessmentResponse;
}) {
  const levelLabel =
    input.response.responseLevel === 3
      ? "Level 3 (Protective Capacity Demonstrated)"
      : input.response.responseLevel === 2
        ? "Level 2 (Textbook or Conditional Response)"
        : "Level 1 (High Risk Response)";

  return `When evaluated against ${input.scenario.id} (${input.scenario.title}), the parent stated: "${input.response.rawParentQuote}". This response was recorded as ${levelLabel}. Worker notes: ${input.response.workerNotes || "No additional notes recorded."}`;
}

export function selectCapacityScenariosForReview(input: {
  domain?: CapacityConcernDomain;
  maxPerDomain?: number;
  scenarios?: CapacityScenario[];
}) {
  const scenarios = input.scenarios ?? childDevelopmentCapacityScenarios;
  const filtered = input.domain ? scenarios.filter((scenario) => scenario.domain === input.domain) : scenarios;
  const maxPerDomain = input.maxPerDomain ?? 3;
  const selected: CapacityScenario[] = [];

  for (const scenario of filtered) {
    const currentDomainCount = selected.filter((candidate) => candidate.domain === scenario.domain).length;
    if (currentDomainCount < maxPerDomain) {
      selected.push(scenario);
    }
  }

  return selected;
}
