import React from "react";
import { Switch, Text, View } from "react-native";

type ChildSafetyToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export default function ChildSafetyToggle({ enabled, onChange }: ChildSafetyToggleProps) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Child Safety Mode</Text>
      <Switch value={enabled} onValueChange={onChange} />
      <Text style={{ marginTop: 10 }}>
        {enabled
          ? "Child Safety Mode is on. Unsafe content is softened before it appears in shared spaces."
          : "Child Safety Mode is off for this view."}
      </Text>
    </View>
  );
}
