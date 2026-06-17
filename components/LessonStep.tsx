import { View, Text, StyleSheet } from "react-native";

export default function LessonStep({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.numberCircle}>
        <Text style={styles.number}>{number}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  number: {
    color: "#fff",
    fontWeight: "700",
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
});
