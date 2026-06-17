import { View, Text, StyleSheet } from "react-native";

interface LessonHeaderProps {
  title: string;
  level: string | undefined;
  duration: string | undefined;
  category: string | undefined;
}

export default function LessonHeader({
  title,
  level,
  duration,
  category,
}: LessonHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.metaRow}>
        {level && <Text style={styles.meta}>Level: {level}</Text>}
        {duration && <Text style={styles.meta}>• {duration}</Text>}
        {category && <Text style={styles.meta}>• {category}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  meta: {
    fontSize: 14,
    color: "#666",
  },
});
