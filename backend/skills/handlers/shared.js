'use strict';

function clampConfidence(value, fallback = 0) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.round(Math.max(0, Math.min(1, num)) * 1000) / 1000;
}

function normalizeString(value) {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

function extractInputText(input = {}) {
  if (typeof input === 'string') return input.trim();
  if (!input || typeof input !== 'object') return '';
  for (const key of ['text', 'message', 'artifact', 'content', 'narrative', 'body']) {
    if (typeof input[key] === 'string' && input[key].trim()) {
      return input[key].trim();
    }
    if (input[key] && typeof input[key] === 'object' && typeof input[key].text === 'string') {
      return input[key].text.trim();
    }
  }
  return '';
}

function splitSentencesWithLocators(text = '') {
  const raw = String(text || '');
  if (!raw.trim()) return [];
  const paragraphs = raw.split(/\n\s*\n/);
  const items = [];
  let globalIndex = 0;

  paragraphs.forEach((paragraph, pIdx) => {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) return;
    const sentences = trimmedParagraph
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    sentences.forEach((sentence, sIdx) => {
      globalIndex += 1;
      items.push({
        text: sentence,
        paragraph: pIdx + 1,
        sentence: sIdx + 1,
        index: globalIndex,
        locator: `paragraph:${pIdx + 1}:sentence:${sIdx + 1}`,
      });
    });
  });

  return items;
}

function buildSkillEnvelope({
  status = 'complete',
  findings = [],
  confidence = 0,
  evidenceCitations = [],
  limitations = [],
  unsafeOutputFlags = [],
  fields = {},
}) {
  const safeLimitations = Array.isArray(limitations) && limitations.length > 0
    ? [...new Set(limitations.map((item) => String(item).trim()).filter(Boolean))]
    : ['Advisory decision-support output only; requires practitioner verification against primary records.'];

  const safeCitations = Array.isArray(evidenceCitations)
    ? [...new Set(evidenceCitations.map((item) => String(item).trim()).filter(Boolean))]
    : [];

  return {
    status,
    findings: Array.isArray(findings) ? findings : [],
    confidence: clampConfidence(confidence, 0),
    evidence_citations: safeCitations,
    limitations: safeLimitations,
    human_review_required: true,
    unsafe_output_flags: Array.isArray(unsafeOutputFlags) ? unsafeOutputFlags : [],
    ...fields,
  };
}

module.exports = {
  clampConfidence,
  normalizeString,
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
};
