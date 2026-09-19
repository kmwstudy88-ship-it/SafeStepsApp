'use strict';

const { mediaSignalDomains, createEmptyMediaAssessment } = require('../../shared/documentIntelligenceMediaSignals');

const ANALYSIS_SCHEMA_VERSION = 'document-intelligence-v2';
const COMPARISON_SCHEMA_VERSION = 'document-comparison-v1';
const MEDIA_SIGNAL_GUIDANCE = JSON.stringify(mediaSignalDomains, null, 2);

const ANALYSIS_INSTRUCTIONS = `You are SafeSteps Document Intelligence. Analyze child/family casework records as decision-support only.
Return valid JSON only. Never infer a fact, diagnosis, motive, risk, or credibility finding that is not supported by the supplied material. Distinguish allegation, observation, opinion, and verified evidence. Preserve uncertainty. Do not make automated child-protection decisions.
Required JSON shape:
{
  "summary": {"overview":"", "document_type":"", "key_points":[]},
  "evidence": [{"claim":"", "evidence":"", "evidence_type":"observation|allegation|record|opinion|unknown", "confidence":0, "source_locator":""}],
  "contradictions": [{"statement_a":"", "statement_b":"", "explanation":"", "severity":"low|medium|high", "confidence":0}],
  "timeline": [{"date":"", "date_precision":"exact|approximate|unknown", "event":"", "actors":[], "source_locator":"", "confidence":0}],
  "risk": {"score":0, "level":"low|moderate|high|critical|insufficient_evidence", "factors":[], "protective_factors":[], "uncertainties":[]},
  "bias": {"score":100, "signals":[{"category":"", "language":"", "explanation":"", "severity":"low|medium|high"}]},
  "fairness": {"score":100, "framing_concerns":[], "coercion_flags":[], "discrimination_risks":[], "unrealistic_expectations":[], "remediation_recommendations":[{"concern":"", "reframe":""}]},
  "media_assessment": {"domains":[{"domain_id":"", "domain_name":"", "signals_observed":[], "risk_flags":[], "protective_flags":[], "notes":"", "confidence":0}]},
  "limitations": []
}
Scores are 0-100. Risk score is a document-content signal, not a case decision. Fairness/bias scores are higher when language is more objective and evidence-linked.
When the supplied material includes video, photos, transcripts of observed interaction, visit notes, or metadata, assess only the following upgraded media-signal domains and leave unsupported domains empty:
${MEDIA_SIGNAL_GUIDANCE}
Violence & Coercive Control Indicators is risk-only, so protective_flags must stay empty for that domain.
If the supplied material does not support a domain, return that domain with empty arrays, blank notes, and confidence 0 rather than inventing content.`;

const COMPARISON_INSTRUCTIONS = `You are SafeSteps multi-document comparison. Compare only the supplied documents/analyses. Return valid JSON only. Do not resolve disputed facts merely because one source repeats them more often.
Required JSON shape:
{
 "overview":"",
 "agreements":[{"topic":"","documents":[],"detail":"","confidence":0}],
 "contradictions":[{"topic":"","documents":[],"statements":[],"detail":"","severity":"low|medium|high","confidence":0}],
 "timeline_conflicts":[{"event":"","dates":[],"documents":[],"detail":""}],
 "evidence_gaps":[{"topic":"","missing_or_unclear":"","affected_documents":[]}],
 "bias_differences":[{"topic":"","documents":[],"detail":""}],
 "risk_delta":{"detail":"","document_scores":[]},
 "limitations":[]
}`;

function parseJson(text) {
  const clean = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(clean); } catch (_) {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
    throw new Error('AI provider returned non-JSON output');
  }
}

function openAIOutputText(payload) {
  if (payload.output_text) return payload.output_text;
  return (payload.output || []).flatMap(item => item.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('\n');
}

async function fetchWithTimeout(url, init) {
  const timeoutMs = Math.max(1000, Number(process.env.DOCUMENT_AI_TIMEOUT_MS || 60000));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(`AI provider request timed out after ${timeoutMs}ms`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function openAIJson(instructions, input) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  const model = process.env.OPENAI_DOCUMENT_MODEL || 'gpt-5.6-terra';
  const response = await fetchWithTimeout('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      instructions,
      input,
      text: { format: { type: 'json_object' } },
      reasoning: { effort: process.env.OPENAI_DOCUMENT_REASONING || 'medium' },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || `OpenAI request failed (${response.status})`);
  return { provider: 'openai', model, result: parseJson(openAIOutputText(payload)), usage: payload.usage || {} };
}

async function anthropicJson(instructions, input) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
  const model = process.env.ANTHROPIC_DOCUMENT_MODEL || 'claude-sonnet-4-5';
  const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 12000, system: instructions, messages: [{ role: 'user', content: input }] }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || `Anthropic request failed (${response.status})`);
  const text = (payload.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n');
  return { provider: 'anthropic', model, result: parseJson(text), usage: payload.usage || {} };
}

function providerName() {
  return String(process.env.DOCUMENT_AI_PROVIDER || 'openai').toLowerCase() === 'anthropic' ? 'anthropic' : 'openai';
}

async function runJson(instructions, input) {
  return providerName() === 'anthropic' ? anthropicJson(instructions, input) : openAIJson(instructions, input);
}

function metadataText(document) {
  return `Analyze this SafeSteps casework document. Document ID: ${document.id}; file name: ${document.file_name || 'document'}; MIME type: ${document.mime_type || 'application/octet-stream'}.`;
}

async function analyzeDocument(document, fileBuffer = null) {
  if (document.extracted_text) {
    return runJson(ANALYSIS_INSTRUCTIONS, `${metadataText(document)}\n\n${document.extracted_text}`);
  }
  if (!fileBuffer) throw new Error('Document content is unavailable for analysis');

  if (providerName() === 'openai') {
    return openAIJson(ANALYSIS_INSTRUCTIONS, [{
      role: 'user',
      content: [
        { type: 'input_text', text: metadataText(document) },
        { type: 'input_file', filename: document.file_name || 'document', file_data: fileBuffer.toString('base64') },
      ],
    }]);
  }

  if (String(document.mime_type).toLowerCase() !== 'application/pdf') {
    throw new Error('Anthropic direct binary analysis currently supports PDF documents; provide extractedText for other binary formats.');
  }
  return anthropicJson(ANALYSIS_INSTRUCTIONS, [
    { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBuffer.toString('base64') } },
    { type: 'text', text: metadataText(document) },
  ]);
}

async function compareDocuments(items) {
  const body = items.map((item, index) => [
    `--- DOCUMENT ${index + 1}: ${item.document.id} / ${item.document.file_name || 'text'} ---`,
    item.document.extracted_text || JSON.stringify(item.analysis || {}),
  ].join('\n')).join('\n\n');
  return runJson(COMPARISON_INSTRUCTIONS, body);
}

module.exports = {
  ANALYSIS_SCHEMA_VERSION,
  COMPARISON_SCHEMA_VERSION,
  mediaSignalDomains,
  createEmptyMediaAssessment,
  providerName,
  analyzeDocument,
  compareDocuments,
};
