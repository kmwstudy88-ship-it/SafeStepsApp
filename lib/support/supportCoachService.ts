/**
 * SafeSteps AI Support Coach Service (SS-AIC-001 - SS-AIC-029)
 *
 * Provides trauma-informed, non-judgmental parental de-escalation coaching,
 * box breathing resets, and instant escalation to Australian crisis helplines.
 *
 * In accordance with child protection standards:
 * - Output is strictly supportive and non-judgmental
 * - Disclosures of immediate harm or self-harm immediately trigger crisis contacts
 * - Operates offline with local fallback de-escalation scripts
 */

export interface CrisisContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  hours: string;
  isEmergency?: boolean;
}

export const AUSTRALIAN_CRISIS_CONTACTS: CrisisContact[] = [
  {
    id: 'emergency_000',
    name: 'Emergency Services (Police / Ambulance)',
    phone: '000',
    description: 'Immediate threat to life or personal safety',
    hours: '24/7',
    isEmergency: true,
  },
  {
    id: 'dv_1800respect',
    name: '1800RESPECT (Domestic & Family Violence)',
    phone: '1800 737 732',
    description: 'Confidential information, counseling and support for family violence',
    hours: '24/7',
  },
  {
    id: 'lifeline',
    name: 'Lifeline (Crisis & Suicide Prevention)',
    phone: '13 11 14',
    description: 'Confidential crisis support and suicide prevention services',
    hours: '24/7',
  },
  {
    id: 'parentline',
    name: 'Parentline QLD/NT',
    phone: '1300 30 1300',
    description: 'Support, counseling and guidance for parents and carers',
    hours: '8am - 10pm, 7 days',
  },
  {
    id: 'kids_helpline',
    name: 'Kids Helpline',
    phone: '1800 55 1800',
    description: 'Free, private phone counseling for children and young people aged 5 to 25',
    hours: '24/7',
  },
];

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  crisisAlertTriggered?: boolean;
}

export interface SupportCoachResponse {
  message: string;
  suggestedActions: string[];
  crisisTriggered: boolean;
  handoverOffered?: boolean;
}

export const COACH_SUGGESTED_PROMPTS: string[] = [
  'My child is having a meltdown before handover',
  'I feel overwhelmed and about to yell',
  'How do I prepare for my caseworker meeting tomorrow?',
  'Bedtime routine is falling apart tonight',
  'Need a 60-second breathing reset right now',
  'I cannot afford bus fare or groceries this week (ECS Safe Harbor)',
  'Coach me on ABC / PCIT PRIDE skills for my visit today',
];

const LOCAL_FALLBACK_RULES: { keywords: RegExp; response: string; suggestions: string[] }[] = [
  {
    keywords: /\b(?:meltdown|screaming|tantrum|refusing to leave)\b/i,
    response:
      "When a child is overwhelmed, their rational brain is offline. First, lower your posture to their eye level and drop your voice volume into a quiet whisper. Validate their feeling before giving direction: 'I see how big this feeling is. You are safe. I am right here.' Offer two simple choices: 'Do you want to hold my hand or carry your toy to the car?'",
    suggestions: ['Guide me through 4-4-4-4 breathing', 'What if they keep kicking?'],
  },
  {
    keywords: /\b(?:overwhelmed|yell|snap|lose my temper|angry|shout)\b/i,
    response:
      "Stop and step back one physical step. Narrate your regulation aloud: 'My body feels very loud right now. I am stepping to the kitchen counter to take three slow breaths so I can stay calm.' Place both feet firmly on the ground, unclench your jaw, and let your shoulders drop. Your child's behavior is communication, not defiance.",
    suggestions: ['Start 30-second box breathing', 'Give me a de-escalation script'],
  },
  {
    keywords: /\b(?:caseworker|meeting|conference|court|review)\b/i,
    response:
      "Walking into a caseworker meeting can feel intimidating. Focus on objective facts: 1) What specific evidence have you deposited in the Vault? 2) Which goals on your Case Plan have you demonstrated? 3) Keep your statements calm and child-centered: 'My focus is ensuring Leo feels secure and predictable during routines.'",
    suggestions: ['Check my Case Plan checklist', 'Review Concerns & Right of Reply'],
  },
  {
    keywords: /\b(?:breathing|breath|reset|calm|grounding)\b/i,
    response:
      "Let's do a 4-4-4-4 Box Breathing Reset right now:\n1. Inhale slowly through your nose: 1... 2... 3... 4\n2. Hold your breath gently: 1... 2... 3... 4\n3. Exhale completely through your mouth: 1... 2... 3... 4\n4. Pause empty: 1... 2... 3... 4\nRepeat this twice more. Your nervous system is settling.",
    suggestions: ['I feel a bit calmer now', 'Show me quick bedtime scripts'],
  },
  {
    keywords: /\b(?:rent|eviction|food|groceries|electricity|utility|transport|bus|broke|money|afford|voucher)\b/i,
    response:
      "Poverty is NOT child neglect. In SafeSteps, asking for help with rent, utility bills, groceries, childcare, or transport carries ZERO child-protection risk penalty. You can request non-punitive Economic & Concrete Supports (ECS) or pause your compliance timer if a transit gap blocks your visit.",
    suggestions: ['Open Economic & Concrete Supports (ECS)', 'Connect with a Parent Partner Peer Mentor'],
  },
  {
    keywords: /\b(?:abc|pcit|pride|follow the lead|nurturance|connect during visit|play with my child)\b/i,
    response:
      "During your visit today, use ABC In-the-Moment & PCIT PRIDE coaching:\n1. Follow the Lead: Let your child pick the activity and narrate what they are doing ('You are stacking the blue block on top!').\n2. Labeled Praise (P): 'Thank you for sharing that crayon with me!'\n3. Reflect (R) & Imitate (I): Mirror their calm words and play.\n4. Nurturance: If they become fussy or sad near the end of the visit, offer immediate warm comfort—separation grief is normal attachment, not bad behavior.",
    suggestions: ['Open Contact Visit Companion', 'How do I handle goodbye tears?'],
  },
  {
    keywords: /\b(?:after the visit|saying goodbye|cried when leaving|visit ended|missing my child|return to carer|goodbye tears)\b/i,
    response:
      "End-of-visit tears and post-visit sadness are signs of how deeply you and your child love each other—not a parenting failure. Use a predictable 5-minute transition ritual ('Two more minutes of blocks, then our special handshake and sharing your drawing with your carer'), and take 10 minutes after the visit with your Parent Partner or breathing reset to buffer your own nervous system.",
    suggestions: ['Guide me through a post-visit breathing reset', 'Log a Carer Transition Handoff Note'],
  },
];

/**
 * Checks if a user message contains immediate danger signals.
 */
export function detectCrisisSignals(text: string): boolean {
  const dangerPattern = /\b(?:kill myself|end it all|suicide|hurt my child|hit my child|overdose|harm myself|not worth living)\b/i;
  return dangerPattern.test(text);
}

/**
 * Generates a supportive, trauma-informed coach response.
 */
export async function getCoachResponse(
  userMessage: string,
  _history: ChatMessage[] = []
): Promise<SupportCoachResponse> {
  const text = userMessage.trim();

  // 1. Check for immediate crisis / harm disclosure
  if (detectCrisisSignals(text)) {
    return {
      message:
        "I hear that you are going through an overwhelming amount of pain and distress right now. Because your safety and your family's safety are the absolute top priority, please reach out to one of the 24/7 confidential crisis helplines below right now. Lifeline (13 11 14) and 1800RESPECT (1800 737 732) are free and available 24/7.",
      suggestedActions: ['Call Lifeline (13 11 14)', 'Call 1800RESPECT', 'Call 000'],
      crisisTriggered: true,
      handoverOffered: true,
    };
  }

  // 2. Check local fallback pattern matching
  for (const rule of LOCAL_FALLBACK_RULES) {
    if (rule.keywords.test(text)) {
      return {
        message: rule.response,
        suggestedActions: rule.suggestions,
        crisisTriggered: false,
      };
    }
  }

  // 3. General trauma-informed baseline response
  return {
    message:
      "You are doing hard, meaningful work taking steps for your family. Focus on one moment at a time. What is one small, manageable action you can take in the next 10 minutes to support your calm and your child's safety?",
    suggestedActions: [
      'Take 3 slow breaths',
      'Review my case plan goals',
      'Check emergency SOS scripts',
    ],
    crisisTriggered: false,
  };
}
