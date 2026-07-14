import { onMessage } from "./GameSocketClient";

export type TurnPlayer = {
  id: string;
  name: string;
};

type TurnUpdateMessage = {
  type: string;
  currentPlayer?: TurnPlayer;
};

export function useTurnEngine(setCurrentPlayer: (player: TurnPlayer) => void) {
  onMessage((data: TurnUpdateMessage) => {
    if (data.type === "TURN_UPDATE" && data.currentPlayer) {
      setCurrentPlayer(data.currentPlayer);
    }
  });
}
