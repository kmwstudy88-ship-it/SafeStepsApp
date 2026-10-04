export type ProtectiveCapacityItemContent = {
  prompt: string;
  context: string;
};

export type ProtectiveCapacityDomainContent = {
  summary: string;
  reflectionPrompt: string;
  nextStep: string;
  caution?: string;
};

export const protectiveCapacityItemContent: Record<string, ProtectiveCapacityItemContent> = {
  "active-safety-concern": {
    prompt: "Is there a safety concern affecting a child right now that does not yet have a workable safety response?",
    context: "Choose the closest option. If someone may be in immediate danger, stop here and contact local emergency services or a trusted safe person.",
  },
  "safe-supervision": {
    prompt: "How consistently can I provide supervision that matches my child's age, needs, and current safety plan?",
    context: "Think about ordinary routines as well as busy, stressful, or changing situations.",
  },
  "risk-insight": {
    prompt: "How well can I describe the situations or needs that could affect my child's safety?",
    context: "Focus on what you understand today; it is okay to still have questions.",
  },
  "repair-accountability": {
    prompt: "When my actions affect my child, how consistently do I acknowledge the impact and take a helpful repair step?",
    context: "A repair step may include listening, respecting a boundary, changing a behaviour, or following an agreed plan.",
  },
  "prioritises-child-needs": {
    prompt: "When my needs and my child's needs compete, how consistently do I make space for my child's safety, care, and development?",
    context: "This is about practical choices, not being perfect or ignoring your own need for support.",
  },
  "acknowledges-removal-reasons": {
    prompt: "How clearly can I explain the concerns that led to the current care or safety arrangements?",
    context: "You can recognize concerns without agreeing with every interpretation or giving up your right to ask questions.",
  },
  "understands-child-harm": {
    prompt: "How well can I describe how difficult experiences may have affected my child?",
    context: "Children can respond differently. Avoid guessing what your child feels; use what they share and guidance from suitable professionals.",
  },
  "non-defensive-feedback": {
    prompt: "When I receive difficult feedback, how often can I pause, ask what is meant, and consider what may be useful?",
    context: "You can disagree respectfully, ask for examples, and request time or support to respond.",
  },
  "changed-thinking-behaviour": {
    prompt: "How consistently have I changed specific actions or routines in ways that match what I have learned?",
    context: "Use recent examples of what you did differently, including what is still hard to maintain.",
  },
  "stress-regulation-sessions": {
    prompt: "How often do I practise a calming or grounding strategy before stress takes over?",
    context: "A strategy can be brief and personal: pausing, breathing, stepping away safely, or contacting support.",
  },
  "responds-to-challenge": {
    prompt: "When plans change or I feel challenged, how consistently can I respond without escalating conflict?",
    context: "Consider what helps you slow down and what support you need when that is difficult.",
  },
  "uses-coping-strategies": {
    prompt: "How consistently do I use coping strategies that are safe and helpful for me and my family?",
    context: "Include strategies you are practising, not only ones that already work every time.",
  },
  "emotional-stability-over-time": {
    prompt: "Across different days and situations, how consistently can I recover and return to the care tasks my child needs?",
    context: "This is not a judgment about having emotions. Notice patterns, support needs, and what helps recovery.",
  },
  "child-development-knowledge": {
    prompt: "How confident am I in matching my expectations and support to my child's developmental stage and individual needs?",
    context: "Children develop differently. It is appropriate to check understanding with a qualified professional.",
  },
  "safe-nurturing-interaction": {
    prompt: "How often do my interactions help my child feel listened to, respected, and physically and emotionally safe?",
    context: "Think about both warm moments and how you respond when your child is upset or needs space.",
  },
  "applies-skills-in-contact": {
    prompt: "During time together, how consistently can I use the parenting skills I have been practising?",
    context: "Consider the child's needs and the agreed contact plan; one difficult moment does not describe the whole relationship.",
  },
  "responsive-to-child-cues": {
    prompt: "How often do I notice and respond to my child's words, body language, pace, and need for a break?",
    context: "When you are unsure, a calm check-in and respecting the answer can help.",
  },
  "housing-stability": {
    prompt: "Do I currently have a safe and workable place to stay, or a clear support plan for housing changes?",
    context: "Housing barriers are support needs, not a measure of care or personal worth.",
  },
  "home-cleanliness-consistency": {
    prompt: "Can the home routines meet my child's practical health, comfort, and accessibility needs?",
    context: "Focus on specific needs such as clean sleeping space, safe walkways, or working facilities—not appearance or social expectations.",
  },
  "bills-paid-consistently": {
    prompt: "How manageable are the essential household costs for keeping my child's daily needs met?",
    context: "If costs are difficult, identify support or advice that could help; financial hardship is not a character judgment.",
  },
  "food-provision": {
    prompt: "How consistently can I provide food and drinks that meet my child's needs and any agreed health or cultural requirements?",
    context: "Include access to practical help when money, transport, health, or availability makes this difficult.",
  },
  "daily-routines": {
    prompt: "How predictable are the daily routines my child depends on, such as meals, sleep, school, or care?",
    context: "Routines can be flexible and still dependable. Consider what works for this child and household.",
  },
  "home-stability": {
    prompt: "How prepared am I to keep my child's care arrangements steady when plans or household circumstances change?",
    context: "Think about backup plans, safe contacts, and what you would communicate early.",
  },
  "service-follow-through": {
    prompt: "How manageable is it for me to attend, participate in, or reschedule the support that has been agreed?",
    context: "Access barriers, unclear expectations, or a poor service fit may need to be discussed—not hidden.",
  },
  "drug-test-critical": {
    prompt: "If substance testing is part of my support plan, how clear and current is my understanding of the results and any next steps?",
    context: "This tool cannot interpret a test result or determine impairment. Discuss results, missed tests, medication, and next steps with the qualified provider.",
  },
  "child-feels-safe": {
    prompt: "Based only on what my child has chosen to share or show in a safe, age-appropriate way, what do I understand about their sense of safety?",
    context: "Do not question, pressure, or ask a child to reassure you. If you do not know, leave this unanswered and seek appropriate guidance.",
  },
  "child-voice-considered": {
    prompt: "How consistently do I make room for my child's views and preferences in decisions that affect them?",
    context: "A child's voice should be heard without asking them to choose sides or carry adult messages.",
  },
  "evidence-over-time": {
    prompt: "How much recent information is available to understand whether changes are continuing over time?",
    context: "A lack of records is not proof that change has or has not happened. Note what is known and what remains uncertain.",
  },
  "collateral-alignment": {
    prompt: "How clearly can I understand information from different people or services, including where it differs?",
    context: "Different accounts need careful review. A difference is a question to understand, not proof that someone is dishonest.",
  },
  "internal-consistency": {
    prompt: "How well do my current descriptions of goals, plans, and support needs fit together?",
    context: "People may remember or describe events differently over time. Ask for clarification rather than assuming intent.",
  },
  "verbal-behaviour-alignment": {
    prompt: "How often do my day-to-day actions reflect the changes and commitments I describe?",
    context: "Look for practical examples and barriers. This question cannot establish truthfulness or intent.",
  },
  "generalisation-outside-sessions": {
    prompt: "How often can I use helpful strategies outside appointments or supported sessions?",
    context: "Notice where a strategy transfers, where it does not, and what extra support may be needed.",
  },
  "authentic-emotional-range": {
    prompt: "Do I feel able to express a range of emotions and ask for support in a way that feels safe for me?",
    context: "There is no single correct way to show emotion. Culture, disability, trauma, communication style, and personal preference matter.",
  },
};

export const protectiveCapacityDomainContent: Record<string, ProtectiveCapacityDomainContent> = {
  "child-safety": {
    summary: "Immediate safety, supervision, and workable responses to current concerns.",
    reflectionPrompt: "What is one practical safety step that is already working, and what still needs attention?",
    nextStep: "If a safety concern is current, contact a trusted safe person or local emergency support. For planned concerns, review the safety plan with the responsible professional.",
  },
  "protective-capacity": {
    summary: "Understanding needs, taking responsibility for actions, and keeping a child's needs in view.",
    reflectionPrompt: "What is one example of a need you understand more clearly now than before?",
    nextStep: "Choose one small action that shows the learning in practice, and ask for specific feedback about it.",
  },
  "insight-accountability": {
    summary: "Understanding concerns and their possible impact while staying open to questions and repair.",
    reflectionPrompt: "What feedback or question would help you understand the impact more clearly?",
    nextStep: "Write down one question for a support conversation. You can disagree with an interpretation and still explore what would help your child.",
  },
  "emotional-regulation": {
    summary: "Recognising stress, recovering safely, and using strategies during difficult moments.",
    reflectionPrompt: "Which early sign tells you stress is rising, and what helps you pause safely?",
    nextStep: "Practise one short strategy when things are calm, and identify who you can contact if it is not enough.",
  },
  "parenting-skills": {
    summary: "Using developmentally responsive, nurturing skills and following a child's cues.",
    reflectionPrompt: "Which interaction with your child felt connected or respectful recently?",
    nextStep: "Choose one skill to practise during an agreed interaction. Keep the child's comfort and boundaries at the centre.",
  },
  "environmental-stability": {
    summary: "Meeting practical daily needs while identifying barriers and useful supports.",
    reflectionPrompt: "Which practical need feels steady, and which would benefit from help or a backup plan?",
    nextStep: "Name the barrier plainly and identify a suitable service, trusted person, or practical support to discuss.",
  },
  "parenting-routines": {
    summary: "Creating dependable routines and preparing for changes without expecting perfection.",
    reflectionPrompt: "Which routine helps your child feel prepared? What is the backup when it changes?",
    nextStep: "Try one simple, child-appropriate cue or backup plan and notice whether it makes the day easier.",
  },
  "service-engagement": {
    summary: "Making support accessible, communicating barriers, and understanding provider guidance.",
    reflectionPrompt: "What would make the next support step easier to attend or understand?",
    nextStep: "Ask the provider to confirm the purpose, options, and how to reschedule or raise an access barrier.",
  },
  "child-voice": {
    summary: "Listening to a child's expressed needs without pressure or adult-role responsibilities.",
    reflectionPrompt: "How can the child's preferences be heard safely by the right adult?",
    nextStep: "Do not ask a child to reassure you or choose sides. Ask the responsible professional how their voice can be included safely.",
  },
  "evidence-consistency": {
    summary: "Understanding what information is available, what is missing, and where accounts need careful discussion.",
    reflectionPrompt: "What do you know directly, what comes from another source, and what remains uncertain?",
    nextStep: "Keep observations, reports, and interpretations separate. Ask for clarification where sources differ.",
    caution: "Conflicting information is not proof of deception. Consider context, access, language, memory, disability, culture, and trauma.",
  },
  "anti-gaming": {
    summary: "Reflecting on whether helpful actions are practical, sustainable, and supported across settings.",
    reflectionPrompt: "Which helpful action feels sustainable outside a formal session, and what support would make it easier?",
    nextStep: "Describe concrete examples and barriers. Do not use differences in speech, emotion, or presentation as a proxy for honesty.",
    caution: "This domain cannot detect deception or 'gaming'. Emotional style and communication vary across people and contexts.",
  },
};

export const protectiveCapacityResponseAnchors = [
  { score: 0, label: "Not in place yet" },
  { score: 1, label: "Rarely or only with substantial support" },
  { score: 2, label: "Sometimes; still developing" },
  { score: 3, label: "Often; usually manageable" },
  { score: 4, label: "Consistently across recent situations" },
] as const;

export const protectiveCapacityContentLimitations = [
  "This is an unvalidated self-reflection prototype, not a clinical or statutory assessment.",
  "It does not measure parenting capacity, determine truthfulness, or establish that a child is safe or ready for reunification.",
  "Answers and results stay in screen memory only and are not saved or shared.",
  "A score, missing answer, or review flag must never be used alone to make a contact, placement, legal, or reunification decision.",
];
