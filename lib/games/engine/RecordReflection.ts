import { sendReflection } from "../../../lib/reflection/ReflectionClient";
import { filterChildSafety } from "./ChildSafetyFilter";
import { applyPrivacy, ShareSetting } from "./PrivacyManager";

export type ReflectionSession = {
  sessionId: string;
  privacy: ShareSetting;
};

export type ReflectionGame = {
  id: string;
};

export type GameReflectionRecord = {
  sessionId: string;
  playerId: string;
  gameId: string;
  text: string;
  shareSetting: ShareSetting;
  hiddenFromWorker: boolean;
  privacy?: ShareSetting;
  timestamp: number;
};

export function recordReflection(
  session: ReflectionSession,
  game: ReflectionGame,
  playerId: string,
  text: string,
  shareSetting: ShareSetting = session.privacy,
) {
  const reflection = applyPrivacy<GameReflectionRecord>(
    {
      sessionId: session.sessionId,
      playerId,
      gameId: game.id,
      text: filterChildSafety(text),
      shareSetting,
      hiddenFromWorker: false,
      timestamp: Date.now(),
    },
    session.privacy,
    shareSetting,
  );

  return sendReflection(reflection);
}
