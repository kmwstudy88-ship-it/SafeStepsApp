import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function login() {
  return (
    <View style={styles.container}>
      <Text>login screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
