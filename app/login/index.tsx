import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles";

export default function Login() {
  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 20,
          borderRadius: 6,
        }}
      />

      <TouchableOpacity
        style={{
          backgroundColor: "#007AFF",
          padding: 14,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
