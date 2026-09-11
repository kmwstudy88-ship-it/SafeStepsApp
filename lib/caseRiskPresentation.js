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
  return {
    hasError: false,
    errorText: null,
    latest: {
      title: `${latest.tier.toUpperCase()} · Score ${latest.score}`,
      confidenceText: `Confidence: ${Math.round((latest.confidence || 0) * 100)}%`,
      rationaleText: latest.rationale,
      rulesText: `Rules: ${latest.model_version}`,
    },
  };
}

module.exports = {
  buildCaseRiskSummary,
};
