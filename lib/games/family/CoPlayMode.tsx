import React from "react";
import { Text, View } from "react-native";

export type CoPlayPerson = {
  id: string;
  name: string;
};

export type CoPlayModeProps = {
  parent: CoPlayPerson;
  child: CoPlayPerson;
};

export default function CoPlayMode({ parent, child }: CoPlayModeProps) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: "#173B45", fontSize: 22, fontWeight: "900" }}>Parent-Child Co-Play Mode</Text>
      <Text style={{ color: "#284B54", marginTop: 10 }}>Parent: {parent.name}</Text>
      <Text style={{ color: "#284B54" }}>Child: {child.name}</Text>
      <Text style={{ color: "#284B54", marginTop: 20 }}>
        Take turns, reflect together, and keep privacy settings visible before evidence is shared.
      </Text>
    </View>
  );
}
