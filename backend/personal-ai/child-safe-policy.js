'use strict';

const PRIVACY_REQUEST_PATTERN = /\b(full\s*name|surname|last\s*name|first\s*name|address|street|suburb|postcode|school|phone|email|social\s*media|photo|picture|where\s+you\s+live|who\s+you\s+live\s+with)\b/ig;
const IMMEDIATE_DANGER_PATTERN = /\b(now|right now|tonight|today|immediately|urgent|emergency|can't breathe|bleeding|hurt me|hurting me|kill me|suicide|self[-\s]?harm|unsafe at home)\b/i;
const UNSAFE_TONE_PATTERN = /\b(your fault|you should have|prove it|why didn't you|details please|tell me exactly what happened|give me their name)\b/ig;

const DISCLOSURE_SIGNALS = {
  abuse: /\b(hit|hurt|abuse|abused|molest|touch me|violent|violence|threaten|threatened|yell at me|scream at me)\b/i,
  self_harm: /\b(self[-\s]?harm|suicide|kill myself|want to die|hurt myself|cut myself)\b/i,
  coercion: /\b(force|forced|made me|won't let me|control me|locked|trapped|blackmail|threatened to)\b/i,
  fear: /\b(scared|afraid|terrified|frightened|panic|unsafe)\b/i,
};

const DEVELOPMENT_PROFILES = {
  early_child: { label: 'early_child', style: 'short', vocabulary: 'simple' },
  middle_child: { label: 'middle_child', style: 'clear', vocabulary: 'age_appropriate' },
  adolescent: { label: 'adolescent', style: 'respectful', vocabulary: 'plain' },
  unknown: { label: 'unknown', style: 'plain', vocabulary: 'plain' },
};

function normalizeAgeBand(ageBand) {
  const value = String(ageBand || '').trim().toLowerCase();
  if (value === 'early_child' || value === 'middle_child' || value === 'adolescent') return value;
  return 'unknown';
}

function deriveAgeBand(context = {}) {
  const direct = normalizeAgeBand(context.ageBand || context.developmentBand);
  if (direct !== 'unknown') return direct;
  const age = Number(context.ageYears);
  if (Number.isFinite(age) && age >= 0) {
    if (age <= 8) return 'early_child';
    if (age <= 12) return 'middle_child';
    if (age >= 13) return 'adolescent';
  }
  return 'unknown';
}

function detectDisclosureSignals(message = '') {
  const text = String(message || '');
  return Object.entries(DISCLOSURE_SIGNALS)
    .filter(([, pattern]) => pattern.test(text))
    .map(([signal]) => signal);
}

function hasImmediateDanger(message = '') {
  return IMMEDIATE_DANGER_PATTERN.test(String(message || ''));
}

function privacyBoundaryNotice(ageBand) {
  if (ageBand === 'early_child') {
    return 'You can share only what feels okay. You do not need names, addresses, or private details.';
  }
  return 'Share only what feels safe. You do not need to provide names, addresses, or identifying details.';
}

function confidentialityLine() {
  return 'I keep this focused on your safety. If someone is in immediate danger, contact emergency services or a trusted safe adult now.';
}

function emotionalValidation(ageBand) {
  if (ageBand === 'early_child') return 'Thank you for telling me. You did the right thing.';
  return 'Thank you for sharing this. You deserve to feel safe and supported.';
}

function safetyPlanLines({ immediateDanger, ageBand }) {
  if (immediateDanger) {
    return ageBand === 'early_child'
      ? [
        'If you can, go to a safe grown-up right now.',
        'If there is danger now, call emergency services now.',
        'Take slow breaths with me: in for 4, out for 4.',
      ]
      : [
        'Move to the safest nearby place you can get to now.',
        'Contact a trusted adult, local crisis line, or emergency services right now.',
        'Use a grounding step: name 5 things you can see, then take 3 slow breaths.',
      ];
  }

  return ageBand === 'early_child'
    ? [
      'Pick one safe grown-up you can tell today.',
      'Choose one safe place you can go if you feel worried.',
      'Practice a calm step: hand on heart, slow breathing.',
    ]
    : [
      'Choose one trusted person to contact if you feel unsafe.',
      'Pick a safer place and a simple way to get there.',
      'Use a grounding strategy now: slow breathing or 5-4-3-2-1 senses.',
    ];
}

function removeUnsafePrompts(text = '') {
  return String(text || '')
    .replace(UNSAFE_TONE_PATTERN, '')
    .replace(PRIVACY_REQUEST_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function adaptDraftByDevelopment(draft, ageBand) {
  const clean = removeUnsafePrompts(draft);
  if (!clean) return '';
  if (ageBand === 'early_child') {
    return clean
      .replace(/\bapproximately\b/gi, 'about')
      .replace(/\btherefore\b/gi, 'so')
      .replace(/\bhowever\b/gi, 'but');
  }
  return clean;
}

function buildChildSafeResponse({ userMessage, draftResponse, context = {} }) {
  const ageBand = deriveAgeBand(context);
  const profile = DEVELOPMENT_PROFILES[ageBand];
  const signals = detectDisclosureSignals(userMessage);
  const immediateDanger = hasImmediateDanger(userMessage);
  const disclosureSensitive = signals.length > 0;
  const base = adaptDraftByDevelopment(draftResponse, ageBand);
  const lines = [
    emotionalValidation(ageBand),
    base || '',
    ...safetyPlanLines({ immediateDanger, ageBand }),
    privacyBoundaryNotice(ageBand),
    confidentialityLine(),
  ].filter(Boolean);

  const response = lines.join(' ');
  return {
    response,
    metadata: {
      ageBand: profile.label,
      disclosureSensitive,
      matchedSignals: signals,
      immediateDanger,
      requiresHumanReview: immediateDanger || signals.includes('self_harm'),
      safetyPlanIncluded: true,
      boundaryNoticeIncluded: true,
    },
  };
}

module.exports = {
  buildChildSafeResponse,
  detectDisclosureSignals,
  deriveAgeBand,
  hasImmediateDanger,
};
