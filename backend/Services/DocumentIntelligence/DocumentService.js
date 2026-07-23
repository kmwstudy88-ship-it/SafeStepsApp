import OpenAI from 'openai';

const MODEL = process.env.SAFESTEPS_DOCUMENT_INTELLIGENCE_MODEL ?? 'gpt-4o-mini';
const MIN_DOCUMENT_CHARS = 20;
const MAX_DOCUMENT_CHARS = 80_000;

let client;

const reviewSections = [
  ['parentCapacity', 'Parent capacity'],
  ['parentingSkill', 'Parenting skill'],
  ['parentProgress', 'Parent progress'],
  ['parentAdvocacy', 'Parent advocacy'],
  ['communicationSkill', 'Communication skill'],
  ['routineManagement', 'Routine management'],
  ['emotionalRegulationSupport', 'Emotional regulation support'],
  ['homeManagement', 'Home management'],
  ['learningEngagement', 'Learning engagement'],
  ['parentInsight', 'Parent insight'],
  ['childVoice', 'Child voice'],
  ['childWellbeing', 'Child wellbeing'],
  ['developmentalAppropriateness', 'Developmental appropriateness'],
  ['educationStability', 'Education stability'],
  ['healthNeeds', 'Health needs'],
  ['emotionalState', 'Emotional state'],
  ['socialConnection', 'Social connection'],
  ['behaviourPattern', 'Behaviour pattern'],
  ['attachmentQuality', 'Attachment quality'],
  ['childSafetyIndicator', 'Child safety indicator'],
  ['safetyRisk', 'Safety risk'],
  ['domesticViolence', 'Domestic violence pattern'],
  ['substanceUse', 'Substance use pattern'],
  ['mentalHealthIndicators', 'Mental health indicators'],
  ['housingStability', 'Housing stability'],
  ['environmentalRisk', 'Environmental risk'],
  ['financialStress', 'Financial stress'],
  ['crisisHistory', 'Crisis history'],
  ['safetyPlanQuality', 'Safety plan quality'],
  ['contactVisit', 'Contact visit'],
  ['caseworkerAccountability', 'Caseworker accountability'],
  ['caseworkerBias', 'Caseworker bias'],
  ['caseworkerOmissions', 'Caseworker omissions'],
  ['caseworkerFollowThrough', 'Caseworker follow-through'],
  ['documentQuality', 'Document quality'],
  ['culturalContext', 'Cultural context'],
  ['supportNetwork', 'Support network'],
  ['serviceEngagement', 'Service engagement'],
  ['evidenceWeighting', 'Evidence weighting'],
  ['caseComplexity', 'Case complexity'],
];

const sectionKeys = reviewSections.map(([key]) => key);

const sectionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'signals', 'evidenceRefs', 'gaps', 'reviewPrompts', 'confidence'],
  properties: {
    summary: { type: 'string' },
    signals: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
    evidenceRefs: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
    gaps: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
    reviewPrompts: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
    confidence: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
    },
  },
};

const responseSchema = {
  name: 'safesteps_document_intelligence',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'overallSummary',
      'priorityReview',
      'safetyFlags',
      'evidenceGaps',
      'workerReviewActions',
      'sections',
      'disclaimer',
    ],
    properties: {
      overallSummary: { type: 'string' },
      priorityReview: {
        type: 'array',
        maxItems: 8,
        items: { type: 'string' },
      },
      safetyFlags: {
        type: 'array',
        maxItems: 8,
        items: { type: 'string' },
      },
      evidenceGaps: {
        type: 'array',
        maxItems: 8,
        items: { type: 'string' },
      },
      workerReviewActions: {
        type: 'array',
        maxItems: 8,
        items: { type: 'string' },
      },
      sections: {
        type: 'object',
        additionalProperties: false,
        required: sectionKeys,
        properties: Object.fromEntries(sectionKeys.map((key) => [key, sectionSchema])),
      },
      disclaimer: { type: 'string' },
    },
  },
};

export const DOCUMENT_INTELLIGENCE_SCHEMA_VERSION = '2026-07-15';
export const DOCUMENT_INTELLIGENCE_MAX_TEXT_CHARS = MAX_DOCUMENT_CHARS;

export async function analyzeDocument(text, options = {}) {
  const documentText = normalizeDocumentText(text);
  const startedAt = new Date().toISOString();
  const completion = await getOpenAIClient(options.client).chat.completions.create({
    model: options.model ?? MODEL,
    temperature: 0.1,
    response_format: {
      type: 'json_schema',
      json_schema: responseSchema,
    },
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(),
      },
      {
        role: 'user',
        content: documentText,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  const parsed = parseModelJson(content);

  return {
    schemaVersion: DOCUMENT_INTELLIGENCE_SCHEMA_VERSION,
    model: completion.model ?? options.model ?? MODEL,
    generatedAt: startedAt,
    input: {
      characterCount: documentText.length,
      truncated: documentText.length !== String(text).trim().length,
    },
    ...parsed,
  };
}

export function normalizeDocumentText(text) {
  if (typeof text !== 'string') {
    throw validationError('analyzeDocument requires document text.');
  }

  const normalized = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();

  if (normalized.length < MIN_DOCUMENT_CHARS) {
    throw validationError(`Document text must be at least ${MIN_DOCUMENT_CHARS} characters.`);
  }

  return normalized.slice(0, MAX_DOCUMENT_CHARS);
}

export function documentIntelligenceSections() {
  return reviewSections.map(([key, label]) => ({ key, label }));
}

export function documentIntelligenceResponseSchema() {
  return responseSchema;
}

function getOpenAIClient(injectedClient) {
  if (injectedClient) return injectedClient;
  if (client) return client;

  client = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  return client;
}

function buildSystemPrompt() {
  const sectionList = reviewSections.map(([key, label]) => `- ${key}: ${label}`).join('\n');

  return [
    'You are SafeSteps Document Intelligence for child-safety and parenting-support document review.',
    'Return structured JSON only using the provided schema.',
    'Treat the output as worker/supervisor review support, not a final finding, legal opinion, diagnosis, or automated decision.',
    'Do not invent facts. If the document lacks evidence, put the issue in gaps or evidenceGaps.',
    'Use court-aware, factual, neutral wording: observed, reported, documented, unclear, requires review.',
    'Preserve strengths and protective actions alongside risks.',
    'Flag urgent safety concerns for human review, but do not instruct covert surveillance, automatic emergency action, or legal conclusions.',
    'For evidenceRefs, cite short source phrases from the submitted document when available.',
    'For confidence, use low unless the document directly supports the summary.',
    'Complete every section key, even when the correct answer is that no reliable signal is present.',
    'Sections to complete:',
    sectionList,
  ].join('\n\n');
}

function parseModelJson(content) {
  if (!content) {
    throw new Error('OpenAI returned an empty document intelligence response.');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`OpenAI returned invalid JSON: ${error instanceof Error ? error.message : 'unknown parse error'}`);
  }
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}
