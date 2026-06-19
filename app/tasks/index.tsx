import React from "react";
import { View, Text } from "react-native";
import { globalStyles } from "../styles";

export default function TasksScreen() {
  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Tasks</Text>
    </View>
  );
}
