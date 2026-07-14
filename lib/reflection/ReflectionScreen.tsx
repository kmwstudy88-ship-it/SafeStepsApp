import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import ContactVisitMode, { ContactVisitShareMode } from "../contactVisit/ContactVisitMode";

type ReflectionScreenProps = {
  onSubmit: (text: string, shareSetting: ContactVisitShareMode) => void;
};

export default function ReflectionScreen({ onSubmit }: ReflectionScreenProps) {
  const [text, setText] = useState("");
  const [shareSetting, setShareSetting] = useState<ContactVisitShareMode>("private");

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Take a moment to reflect</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Write your reflection here..."
        multiline
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 8,
          minHeight: 120,
          marginBottom: 20,
        }}
      />

      <ContactVisitMode onSelect={setShareSetting} />

      <Text style={{ marginTop: 10, color: "#B7791F" }}>Unsafe words are softened before shared review.</Text>

      <TouchableOpacity
        onPress={() => onSubmit(text, shareSetting)}
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: "#2F7D5C",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "800" }}>Submit Reflection</Text>
      </TouchableOpacity>
    </View>
  );
}
