/**
 * SafeSteps Regulation & Scenario Simulation Engine
 *
 * Evaluates simulated caregiver choices across emotional regulation,
 * de-escalation, connection impact, and collaborative repair.
 *
 * Self-contained engine module for universal Node/data-URL/browser compatibility.
 * Decision-support only; educational simulation is not a clinical assessment.
 */

export type ScenarioChoiceCategory =
  | "calm_pause"
  | "empathic_boundary"
  | "reactive_criticism"
  | "avoidant_dismissal"
  | "collaborative_repair";

export type ScenarioChoice = {
  id: string;
  text: string;
  category: ScenarioChoiceCategory;
  deEscalationPoints: number; // -10 to +10
  emotionalRegulationPoints: number; // -10 to +10
  connectionImpactPoints: number; // -10 to +10
  immediateFeedback: string;
  coachingTip: string;
};

export type RoleplayScenario = {
  id: string;
  title: string;
  category: "emotional_regulation" | "boundary_setting" | "caseworker_engagement" | "reconnection_repair";
  difficulty: "L1" | "L2" | "L3";
  difficultyLabel: "Foundational" | "Developing" | "Advanced";
  estimatedMinutes: number;
  initialPrompt: string;
  learningObjectives: string[];
  choices: ScenarioChoice[];
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
  decisionSupportOnly: true;
  humanReviewRequired: true;
  educationalDisclaimer: string;
};

export type RegulationSimulationInput = {
  scenarioId: string;
  selectedChoices: ScenarioChoice[];
  participantRole?: "Parent" | "Carer" | "Professional";
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
    choices: [
      {
        id: "c1_pause",
        text: "Take a slow deep breath, lower to eye level: 'I hear how angry you are that screen time is finished.'",
        category: "calm_pause",
        deEscalationPoints: 10,
        emotionalRegulationPoints: 10,
        connectionImpactPoints: 9,
        immediateFeedback: "You stayed physically calm and acknowledged their emotion without yelling.",
        coachingTip: "Validating feelings before enforcing limits reduces emotional alarm in the child.",
      },
      {
        id: "c1_react",
        text: "Raise your voice: 'Do NOT speak to me like that! Give me that tablet right now!'",
        category: "reactive_criticism",
        deEscalationPoints: -8,
        emotionalRegulationPoints: -9,
        connectionImpactPoints: -8,
        immediateFeedback: "The child screams louder and curls into a corner.",
        coachingTip: "Reactive criticism signals threat, prompting a fight-or-flight spiral.",
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
      },
    ],
  },
];

export function evaluateRegulationSimulation(
  input: RegulationSimulationInput,
): ScenarioRunResult {
  const scenario = BUILTIN_SCENARIOS.find((s) => s.id === input.scenarioId) || BUILTIN_SCENARIOS[0];
  const selectedChoices = input.selectedChoices || [];

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
    recommendations: [...new Set(recommendations)],
    timestamp: new Date().toISOString(),
    decisionSupportOnly: true,
    humanReviewRequired: true,
    educationalDisclaimer:
      "Scenario simulation evaluates interactive choices in fictional practice modules. It does not replace clinical observation or live parent-child interaction assessments.",
  };
}
