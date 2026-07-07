import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../navigation/types";

type NavProp = BottomTabNavigationProp<RootTabParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafeSteps Home</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ParentProfile")}
      >
        <Text style={styles.buttonText}>Parent Identity & Background</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Curriculum")}
      >
        <Text style={styles.buttonText}>Curriculum Engine</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("UploadDocuments")}
      >
        <Text style={styles.buttonText}>Upload Court Documents</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f7f7f7" },
  title: { fontSize: 28, fontWeight: "600", marginBottom: 20 },
  button: {
    backgroundColor: "#4a90e2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontSize: 18 },
});
