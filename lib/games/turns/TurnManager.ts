import { sendMessage } from "../engine/GameSocketClient";

export type TurnManagerPlayer = {
  id: string;
  name: string;
};

export class TurnManager {
  private players: TurnManagerPlayer[];
  private index: number;

  constructor(players: TurnManagerPlayer[]) {
    this.players = players;
    this.index = 0;
  }

  getCurrentPlayer() {
    return this.players[this.index] ?? null;
  }

  nextTurn(roomCode: string) {
    if (this.players.length === 0) return null;

    this.index = (this.index + 1) % this.players.length;
    const currentPlayer = this.getCurrentPlayer();

    sendMessage({
      type: "TURN_UPDATE",
      roomCode,
      currentPlayer,
    });

    return currentPlayer;
  }
}
