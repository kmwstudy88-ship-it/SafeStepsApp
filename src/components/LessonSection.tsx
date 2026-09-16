import { useLocalSearchParams } from "expo-router";
import { ScrollView, ActivityIndicator, View, Text } from "react-native";
import LessonHeader from "../../src/components/LessonHeader";
import LessonSection from "../../src/components/LessonSection";
import { useApp } from "../../safesteps/context";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  const lesson = (data as any).lessons?.[id ?? ""];

  if (!lesson) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Text>Lesson not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <LessonHeader
        title={lesson.title}
        level={lesson.level}
        duration={lesson.duration}
        category={lesson.category}
      />

      {lesson.sections?.map((section: any, index: number) => (
        <LessonSection
          key={index}
          heading={section.heading}
          body={section.body}
        />
      ))}
    </ScrollView>
  );
}
