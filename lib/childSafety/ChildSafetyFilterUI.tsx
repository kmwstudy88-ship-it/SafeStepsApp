import React from "react";
import { View, Text } from "react-native";

export default function ChildSafetyFilterUI() {
  return (
    <View style={{ padding: 12, backgroundColor: "#ffe0b2", borderRadius: 8 }}>
      <Text style={{ fontSize: 16 }}>
        Some content has been filtered for safety.
      </Text>
    </View>
  );
}
