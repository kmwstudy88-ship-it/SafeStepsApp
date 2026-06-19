import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { globalStyles } from "../styles";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={globalStyles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={globalStyles.input}
      />

      <TouchableOpacity
        onPress={() => router.replace("/programs")}
        style={globalStyles.button}
      >
        <Text style={globalStyles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={globalStyles.link}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}
