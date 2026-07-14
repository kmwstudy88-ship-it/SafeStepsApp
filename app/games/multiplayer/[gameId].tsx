import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

import GameCard from "../../../lib/games/components/GameCard";
import { SafeStepsGames } from "../../../lib/games/engine/GameRegistry";

type SafeStepsGame = (typeof SafeStepsGames)[number];

function formatValue(value: string | number | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value == null ? "Not specified" : String(value);
}

export default function MultiplayerGameRoute() {
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();

  const game = useMemo<SafeStepsGame | undefined>(
    () => SafeStepsGames.find((candidate) => candidate.id === gameId),
    [gameId],
  );

  if (!game) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: "#F7FAF8" }}>
        <GameCard title="Game not found">
          <Text style={{ color: "#45636B", fontSize: 15, lineHeight: 22 }}>
            This SafeSteps game is not available in the current game registry.
          </Text>
        </GameCard>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#F7FAF8" }}>
      <GameCard title={game.title}>
        <View style={{ gap: 10 }}>
          <Text style={{ color: "#45636B", fontSize: 15, lineHeight: 22 }}>
            {game.objective}
          </Text>
          <Text style={{ color: "#173B45", fontSize: 14, fontWeight: "700" }}>
            Players: {game.minPlayers}-{game.maxPlayers}
          </Text>
          <Text style={{ color: "#173B45", fontSize: 14, fontWeight: "700" }}>
            Modes: {formatValue(game.supportedModes)}
          </Text>
          <Text style={{ color: "#173B45", fontSize: 14, fontWeight: "700" }}>
            Duration: {formatValue(game.duration)}
          </Text>
          <Text style={{ color: "#45636B", fontSize: 14, lineHeight: 20 }}>
            This game is in draft gameplay review while shared play, evidence capture, and child-safety flows are
            stabilised.
          </Text>
        </View>
      </GameCard>
    </View>
  );
}
