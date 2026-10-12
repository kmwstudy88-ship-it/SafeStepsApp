export type SafeStepsGameCategory = "strengths" | "feelings" | "cooperation" | "memory" | string;

export type SafeStepsGameLogicInput = {
  id?: string;
  category?: SafeStepsGameCategory;
};

export type SafeStepsGameAction = {
  type: string;
  payload?: unknown;
};

export function runGameLogic(game: SafeStepsGameLogicInput, action: SafeStepsGameAction, playerId: string) {
  switch (game.category) {
    case "strengths":
      return { result: `${playerId} shared a strength.`, evidenceType: "strength_share", action };
    case "feelings":
      return { result: `${playerId} expressed a feeling.`, evidenceType: "feeling_share", action };
    case "cooperation":
      return { result: `${playerId} completed a cooperative task.`, evidenceType: "cooperation_task", action };
    case "memory":
      return { result: `${playerId} shared a memory.`, evidenceType: "memory_share", action };
    default:
      return { result: `${playerId} performed an action.`, evidenceType: "game_action", action };
  }
}
