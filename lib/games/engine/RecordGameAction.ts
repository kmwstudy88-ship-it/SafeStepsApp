import { enforceChildSafety } from "./ChildSafetyEnforcer";
import { sendEvidence } from "./EvidenceClient";
import type { SafeStepsEvidenceRecord } from "./EvidenceModel";
import { applyPrivacy, ShareSetting } from "./PrivacyManager";

export type GameActionSession = {
  sessionId: string;
  privacy: ShareSetting;
  childSafetyMode: boolean;
};

export type GameActionGame = {
  id: string;
};

export function recordGameAction(
  session: GameActionSession,
  game: GameActionGame,
  round: number,
  playerId: string,
  actionType: string,
  actionData: unknown,
  shareSetting: ShareSetting = session.privacy,
) {
  const safeData = enforceChildSafety(session, actionData);
  const record = applyPrivacy<SafeStepsEvidenceRecord>(
    {
      sessionId: session.sessionId,
      gameId: game.id,
      round,
      playerId,
      actionType,
      actionData: safeData,
      timestamp: Date.now(),
      privacy: session.privacy,
      childSafetyMode: session.childSafetyMode,
    },
    session.privacy,
    shareSetting,
  );

  return sendEvidence(record);
}
