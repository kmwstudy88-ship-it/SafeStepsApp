import { View, Text, StyleSheet } from "react-native";

export default function EvidenceScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Evidence Upload</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
