import { View, Text, StyleSheet } from "react-native";

export default function LessonHeader({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: "#666",
  },
});
