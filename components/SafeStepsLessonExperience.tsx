import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ApiCurriculumCourseDetail } from "../lib/curriculumApi";
import { safestepsLessonTheme } from "../lib/safestepsLessonTheme";
import { ChallengeRecommendations } from "./ChallengeRecommendations";

export function SafeStepsLessonExperience({ course }: { course: ApiCurriculumCourseDetail }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{course.title}</Text>
      {course.description ? <Text style={styles.subtitle}>{course.description}</Text> : null}

      <ChallengeRecommendations
        context={`${course.title} ${course.description ?? ""}`}
        title="Challenges for this course"
      />

      {course.modules.map((mod) => (
        <View key={mod.id} style={styles.card}>
          <Text style={styles.cardTitle}>{mod.title}</Text>
          {mod.summary ? <Text style={styles.cardBody}>{mod.summary}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 20,
  },
  title: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: safestepsLessonTheme.colors.card,
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 8,
  },
  cardTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 20,
    fontWeight: "800",
  },
  cardBody: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 15,
    lineHeight: 22,
  },
});
