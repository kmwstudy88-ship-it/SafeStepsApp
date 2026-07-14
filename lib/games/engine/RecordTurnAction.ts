import { recordGameAction, GameActionGame, GameActionSession } from "./RecordGameAction";
import { ShareSetting } from "./PrivacyManager";

export function recordTurnAction(
  session: GameActionSession,
  game: GameActionGame,
  round: number,
  playerId: string,
  actionType: string,
  actionData: unknown,
  shareSetting: ShareSetting = session.privacy,
) {
  return recordGameAction(session, game, round, playerId, actionType, actionData, shareSetting);
}
