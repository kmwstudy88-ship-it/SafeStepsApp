'use strict';

const { extractInputText, buildSkillEnvelope } = require('../shared');

const BEHAVIOR_THEMES = [
  {
    pattern: /\b(tantrum|meltdown|crying|clinging|acting\s+out|after\s+visit|transition|drop[-\s]?off)\b/i,
    meanings: [
      'Transition stress or big feelings while shifting between environments and routines.',
      'Need for predictable reassurance, sensory calm, and connection after a big emotional event.',
    ],
  },
  {
    pattern: /\b(quiet|withdrawn|won't\s+talk|shut\s+down|looking\s+away|silent|avoiding)\b/i,
    meanings: [
      'Protective self-regulation when feeling overloaded, unsure, or worried about saying the wrong thing.',
      'Need for low-pressure companionship without immediate questioning.',
    ],
  },
  {
    pattern: /\b(late|missed|rescheduled|didn't\s+reply|no\s+response)\b/i,
    meanings: [
      'Practical barriers such as transport, work shifts, phone credit, or competing caregiving demands.',
      'Stress or overwhelm around formal communication rather than lack of care.',
    ],
  },
  {
    pattern: /\b(pushing\s+away|acting\s+tough|refusing\s+hug|miscuing|goodbye\s+grief)\b/i,
    meanings: [
      'ABC-EC Attachment Miscuing: Children who have experienced separation trauma often push away or act tough when they most need gentle nurturance and emotional safety.',
      'Acute pre/post-visit separation grief requiring calm co-regulation, sensory transition objects, and non-demanding warmth.',
    ],
  },
];

async function behaviorMessageInterpretationHandler({ input = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No behavioral description or message was provided to explore possible meanings.',
      ],
      fields: {
        possible_meanings: [],
        uncertainties: [],
      },
    });
  }

  const possibleMeanings = [];
  for (const rule of BEHAVIOR_THEMES) {
    if (rule.pattern.test(message)) {
      possibleMeanings.push(...rule.meanings);
    }
  }

  if (possibleMeanings.length === 0) {
    possibleMeanings.push(
      'Behavior may reflect an unmet practical, sensory, or emotional need for predictability and reassurance.',
      'The person may be doing their best to cope with stress using the tools currently available to them.',
    );
  }

  const uncertainties = [
    'Observable behavior can have multiple developmental, situational, or environmental explanations.',
    'Cannot infer internal intent or motivation from a single observation without checking in supportively.',
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: possibleMeanings.map((meaning) => ({ possible_meaning: meaning })),
    confidence: 0.8,
    evidenceCitations: [`message:"${message.slice(0, 120)}"`],
    limitations: [
      'Offers non-judgmental developmental and trauma-informed hypotheses only; never a behavioral or clinical assessment.',
    ],
    fields: {
      possible_meanings: possibleMeanings,
      uncertainties,
    },
  });
}

module.exports = { behaviorMessageInterpretationHandler };
