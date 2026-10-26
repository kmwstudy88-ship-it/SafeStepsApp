'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const EXACT_DATE_PATTERN = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+\d{4})?)\b/i;
const APPROX_DATE_PATTERN = /\b(early\s+\d{4}|mid[-\s]\d{4}|late\s+\d{4}|last\s+(?:week|month|year)|(?:two|three|\d+)\s+(?:days|weeks|months)\s+ago|yesterday|on\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))\b/i;
const VAGUE_TIME_PATTERN = /\b(recently|some\s+time\s+ago|previously|at\s+some\s+point|a\s+while\s+back|later\s+on)\b/i;
const ACTOR_PATTERN = /\b(mother|father|parent|child|carer|caseworker|worker|supervisor|teacher|grandmother|grandfather|aunt|uncle)\b/ig;

function extractActors(text) {
  const matches = text.match(ACTOR_PATTERN) || [];
  return [...new Set(matches.map((m) => m.toLowerCase()))];
}

async function timelineExtractionHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No narrative text was supplied for timeline extraction.',
        'Relative temporal references cannot be anchored without document creation date.',
      ],
      fields: {
        timeline_events: [],
        chronology_gaps: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const timelineEvents = [];
  const chronologyGaps = [];
  const citations = [];

  for (const item of sentences) {
    const exactMatch = item.text.match(EXACT_DATE_PATTERN);
    const approxMatch = !exactMatch ? item.text.match(APPROX_DATE_PATTERN) : null;
    const vagueMatch = !exactMatch && !approxMatch ? item.text.match(VAGUE_TIME_PATTERN) : null;

    if (exactMatch) {
      timelineEvents.push({
        date: exactMatch[1],
        date_precision: 'exact',
        event: item.text,
        actors: extractActors(item.text),
        source_locator: item.locator,
      });
      citations.push(`${item.locator} [${exactMatch[1]}] "${item.text}"`);
    } else if (approxMatch) {
      timelineEvents.push({
        date: approxMatch[1],
        date_precision: 'approximate',
        event: item.text,
        actors: extractActors(item.text),
        source_locator: item.locator,
      });
      citations.push(`${item.locator} [~${approxMatch[1]}] "${item.text}"`);
      chronologyGaps.push(
        `${item.locator}: Relative time reference "${approxMatch[1]}" requires an anchor date for exact ordering.`,
      );
    } else if (vagueMatch) {
      chronologyGaps.push(
        `${item.locator}: Unanchored temporal phrase "${vagueMatch[1]}" leaves event sequence ambiguous.`,
      );
    }
  }

  const hasFindings = timelineEvents.length > 0 || chronologyGaps.length > 0;
  return buildSkillEnvelope({
    status: hasFindings ? 'complete' : 'insufficient_evidence',
    findings: timelineEvents,
    confidence: timelineEvents.length > 0 ? Math.min(0.92, 0.72 + timelineEvents.length * 0.05) : 0.35,
    evidenceCitations: citations,
    limitations: [
      'Does not infer missing dates or reorder events beyond explicit textual markers.',
      'Approximate and relative time phrases require human verification against primary logs.',
    ],
    fields: {
      timeline_events: timelineEvents,
      chronology_gaps: chronologyGaps,
    },
  });
}

module.exports = { timelineExtractionHandler };
