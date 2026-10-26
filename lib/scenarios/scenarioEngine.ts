export type DifficultyLevel = "L1" | "L2" | "L3";

export type ScenarioChoice = {
  id: string;
  text: string;
  category: "calm_pause" | "empathic_boundary" | "reactive_criticism" | "avoidant_dismissal" | "collaborative_repair";
  deEscalationPoints: number; // -10 to +10
  emotionalRegulationPoints: number; // -10 to +10
  connectionImpactPoints: number; // -10 to +10
  immediateFeedback: string;
  coachingTip: string;
  nextStepId?: string;
};

export type ScenarioStep = {
  id: string;
  speaker: "Child" | "Parent" | "Caseworker" | "Narrator";
  dialogue: string;
  contextCue: string;
  choices: ScenarioChoice[];
};

export type RoleplayScenario = {
  id: string;
  title: string;
  category: "emotional_regulation" | "boundary_setting" | "caseworker_engagement" | "reconnection_repair" | "substance_trigger_management";
  difficulty: DifficultyLevel;
  difficultyLabel: "Foundational" | "Developing" | "Advanced";
  estimatedMinutes: number;
  initialPrompt: string;
  steps: Record<string, ScenarioStep>;
  initialStepId: string;
  learningObjectives: string[];
};

export type ScenarioRunResult = {
  scenarioId: string;
  totalStepsTaken: number;
  deEscalationScore: number; // 0-100
  emotionalRegulationScore: number; // 0-100
  connectionScore: number; // 0-100
  overallProficiency: "Emerging" | "Developing" | "Demonstrated" | "Sustained Under Stress";
  feedbackSummary: string[];
  recommendations: string[];
  timestamp: string;
};

export const BUILTIN_SCENARIOS: RoleplayScenario[] = [
  {
    id: "SCN-001",
    title: "De-escalating a Sensory Bedtime Meltdown",
    category: "emotional_regulation",
    difficulty: "L1",
    difficultyLabel: "Foundational",
    estimatedMinutes: 5,
    initialPrompt: "It's 8:00 PM. Your 6-year-old child screams and throws shoes when told screen time is over.",
    learningObjectives: [
      "Use pause-and-breathe before speaking",
      "Validate child frustration without conceding safety boundaries",
      "Co-regulate through physical calm and low vocal pitch",
    ],
    initialStepId: "step_start",
    steps: {
      step_start: {
        id: "step_start",
        speaker: "Child",
        dialogue: "I hate you! You always ruin everything! I'm NOT going to sleep, I'm watching this!",
        contextCue: "Your heart starts racing. You've had a long exhausting day and feel the urge to yell.",
        choices: [
          {
            id: "c1_pause",
            text: "Take a slow deep breath, lower to eye level: 'I hear how angry you are that screen time is finished.'",
            category: "calm_pause",
            deEscalationPoints: 10,
            emotionalRegulationPoints: 10,
            connectionImpactPoints: 9,
            immediateFeedback: "You stayed physically calm and acknowledged their emotion without yelling.",
            coachingTip: "Validating feelings before enforcing limits reduces amygdala alarm in the child.",
            nextStepId: "step_continuation",
          },
          {
            id: "c1_react",
            text: "Raise your voice: 'Do NOT speak to me like that! Give me that tablet right now or no screens all weekend!'",
            category: "reactive_criticism",
            deEscalationPoints: -8,
            emotionalRegulationPoints: -9,
            connectionImpactPoints: -8,
            immediateFeedback: "The child screams louder and curls into a corner, throwing toys.",
            coachingTip: "Reactive criticism signals threat, prompting a fight-or-flight spiral.",
            nextStepId: "step_escalated",
          },
          {
            id: "c1_give_in",
            text: "Sigh and say: 'Fine, ten more minutes, but then you promise to go to bed.'",
            category: "avoidant_dismissal",
            deEscalationPoints: 2,
            emotionalRegulationPoints: -3,
            connectionImpactPoints: -4,
            immediateFeedback: "Quiet returns briefly, but the child learns that explosive outbursts delay boundaries.",
            coachingTip: "Inconsistent limits increase future boundary testing and anxiety.",
            nextStepId: "step_finish",
          },
        ],
      },
      step_continuation: {
        id: "step_continuation",
        speaker: "Child",
        dialogue: "It's not fair! Everyone else gets to stay up! (Sobs, breathing heavily)",
        contextCue: "The child is moving from anger into sad distress.",
        choices: [
          {
            id: "c2_connect",
            text: "'It is hard when fun ends. Let's do three bunny breaths together and pick our bedtime book.'",
            category: "collaborative_repair",
            deEscalationPoints: 10,
            emotionalRegulationPoints: 9,
            connectionImpactPoints: 10,
            immediateFeedback: "The child sits down beside you and takes an uneven breath, starting to settle.",
            coachingTip: "Offering an engaging, structured transition activity restores emotional security.",
            nextStepId: "step_finish",
          },
          {
            id: "c2_lecture",
            text: "'You know good and well your friends don't stay up late. Stop crying and get your pyjamas on.'",
            category: "avoidant_dismissal",
            deEscalationPoints: -4,
            emotionalRegulationPoints: 0,
            connectionImpactPoints: -5,
            immediateFeedback: "The child shuts down and crosses their arms rigidly.",
            coachingTip: "Rational lectures during emotional vulnerability stall regulation.",
            nextStepId: "step_finish",
          },
        ],
      },
      step_escalated: {
        id: "step_escalated",
        speaker: "Narrator",
        dialogue: "The room is tense. Both you and your child are breathing hard and heart rates are elevated.",
        contextCue: "Opportunity for parental reset and repair.",
        choices: [
          {
            id: "c_repair",
            text: "Pause. Put hands on chest: 'I'm sorry I raised my voice. I was frustrated. Let's reset together.'",
            category: "collaborative_repair",
            deEscalationPoints: 8,
            emotionalRegulationPoints: 8,
            connectionImpactPoints: 9,
            immediateFeedback: "Parental repair immediately de-escalates shame and models emotional accountability.",
            coachingTip: "Repairing in real time is one of the highest predictors of secure attachment.",
            nextStepId: "step_finish",
          },
        ],
      },
      step_finish: {
        id: "step_finish",
        speaker: "Narrator",
        dialogue: "Scenario complete. Transition to review and reflection.",
        contextCue: "Ready for evaluation.",
        choices: [],
      },
    },
  },
  {
    id: "SCN-002",
    title: "Navigating an Unannounced Caseworker Home Visit",
    category: "caseworker_engagement",
    difficulty: "L2",
    difficultyLabel: "Developing",
    estimatedMinutes: 6,
    initialPrompt: "A child safety caseworker arrives unannounced at 4:30 PM while you are cooking dinner and toys are out.",
    learningObjectives: [
      "Manage natural anxiety and defensive threat spikes",
      "Demonstrate transparent, professional collaboration",
      "Acknowledge normal household routines while keeping safety focused",
    ],
    initialStepId: "step_cw_start",
    steps: {
      step_cw_start: {
        id: "step_cw_start",
        speaker: "Caseworker",
        dialogue: "Hi Sarah, sorry to drop in without calling. I was in the area and wanted to do a routine check.",
        contextCue: "You feel vulnerable, judged, and immediately defensive.",
        choices: [
          {
            id: "c_cw_calm",
            text: "Take a calming breath: 'Hello Mark, come in. We're in the middle of dinner prep, so the lounge has toys out, but you are welcome in.'",
            category: "calm_pause",
            deEscalationPoints: 9,
            emotionalRegulationPoints: 10,
            connectionImpactPoints: 8,
            immediateFeedback: "Caseworker notes your cooperative, relaxed attitude and transparency.",
            coachingTip: "A lived-in home is normal; caseworkers focus on parent openness, supervision, and safety awareness.",
            nextStepId: "step_cw_kitchen",
          },
          {
            id: "c_cw_defensive",
            text: "Stand in doorway: 'Why are you checking on me again? You never give notice and it feels like harassment!'",
            category: "reactive_criticism",
            deEscalationPoints: -7,
            emotionalRegulationPoints: -8,
            connectionImpactPoints: -7,
            immediateFeedback: "Caseworker steps back and records confrontational resistance in case notes.",
            coachingTip: "Defensiveness is often recorded in case notes as non-compliance, even if provoked.",
            nextStepId: "step_cw_finish",
          },
        ],
      },
      step_cw_kitchen: {
        id: "step_cw_kitchen",
        speaker: "Caseworker",
        dialogue: "Thank you. How has the morning routine been tracking since our last case plan conference?",
        contextCue: "Caseworker looks at the kitchen visual routine board.",
        choices: [
          {
            id: "c_cw_evidence",
            text: "'We had two rough mornings with bus timing, but the visual chore board is helping us get out on time.'",
            category: "collaborative_repair",
            deEscalationPoints: 10,
            emotionalRegulationPoints: 9,
            connectionImpactPoints: 9,
            immediateFeedback: "Demonstrates authentic honesty and active application of parenting tools.",
            coachingTip: "Owning minor difficulties while highlighting proactive solutions builds caseworker trust.",
            nextStepId: "step_cw_finish",
          },
        ],
      },
      step_cw_finish: {
        id: "step_cw_finish",
        speaker: "Narrator",
        dialogue: "Scenario completed. Feedback computed.",
        contextCue: "Session review.",
        choices: [],
      },
    },
  },
];

export function evaluateScenarioSession(
  scenario: RoleplayScenario,
  selectedChoices: ScenarioChoice[]
): ScenarioRunResult {
  let deEscalationTotal = 0;
  let emotionalRegTotal = 0;
  let connectionTotal = 0;

  const maxPoints = Math.max(1, selectedChoices.length * 10);
  const feedbackSummary: string[] = [];
  const recommendations: string[] = [];

  for (const choice of selectedChoices) {
    deEscalationTotal += choice.deEscalationPoints;
    emotionalRegTotal += choice.emotionalRegulationPoints;
    connectionTotal += choice.connectionImpactPoints;

    feedbackSummary.push(choice.immediateFeedback);
    if (choice.category === "reactive_criticism" || choice.category === "avoidant_dismissal") {
      recommendations.push(choice.coachingTip);
    }
  }

  const normalize = (pts: number) => {
    const raw = ((pts + maxPoints) / (maxPoints * 2)) * 100;
    return Math.min(100, Math.max(0, Math.round(raw)));
  };

  const deEscalationScore = normalize(deEscalationTotal);
  const emotionalRegulationScore = normalize(emotionalRegTotal);
  const connectionScore = normalize(connectionTotal);
  const composite = (deEscalationScore + emotionalRegulationScore + connectionScore) / 3;

  let overallProficiency: ScenarioRunResult["overallProficiency"] = "Emerging";
  if (composite >= 85) overallProficiency = "Sustained Under Stress";
  else if (composite >= 70) overallProficiency = "Demonstrated";
  else if (composite >= 50) overallProficiency = "Developing";

  if (recommendations.length === 0) {
    recommendations.push("Consistently high emotional regulation and de-escalation demonstrated under simulated pressure.");
  }

  return {
    scenarioId: scenario.id,
    totalStepsTaken: selectedChoices.length,
    deEscalationScore,
    emotionalRegulationScore,
    connectionScore,
    overallProficiency,
    feedbackSummary,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}
