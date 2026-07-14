import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type ContactVisitShareMode = "private" | "family" | "worker";

type ContactVisitModeProps = {
  onSelect: (mode: ContactVisitShareMode) => void;
};

const options: { key: ContactVisitShareMode; label: string }[] = [
  { key: "private", label: "Private" },
  { key: "family", label: "Share with family" },
  { key: "worker", label: "Share with worker" },
];

export default function ContactVisitMode({ onSelect }: ContactVisitModeProps) {
  const [selected, setSelected] = useState<ContactVisitShareMode>("private");

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Choose who can see your answer</Text>

      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          onPress={() => {
            setSelected(option.key);
            onSelect(option.key);
          }}
          style={{
            padding: 16,
            marginBottom: 12,
            borderRadius: 8,
            backgroundColor: selected === option.key ? "#2F7D5C" : "#E7E3D9",
          }}
        >
          <Text style={{ color: selected === option.key ? "#fff" : "#173B45", fontWeight: "800" }}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
