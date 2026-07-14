import React from "react";
import { Text, View } from "react-native";

import { ComponentMap } from "./ComponentMap";
import { SafeStepsGames } from "./GameRegistry";

type GameEngineProps = {
  gameId: string;
};

export default function GameEngine({ gameId }: GameEngineProps) {
  const game = SafeStepsGames.find((candidate) => candidate.id === gameId);

  if (!game) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Game not found: {gameId}</Text>
      </View>
    );
  }

  const Component = ComponentMap[gameId];

  if (!Component) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Game screen unavailable: {gameId}</Text>
      </View>
    );
  }

  return <Component game={game} />;
}
