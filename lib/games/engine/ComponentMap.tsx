import React from "react";
import { Text, View } from "react-native";

import { SafeStepsGames } from "./GameRegistry";

type SafeStepsGame = (typeof SafeStepsGames)[number];

type GameComponentProps = {
  game: SafeStepsGame;
};

function DraftGameFallback({ game }: GameComponentProps) {
  return (
    <View style={{ gap: 10, padding: 20 }}>
      <Text style={{ color: "#173B45", fontSize: 22, fontWeight: "900" }}>{game.title}</Text>
      <Text style={{ color: "#45636B", fontSize: 15, lineHeight: 22 }}>
        This family game is registered in SafeSteps, but its generated play screen is still under production
        review.
      </Text>
      <Text style={{ color: "#45636B", fontSize: 15, lineHeight: 22 }}>
        Use the family lobby, game calendar, and session evidence tools until this specific game is promoted
        from draft to launch-ready.
      </Text>
    </View>
  );
}

export const ComponentMap = Object.fromEntries(
  SafeStepsGames.map((game) => [game.id, DraftGameFallback]),
) as Record<string, React.ComponentType<GameComponentProps>>;
