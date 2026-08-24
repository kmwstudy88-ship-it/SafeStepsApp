export type ChildAgeBand = "0_2" | "3_5" | "6_9" | "10_12" | "13_17";
export type ParentingMoment = "meltdown" | "homework" | "bedtime" | "screen_time" | "sibling_conflict" | "noncompliance" | "connection" | "repair";

export type ParentingCoachInput = {
  ageBand: ChildAgeBand;
  moment: ParentingMoment;
  parentCapacity: "steady" | "stretched" | "overwhelmed";
};

export type ParentingCoachPlan = {
  title: string;
  regulate: string;
  possibleNeeds: string[];
  steps: string[];
  sayThis: string;
  avoidThis: string;
  repair: string;
  professionalReview: string;
};

const momentNeeds: Record<ParentingMoment, string[]> = {
  meltdown: ["tiredness, hunger, pain, or sensory overload", "a transition that felt too fast", "skills that are still developing"],
  homework: ["task difficulty or fear of getting it wrong", "fatigue after holding things together all day", "a need for movement, choice, or a clearer first step"],
  bedtime: ["difficulty shifting from activity to rest", "connection-seeking after separation during the day", "an inconsistent cue, worry, discomfort, or unmet physical need"],
  screen_time: ["difficulty stopping a highly rewarding activity", "unclear expectations or inconsistent transitions", "connection, stimulation, or autonomy needs"],
  sibling_conflict: ["competition for space, attention, or a valued object", "different skills for waiting, negotiating, or reading social cues", "stress, fatigue, or a conflict that needs adult scaffolding"],
  noncompliance: ["a direction that is too broad, difficult, or poorly timed", "a need for autonomy within a firm boundary", "disconnection, overload, or uncertainty about the first step"],
  connection: ["a wish for privacy or independence", "fear of judgement or consequences", "stress that is hard to put into words"],
  repair: ["a need to feel safe before discussing the problem", "confusion about what happened", "reassurance that the relationship can recover after mistakes"],
};

const scripts: Record<ParentingMoment, { say: string; avoid: string }> = {
  meltdown: { say: "You’re having a hard time. I’m here. I won’t let anyone get hurt. We’ll talk when bodies are calmer.", avoid: "Stop it right now or I’ll give you something to cry about." },
  homework: { say: "This looks stuck. Do you want to start with one question together or take a five-minute movement break first?", avoid: "You’re lazy. This should be easy for you." },
  bedtime: { say: "It’s bedtime. Would you like the short story or the song after teeth?", avoid: "If you don’t sleep now, tomorrow will be your fault." },
  screen_time: { say: "Screen time is finished. You can switch it off, or I can help. Then you can choose music or drawing.", avoid: "You’re addicted to that thing." },
  sibling_conflict: { say: "I won’t let either of you hurt the other. We’ll pause, make space, and hear each person when bodies are safe.", avoid: "You’re the oldest, so this is your fault." },
  noncompliance: { say: "The job is getting dressed. Do you want to start with your shirt or your socks?", avoid: "Why do you never listen?" },
  connection: { say: "You don’t have to talk now. I care about you, and I’m available when you’re ready.", avoid: "Tell me what’s wrong right now." },
  repair: { say: "I yelled, and that wasn’t okay. It was my job to handle my feelings safely. I’m sorry. I’ll practise pausing next time.", avoid: "I’m sorry, but you made me lose it." },
};

function ageAdjustment(ageBand: ChildAgeBand) {
  if (ageBand === "0_2") return "Use very few words, co-regulate physically when welcomed, and meet the immediate care need.";
  if (ageBand === "3_5") return "Use one-step directions, visual cues, repetition, and two safe choices.";
  if (ageBand === "6_9") return "Break the task into a visible first step and invite the child to help choose the plan.";
  if (ageBand === "10_12") return "Agree on the limit and timing in advance, then offer meaningful input within that boundary.";
  return "Respect growing autonomy, keep the safety boundary clear, and choose a calmer time for collaborative problem-solving.";
}

export type ParentingSafetyResult = {
  safeForCoaching: boolean;
  matchedConcerns: string[];
  action: string;
};

const parentingSafetyRules = [
  { id: "CAREGIVER_MAY_HARM_CHILD", pattern: /\b(afraid|scared|worried).{0,35}\b(i('| a)?m|i am) (going to|might|could).{0,20}\b(hit|hurt|shake|kill)\b/i },
  { id: "CHILD_SELF_HARM", pattern: /\b(child|kid|son|daughter|teen).{0,50}\b(suicid(?:e|al)|self[- ]harm|kill (himself|herself|themself)|doesn'?t want to live)\b/i },
  { id: "SEXUAL_ABUSE", pattern: /\b(sexual abuse|molest(?:ed|ation)|rape|inappropriate touching)\b/i },
  { id: "SEVERE_AGGRESSION", pattern: /\b(child|kid|son|daughter|teen).{0,45}\b(weapon|knife|gun|strangl(?:e|ing|ed)|trying to kill)\b/i },
  { id: "MEDICAL_EMERGENCY", pattern: /\b(not breathing|unconscious|seizure|poisoned|overdose|serious bleeding)\b/i },
  { id: "EATING_DISORDER_CONCERN", pattern: /\b(not eating|refus(?:e|ing) food|purging|vomiting after eating|rapid weight loss)\b/i },
  { id: "DEVELOPMENTAL_REGRESSION", pattern: /\b(lost|losing|stopped using).{0,35}\b(words|speech|walking|toilet skills|skills)\b/i },
  { id: "ABUSE_OR_NEGLECT", pattern: /\b(abuse|neglect|physical punishment|locked (him|her|them) (in|out)|withhold food)\b/i },
];

export function assessParentingCoachSafety(message: string): ParentingSafetyResult {
  const normalized = message.normalize("NFKC").replace(/\s+/g, " ").trim();
  const matchedConcerns = parentingSafetyRules
    .filter((rule) => rule.pattern.test(normalized))
    .map((rule) => rule.id);
  return {
    safeForCoaching: matchedConcerns.length === 0,
    matchedConcerns,
    action: matchedConcerns.length
      ? "Stop ordinary coaching. Check immediate safety and connect with emergency or appropriately qualified human support."
      : "Everyday parenting coaching may continue with normal safety monitoring.",
  };
}

export function createParentingCoachPlan(input: ParentingCoachInput): ParentingCoachPlan {
  const capacityStep = input.parentCapacity === "overwhelmed"
    ? "If everyone is physically safe, step back for sixty seconds and contact another safe adult if you may lose control."
    : input.parentCapacity === "stretched"
      ? "Exhale slowly, drop your shoulders, and decide on the single boundary that matters most."
      : "Keep your voice low and your message short so your calm can support the moment.";

  return {
    title: input.moment === "repair" ? "Repair without shame or excuses" : "Connection first, then the limit",
    regulate: capacityStep,
    possibleNeeds: momentNeeds[input.moment],
    steps: [
      "Check immediate safety and basic needs before teaching or correcting.",
      ageAdjustment(input.ageBand),
      "Hold one clear boundary, offer a small safe choice, and notice the first sign of recovery or cooperation.",
    ],
    sayThis: scripts[input.moment].say,
    avoidThis: scripts[input.moment].avoid,
    repair: "Reconnect later: name what happened without blame, listen briefly, restate the boundary, and practise what to do next time.",
    professionalReview: "Seek qualified support when behaviour is new, severe, persistent, developmentally concerning, or affecting safety, sleep, school, relationships, or daily functioning.",
  };
}
