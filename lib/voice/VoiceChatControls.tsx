import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type VoiceChatControlsProps = {
  onToggle: (enabled: boolean) => void | Promise<void>;
  disabled?: boolean;
  label?: string;
  safetyNotice?: string;
};

export default function VoiceChatControls({
  onToggle,
  disabled = false,
  label = "Voice chat",
  safetyNotice,
}: VoiceChatControlsProps) {
  const [enabled, setEnabled] = useState(false);
  const [breathingGuideActive, setBreathingGuideActive] = useState(false);

  async function toggle() {
    if (disabled) return;

    const newState = !enabled;
    setEnabled(newState);
    await onToggle(newState);
  }

  return (
    <View style={{ padding: 12, backgroundColor: "#F3F8F6", borderRadius: 12, borderWidth: 1, borderColor: "#D5E5DF" }}>
      <Text style={{ color: "#173B45", fontSize: 14, fontWeight: "800", marginBottom: 6 }}>{label}</Text>
      {safetyNotice ? (
        <Text style={{ color: "#43616A", fontSize: 12, marginBottom: 8 }}>{safetyNotice}</Text>
      ) : null}
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <TouchableOpacity
          disabled={disabled}
          onPress={toggle}
          style={{
            flex: 1,
            minWidth: 150,
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: disabled ? "#9AA7A7" : enabled ? "#B13F38" : "#2F7D5C",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "900", fontSize: 13 }}>
            {enabled ? "Mute Voice Coach" : "Enable Voice Coach"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setBreathingGuideActive((prev) => !prev)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: breathingGuideActive ? "#173B45" : "#E3EFEA",
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: breathingGuideActive ? "#FFFFFF" : "#173B45",
              textAlign: "center",
              fontWeight: "800",
              fontSize: 13,
            }}
          >
            {breathingGuideActive ? "4s In / 6s Out Active" : "60s Breathing Audio"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
