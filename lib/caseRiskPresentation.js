'use strict';

function buildCaseRiskSummary({ riskHistory = [], riskError = null } = {}) {
  const latest = Array.isArray(riskHistory) ? riskHistory[0] : null;
  if (riskError) {
    return {
      hasError: true,
      errorText: `Risk workflow data unavailable: ${riskError}`,
      latest: null,
    };
  }
  if (!latest) {
    return {
      hasError: false,
      errorText: null,
      latest: null,
      emptyText: 'No risk history available yet.',
    };
  }
  const hardship = latest.material_hardship_assessment;
  const materialHardshipText = hardship?.detected
    ? `Material hardship safeguard: ${hardship.signals?.join(', ') || 'identified'} (${
        hardship.decoupled_from_neglect_score
          ? 'decoupled from neglect score -> routed to Concrete Supports / ECS'
          : 'Concrete Supports / ECS recommended'
      })`
    : undefined;

  return {
    hasError: false,
    errorText: null,
    latest: {
      title: `${String(latest.tier || 'unknown').toUpperCase()} · Score ${latest.score ?? 'n/a'}`,
      cautionText: 'Rule-based decision support only; not a validated prediction or a substitute for human review.',
      rationaleText: latest.rationale || 'No rationale available.',
      rulesText: `Rules: ${latest.model_version || 'unknown'}`,
      ...(materialHardshipText ? { materialHardshipText } : {}),
    },
  };
}

module.exports = {
  buildCaseRiskSummary,
};
