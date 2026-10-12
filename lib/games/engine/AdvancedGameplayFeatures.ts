export type EmotionalState = "calm" | "focused" | "unsure" | "frustrated" | "overwhelmed";

export type DifficultyLevel = "gentle" | "standard" | "stretch";

export type GameModifier = "quiet_mode" | "fast_mode" | "cooperative_mode" | "low_stim_mode" | "high_contrast";

export type WorkerVisibility = "hidden" | "summary_only" | "live_supported";

export type GameplayPlayerContext = {
  childAge: number;
  emotionalState: EmotionalState;
  readingLevel?: "early" | "developing" | "confident";
  modifiers?: GameModifier[];
};

export type MiniQuestStep = {
  id: string;
  label: string;
  completed: boolean;
};

export type ProgressiveStoryState = {
  storyId: string;
  chapter: number;
  branchKey: string;
  lastChoice?: string;
};

export type GameplayAchievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export type TherapeuticPrompt = {
  type:
    | "emotion_label"
    | "strength_spotting"
    | "coping_strategy"
    | "parent_skill"
    | "worker_guidance"
    | "attachment_task"
    | "reflective_loop";
  prompt: string;
  targetRole: "child" | "parent" | "worker" | "family";
};

export type GameplaySafetyResult = {
  safeText: string;
  replacements: string[];
  cooldownPrompt?: string;
  safetyScore: number;
};

export type ReplaySummary = {
  gameId: string;
  gameTitle: string;
  lastPlayedAt?: string;
  summary: string;
  nextSuggestion: string;
};

export type WorkerSessionEvent = {
  id: string;
  timestamp: string;
  type: "nudge" | "pause" | "reflection" | "evidence_tag" | "visibility_change";
  message: string;
  visibility: WorkerVisibility;
};

export type GameFeatureConfig = {
  adaptiveDifficulty: boolean;
  timedChallenges: boolean;
  miniQuests: MiniQuestStep[];
  achievements: GameplayAchievement[];
  story: ProgressiveStoryState;
  modifiers: GameModifier[];
  workerVisibility: WorkerVisibility;
};

const restrictedTerms = ["violence", "self-harm", "drug", "abuse", "sex"];

export function getAdaptiveDifficulty(context: GameplayPlayerContext): DifficultyLevel {
  if (context.emotionalState === "overwhelmed" || context.emotionalState === "frustrated" || context.childAge < 8) {
    return "gentle";
  }

  if (context.childAge >= 12 && context.emotionalState === "focused") {
    return "stretch";
  }

  return "standard";
}

export function getGentleTimerSeconds(difficulty: DifficultyLevel, modifiers: GameModifier[] = []) {
  if (modifiers.includes("quiet_mode") || modifiers.includes("low_stim_mode")) {
    return 120;
  }

  if (modifiers.includes("fast_mode")) {
    return 30;
  }

  return difficulty === "gentle" ? 90 : difficulty === "stretch" ? 45 : 60;
}

export function getTherapeuticPrompts(context: GameplayPlayerContext): TherapeuticPrompt[] {
  const copingPrompt =
    context.emotionalState === "overwhelmed"
      ? "Pause and take three slow breaths. What would help your body feel safer right now?"
      : "What feeling did this remind you of?";

  return [
    { type: "emotion_label", targetRole: "child", prompt: "What feeling did this remind you of?" },
    { type: "strength_spotting", targetRole: "family", prompt: "What strength did someone use during this turn?" },
    { type: "coping_strategy", targetRole: "child", prompt: copingPrompt },
    { type: "parent_skill", targetRole: "parent", prompt: "Name one thing your child did well before giving advice." },
    { type: "worker_guidance", targetRole: "worker", prompt: "Look for attunement, validation, and repair attempts." },
    { type: "attachment_task", targetRole: "family", prompt: "Share one memory that connects to this choice." },
    { type: "reflective_loop", targetRole: "family", prompt: "Child shares first, parent reflects back, worker records support needs." },
  ];
}

export function buildDefaultFeatureConfig(context: GameplayPlayerContext): GameFeatureConfig {
  const difficulty = getAdaptiveDifficulty(context);

  return {
    adaptiveDifficulty: true,
    timedChallenges: true,
    miniQuests: [
      { id: "notice", label: "Notice the feeling", completed: false },
      { id: "choose", label: "Choose a safe response", completed: false },
      { id: "reflect", label: "Share one reflection", completed: false },
    ],
    achievements: [
      {
        id: "active-listener",
        title: "Active Listener",
        description: "Waited, listened, and responded kindly.",
        unlocked: false,
      },
      {
        id: "brave-choice",
        title: "Brave Choice",
        description: "Named a feeling or need during play.",
        unlocked: false,
      },
    ],
    story: {
      storyId: "safesteps-family-journey",
      chapter: difficulty === "stretch" ? 2 : 1,
      branchKey: "shared-goals",
    },
    modifiers: context.modifiers ?? [],
    workerVisibility: "summary_only",
  };
}

export function applyChoiceBranch(story: ProgressiveStoryState, choiceId: string): ProgressiveStoryState {
  return {
    ...story,
    chapter: story.chapter + 1,
    branchKey: choiceId,
    lastChoice: choiceId,
  };
}

export function completeMiniQuestStep(steps: MiniQuestStep[], stepId: string): MiniQuestStep[] {
  return steps.map((step) => (step.id === stepId ? { ...step, completed: true } : step));
}

export function unlockAchievements(achievements: GameplayAchievement[], events: string[]): GameplayAchievement[] {
  return achievements.map((achievement) => {
    if (achievement.id === "active-listener" && events.includes("validation_shared")) {
      return { ...achievement, unlocked: true };
    }

    if (achievement.id === "brave-choice" && events.includes("emotion_named")) {
      return { ...achievement, unlocked: true };
    }

    return achievement;
  });
}

export function moderateGameplayText(text: string): GameplaySafetyResult {
  const replacements: string[] = [];
  let safeText = text;

  restrictedTerms.forEach((term) => {
    const expression = new RegExp(term, "gi");
    if (expression.test(safeText)) {
      replacements.push(term);
      safeText = safeText.replace(expression, "safe topic");
    }
  });

  return {
    safeText,
    replacements,
    cooldownPrompt: replacements.length > 0 ? "Let's pause and choose safer words before continuing." : undefined,
    safetyScore: Math.max(0, 100 - replacements.length * 20),
  };
}

export function buildReplaySummary(input: {
  gameId: string;
  gameTitle: string;
  lastPlayedAt?: string;
  completedSteps: number;
  unlockedAchievements: number;
}): ReplaySummary {
  return {
    gameId: input.gameId,
    gameTitle: input.gameTitle,
    lastPlayedAt: input.lastPlayedAt,
    summary: `Last time, your family completed ${input.completedSteps} steps and unlocked ${input.unlockedAchievements} achievements.`,
    nextSuggestion: input.completedSteps === 0 ? "Start with a gentle practice round." : "Continue the story from the last choice.",
  };
}

export function createWorkerSessionEvent(input: Omit<WorkerSessionEvent, "id" | "timestamp">): WorkerSessionEvent {
  return {
    id: `worker-event-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...input,
  };
}

export function getAccessibilityModifiers(input: {
  highContrast?: boolean;
  lowStim?: boolean;
  simplifiedUi?: boolean;
  motorFriendly?: boolean;
}) {
  return {
    modifiers: [
      input.highContrast ? "high_contrast" : null,
      input.lowStim ? "low_stim_mode" : null,
    ].filter(Boolean) as GameModifier[],
    simplifiedUi: input.simplifiedUi ?? false,
    motorFriendly: input.motorFriendly ?? false,
    readingSupport: input.simplifiedUi ? "short_prompts" : "standard_prompts",
  };
}
