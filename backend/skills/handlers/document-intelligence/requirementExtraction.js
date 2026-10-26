'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const OBLIGATION_PATTERN = /\b(must|shall|required\s+to|agreed\s+to|will\s+complete|expected\s+to\s+attend|mandatory|obligation\s+to)\b/i;
const VAGUE_OBLIGATION_PATTERN = /\b(try\s+harder|be\s+a\s+better|improve\s+attitude|show\s+more\s+effort|as\s+soon\s+as\s+possible|whenever\s+possible|demonstrate\s+readiness)\b/i;
const DUE_DATE_PATTERN = /\b(by\s+\d{4}-\d{2}-\d{2}|by\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?|within\s+\d+\s+(?:days|weeks|months)|weekly|monthly|every\s+(?:week|Monday|Tuesday|Wednesday|Thursday|Friday))\b/i;
const PARTY_PATTERN = /\b(parent|mother|father|carer|caregiver|caseworker|worker|agency|department|provider)\b/i;

function inferStatusHint(sentence) {
  if (/\b(completed|met|fulfilled|finished|attended\s+all)\b/i.test(sentence)) return 'met';
  if (/\b(in\s+progress|partially|enrolled|started)\b/i.test(sentence)) return 'partially_met';
  if (/\b(unmet|missed|not\s+yet\s+completed|pending)\b/i.test(sentence)) return 'unmet';
  return 'unknown';
}

async function requirementExtractionHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No document text was provided for requirement and obligation extraction.',
        'Extracts explicit textual commitments only; does not interpret legal enforceability.',
      ],
      fields: {
        obligations: [],
        ambiguous_requirements: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const obligations = [];
  const ambiguousRequirements = [];
  const citations = [];

  for (const item of sentences) {
    const hasObligation = OBLIGATION_PATTERN.test(item.text);
    const hasVague = VAGUE_OBLIGATION_PATTERN.test(item.text);

    if (hasObligation) {
      const partyMatch = item.text.match(PARTY_PATTERN);
      const dueMatch = item.text.match(DUE_DATE_PATTERN);
      obligations.push({
        party: partyMatch ? partyMatch[1].toLowerCase() : 'unspecified_party',
        obligation: item.text,
        due_date: dueMatch ? dueMatch[0] : 'unspecified',
        status_hint: inferStatusHint(item.text),
        source_locator: item.locator,
      });
      citations.push(`${item.locator} "${item.text}"`);

      if (!dueMatch || hasVague) {
        ambiguousRequirements.push(
          `${item.locator}: Requirement "${item.text}" lacks a specific measurable target or concrete deadline.`,
        );
      }
    } else if (hasVague) {
      ambiguousRequirements.push(
        `${item.locator}: Subjective expectation "${item.text}" should be restated with concrete, observable steps.`,
      );
      citations.push(`${item.locator} "${item.text}"`);
    }
  }

  const hasFindings = obligations.length > 0 || ambiguousRequirements.length > 0;
  return buildSkillEnvelope({
    status: hasFindings ? 'complete' : 'insufficient_evidence',
    findings: obligations,
    confidence: hasFindings ? Math.min(0.9, 0.7 + obligations.length * 0.05) : 0.4,
    evidenceCitations: citations,
    limitations: [
      'Extracts explicit obligation language only; does not assess legal validity or external support availability.',
      'All extracted obligations require human worker verification with the family.',
    ],
    fields: {
      obligations,
      ambiguous_requirements: ambiguousRequirements,
    },
  });
}

module.exports = { requirementExtractionHandler };
