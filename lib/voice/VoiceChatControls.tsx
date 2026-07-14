import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type VoiceChatControlsProps = {
  onToggle: (enabled: boolean) => void | Promise<void>;
  disabled?: boolean;
  label?: string;
};

export default function VoiceChatControls({ onToggle, disabled = false, label = "Voice chat" }: VoiceChatControlsProps) {
  const [enabled, setEnabled] = useState(false);

  async function toggle() {
    if (disabled) return;

    const newState = !enabled;
    setEnabled(newState);
    await onToggle(newState);
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: "#173B45", fontSize: 14, fontWeight: "800", marginBottom: 8 }}>{label}</Text>
      <TouchableOpacity
        disabled={disabled}
        onPress={toggle}
        style={{
          padding: 16,
          backgroundColor: disabled ? "#9AA7A7" : enabled ? "#B13F38" : "#2F7D5C",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "900" }}>
          {enabled ? "Mute Voice Chat" : "Enable Voice Chat"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
