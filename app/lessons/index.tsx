import React from "react";
import { View, Text } from "react-native";
import { globalStyles } from "../../lib/styles";

export default function LessonsScreen() {
  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Lessons</Text>
    </View>
  );
}
