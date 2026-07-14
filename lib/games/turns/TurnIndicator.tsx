import React from "react";
import { Text, View } from "react-native";

type TurnIndicatorPlayer = {
  name: string;
};

type TurnIndicatorProps = {
  currentPlayer: TurnIndicatorPlayer;
};

export default function TurnIndicator({ currentPlayer }: TurnIndicatorProps) {
  return (
    <View style={{ padding: 12, backgroundColor: "#F7E7C2", borderRadius: 8 }}>
      <Text style={{ color: "#173B45", fontSize: 18, fontWeight: "800" }}>
        {`It is ${currentPlayer.name}'s turn`}
      </Text>
    </View>
  );
}
