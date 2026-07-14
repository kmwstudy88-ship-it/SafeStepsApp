import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { onMessage, sendMessage } from "../engine/GameSocketClient";

type LobbyPlayer = {
  id?: string;
  playerId?: string;
  name: string;
  ready?: boolean;
};

type LobbyScreenProps = {
  roomCode: string;
  playerId: string;
};

type RoomUpdateMessage = {
  type: string;
  players?: LobbyPlayer[];
};

export default function LobbyScreen({ roomCode, playerId }: LobbyScreenProps) {
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);

  useEffect(() => {
    sendMessage({
      type: "JOIN_ROOM",
      roomCode,
      playerId,
      name: `Player ${playerId}`,
    });

    onMessage((data: RoomUpdateMessage) => {
      if (data.type === "ROOM_UPDATE") {
        setPlayers(data.players ?? []);
      }
    });
  }, [playerId, roomCode]);

  const startGame = () => {
    sendMessage({
      type: "START_GAME",
      roomCode,
      gameId: "game_31",
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Room Code: {roomCode}</Text>

      <Text style={{ marginTop: 20 }}>Players:</Text>
      {players.map((player, index) => (
        <Text key={player.id ?? player.playerId ?? `${player.name}-${index}`}>
          {player.name} - {player.ready ? "READY" : "NOT READY"}
        </Text>
      ))}

      <TouchableOpacity onPress={startGame} style={{ marginTop: 20, padding: 12, backgroundColor: "#2F7D5C" }}>
        <Text style={{ color: "#fff" }}>Start game</Text>
      </TouchableOpacity>
    </View>
  );
}
