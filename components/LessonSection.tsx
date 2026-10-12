import { View, Text, StyleSheet } from "react-native";

export default function LessonSection({ title, children }: { title: string; children: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  body: {
    paddingLeft: 4,
  },
});
