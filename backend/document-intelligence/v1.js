'use strict';

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function clampScore(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, number));
}

function mapAuditEvidence(evidence) {
  return asArray(evidence).map((item) => {
    const source = asObject(item);
    return {
      claim: asString(source.claim),
      evidence: asString(source.evidence),
      evidence_type: asString(source.evidence_type, 'unknown'),
      confidence: clampScore(source.confidence, 0),
      source_locator: asString(source.source_locator),
    };
  });
}

function deriveBiasIndicators(analysis, rawOutput) {
  const explicit = asArray(asObject(rawOutput).analysis?.bias_indicators);
  if (explicit.length) return explicit;

  const biasSignals = asArray(asObject(analysis.bias).signals).map((item) => {
    const signal = asObject(item);
    return {
      category: asString(signal.category),
      language: asString(signal.language),
      explanation: asString(signal.explanation),
      severity: asString(signal.severity),
    };
  });
  const fairnessConcerns = asArray(asObject(analysis.fairness).framing_concerns).map((item) => {
    const concern = asObject(item);
    return {
      category: asString(concern.category, 'framing'),
      language: asString(concern.language),
      explanation: asString(concern.explanation),
      severity: asString(concern.severity),
    };
  });
  return [...biasSignals, ...fairnessConcerns];
}

function deriveProtectiveFactors(analysis, rawOutput) {
  const explicit = asArray(asObject(rawOutput).analysis?.protective_factors);
  if (explicit.length) return explicit;
  return asArray(asObject(analysis.risk).protective_factors).map((item) => {
    if (typeof item === 'string') return { strength: item };
    return item;
  });
}

function deriveRiskEntries(analysis, rawOutput) {
  const explicit = asArray(asObject(rawOutput).analysis?.risks);
  if (explicit.length) return explicit;
  const risk = asObject(analysis.risk);
  if (!Object.keys(risk).length) return [];
  return [{
    engine: 'DocumentRiskEngine',
    risk_score: clampScore(risk.score, 0),
    severity_level: asString(risk.level, 'insufficient_evidence'),
    evidence_sources: mapAuditEvidence(analysis.evidence),
    contradictions: asArray(analysis.contradictions),
    missing_evidence: asArray(risk.uncertainties),
    timeline_links: asArray(analysis.timeline).map((item) => asString(asObject(item).source_locator)).filter(Boolean),
  }];
}

function deriveScores(analysis, rawOutput) {
  const scores = asObject(rawOutput.scores);
  return {
    risk_score: clampScore(scores.risk_score, clampScore(asObject(analysis.risk).score, 0)),
    protective_score: clampScore(scores.protective_score, 0),
    bias_score: clampScore(scores.bias_score, clampScore(asObject(analysis.bias).score, 0)),
    document_quality_score: clampScore(scores.document_quality_score, 0),
    case_complexity_score: clampScore(scores.case_complexity_score, 0),
  };
}

function deriveSummaries(analysis, rawOutput) {
  const summaries = asObject(rawOutput.summaries);
  const overview = asString(asObject(analysis.summary).overview);
  return {
    child_centred: asString(summaries.child_centred, overview),
    parent_summary: asString(summaries.parent_summary),
    legal_summary: asString(summaries.legal_summary),
    strengths_summary: asString(summaries.strengths_summary),
    action_plan: asString(summaries.action_plan),
  };
}

function formatDocumentIntelligenceResult(document, analysis) {
  const doc = asObject(document);
  const run = asObject(analysis);
  const rawOutput = asObject(run.raw_output);
  const metadata = asObject(doc.metadata);
  const summary = asObject(run.summary);
  const auditEvidence = mapAuditEvidence(run.evidence);

  return {
    document_id: asString(doc.id),
    metadata: {
      document_type: asString(metadata.document_type, asString(summary.document_type)),
      author_role: asString(metadata.author_role),
      created_at: asString(metadata.creation_date, asString(doc.created_at)),
      source_system: asString(metadata.source_system),
    },
    entities: {
      people: asArray(asObject(rawOutput.entities).people),
      dates: asArray(asObject(rawOutput.entities).dates),
      locations: asArray(asObject(rawOutput.entities).locations),
      events: asArray(asObject(rawOutput.entities).events),
    },
    timeline: {
      events: asArray(run.timeline),
      gaps: asArray(asObject(rawOutput.timeline).gaps),
      contradictions: asArray(run.contradictions),
    },
    analysis: {
      risks: deriveRiskEntries(run, rawOutput),
      protective_factors: deriveProtectiveFactors(run, rawOutput),
      contradictions: asArray(run.contradictions),
      bias_indicators: deriveBiasIndicators(run, rawOutput),
      professional_concerns: asArray(asObject(rawOutput).analysis?.professional_concerns),
      missing_evidence: asArray(asObject(rawOutput).analysis?.missing_evidence).length
        ? asArray(asObject(rawOutput).analysis?.missing_evidence)
        : asArray(asObject(run.risk).uncertainties),
      severity_scale: Object.keys(asObject(asObject(rawOutput).analysis?.severity_scale)).length
        ? asObject(asObject(rawOutput).analysis?.severity_scale)
        : { risk_level: asString(asObject(run.risk).level) },
      contextual_modifiers: asObject(asObject(rawOutput).analysis?.contextual_modifiers),
    },
    scores: deriveScores(run, rawOutput),
    summaries: deriveSummaries(run, rawOutput),
    ml_features: {
      tokens: asArray(asObject(rawOutput.ml_features).tokens),
      embeddings: asArray(asObject(rawOutput.ml_features).embeddings),
      feature_vector: asArray(asObject(rawOutput.ml_features).feature_vector),
    },
    audit: {
      evidence_trace: asArray(asObject(rawOutput.audit).evidence_trace).length
        ? asArray(asObject(rawOutput.audit).evidence_trace)
        : auditEvidence,
      source_verification: asArray(asObject(rawOutput.audit).source_verification).length
        ? asArray(asObject(rawOutput.audit).source_verification)
        : auditEvidence.map((item) => ({
          source_locator: item.source_locator,
          confidence: item.confidence,
          evidence_type: item.evidence_type,
        })),
      explainability: asArray(asObject(rawOutput.audit).explainability).length
        ? asArray(asObject(rawOutput.audit).explainability)
        : asArray(run.limitations).map((item) => ({ limitation: item })),
    },
  };
}

function summarizeDocumentIntelligenceResult(document, analysis) {
  return formatDocumentIntelligenceResult(document, analysis).summaries;
}

function scoreDocumentIntelligenceResult(document, analysis) {
  return formatDocumentIntelligenceResult(document, analysis).scores;
}

module.exports = {
  formatDocumentIntelligenceResult,
  summarizeDocumentIntelligenceResult,
  scoreDocumentIntelligenceResult,
};
