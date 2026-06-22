import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AssessmentsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Assessments</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
});
