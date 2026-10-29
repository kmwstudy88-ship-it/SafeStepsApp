import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { CourseLesson } from "../curriculum/courses";
import { safestepsLessonTheme } from "../lib/safestepsLessonTheme";

type CourseLessonContentProps = {
  lesson: CourseLesson;
  parentMeaning: string;
  onParentMeaningChange: (value: string) => void;
};

export function CourseLessonContent({
  lesson,
  parentMeaning,
  onParentMeaningChange,
}: CourseLessonContentProps) {
  return (
    <View style={styles.container}>
      {lesson.body && lesson.body.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Guidance</Text>
          {lesson.body.map((paragraph, idx) => (
            <Text key={idx} style={styles.bodyText}>
              {paragraph}
            </Text>
          ))}
        </View>
      ) : null}

      {lesson.practiceSteps && lesson.practiceSteps.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Steps</Text>
          {lesson.practiceSteps.map((step, idx) => (
            <Text key={idx} style={styles.stepText}>
              {idx + 1}. {step}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.reflectionBox}>
        <Text style={styles.sectionTitle}>What This Means for My Parenting</Text>
        <Text style={styles.promptText}>
          {lesson.reflectionPrompt ??
            "Write a short reflection on how you will practise this skill safely and consistently."}
        </Text>
        <TextInput
          value={parentMeaning}
          onChangeText={onParentMeaningChange}
          multiline
          placeholder="Record your personal reflection to unlock lesson completion..."
          placeholderTextColor={safestepsLessonTheme.colors.muted}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 15,
    fontWeight: "900",
  },
  bodyText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 15,
    lineHeight: 22,
  },
  stepText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  reflectionBox: {
    marginTop: 4,
    padding: 14,
    borderRadius: safestepsLessonTheme.radius.medium,
    backgroundColor: safestepsLessonTheme.colors.white,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    gap: 8,
  },
  promptText: {
    color: safestepsLessonTheme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    borderRadius: safestepsLessonTheme.radius.small,
    padding: 10,
    color: safestepsLessonTheme.colors.navy,
    backgroundColor: safestepsLessonTheme.colors.card,
    textAlignVertical: "top",
    fontSize: 14,
  },
});
