import React, { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, Redirect, useLocalSearchParams } from "expo-router";

import { SafeStepsSingleLessonExperience } from "../../components/SafeStepsLessonExperience";
import { useAuth } from "../../lib/auth";
import { getLessonById, getLessonDurationCategory } from "../../lib/lessonContent";
import { courses } from "../../curriculum/courses";
import { programs } from "../../lib/data/programs";
import { completeLesson, getCompletedLessonIds } from "../../lib/platformData";
import { safestepsLessonTheme } from "../../lib/safestepsLessonTheme";
import { globalStyles } from "../../lib/styles";

const DURATION_BADGE_COLORS: Record<string, string> = {
  short: safestepsLessonTheme.colors.teal,
  standard: safestepsLessonTheme.colors.purpleDark,
  extended: safestepsLessonTheme.colors.navy,
};

export default function LessonDetailScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const lesson = getLessonById(lessonId);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");

  const durationCategory = lesson ? getLessonDurationCategory(lesson.estimatedMinutes) : null;

  const containingCourses = useMemo(() => {
    if (!lesson) return [];
    return courses.filter(
      (course) =>
        course.composedFromLessonIds?.includes(lesson.id) ||
        course.lessons.some((cl) => cl.foundationLessonId === lesson.id),
    );
  }, [lesson]);

  const containingPrograms = useMemo(() => {
    if (!lesson) return [];
    return programs.filter((program) => program.requiredLessonIds?.includes(lesson.id ?? ""));
  }, [lesson]);

  useEffect(() => {
    if (!userId || !lesson) return;

    getCompletedLessonIds(userId).then((lessonIds) => {
      setCompleted(lessonIds.has(lesson.id));
    });
  }, [lesson, userId]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!lesson) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Lesson not found</Text>
        <Text style={globalStyles.subtitle}>This lesson is not available in the active SafeSteps library.</Text>
      </ScrollView>
    );
  }

  const handleComplete = async () => {
    setMessage("");

    try {
      await completeLesson(user.id, lesson.id, lesson.title);
      setCompleted(true);
      setMessage("Lesson marked complete.");
    } catch {
      setMessage("Could not save lesson completion yet. Try again shortly.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/safesteps-course-background.png")}
      resizeMode="cover"
      style={globalStyles.courseBackground}
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.courseScreen}>
        {/* Duration category badge */}
        {durationCategory && (
          <View style={styles.metaRow}>
            <View style={[styles.durationBadge, { backgroundColor: DURATION_BADGE_COLORS[durationCategory] }]}>
              <Text style={styles.durationBadgeText}>
                {durationCategory.charAt(0).toUpperCase() + durationCategory.slice(1)} lesson · {lesson.estimatedMinutes} min
              </Text>
            </View>
            {lesson.standalone !== false && (
              <View style={styles.standaloneBadge}>
                <Text style={styles.standaloneBadgeText}>Standalone</Text>
              </View>
            )}
          </View>
        )}

        {message ? <Text style={message.startsWith("Lesson") ? globalStyles.notice : globalStyles.error}>{message}</Text> : null}
        <SafeStepsSingleLessonExperience
          lesson={{
            id: lesson.id,
            title: lesson.title,
            summary: lesson.summary,
            estimatedMinutes: lesson.estimatedMinutes,
            moduleTitle: `Week ${lesson.week}`,
            courseTitle: "SafeSteps Lessons",
            goals: lesson.sections.slice(0, 3).map((section) => section.heading),
            parentMeaningPrompt: lesson.sections[0]?.body ?? lesson.summary,
            completionLabel: completed ? "Completed" : "Complete Lesson",
            completionMessage: "Lesson marked complete.",
            onComplete: completed ? undefined : handleComplete,
          }}
        />

        {/* Back-links: courses that contain this lesson */}
        {containingCourses.length > 0 && (
          <View style={styles.backLinksSection}>
            <Text style={styles.backLinksTitle}>Part of these courses</Text>
            {containingCourses.map((course) => (
              <Link
                key={course.id}
                href={{ pathname: "/courses/course", params: { courseId: course.id } }}
                asChild
              >
                <Pressable style={styles.backLinkItem}>
                  <Text style={styles.backLinkText}>{course.title} →</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        )}

        {/* Back-links: programs that require this lesson */}
        {containingPrograms.length > 0 && (
          <View style={styles.backLinksSection}>
            <Text style={styles.backLinksTitle}>Part of these programs</Text>
            {containingPrograms.map((program) => (
              <Link
                key={program.id}
                href={{ pathname: "/programs/program", params: { programId: program.id } }}
                asChild
              >
                <Pressable style={styles.backLinkItem}>
                  <Text style={styles.backLinkText}>{program.title} →</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationBadge: {
    borderRadius: safestepsLessonTheme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  durationBadgeText: {
    color: safestepsLessonTheme.colors.white,
    fontWeight: "900",
    fontSize: 13,
  },
  standaloneBadge: {
    borderRadius: safestepsLessonTheme.radius.pill,
    borderWidth: 1.5,
    borderColor: safestepsLessonTheme.colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  standaloneBadgeText: {
    color: safestepsLessonTheme.colors.teal,
    fontWeight: "900",
    fontSize: 13,
  },
  backLinksSection: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 16,
    gap: 10,
    backgroundColor: safestepsLessonTheme.colors.card,
    marginTop: 4,
  },
  backLinksTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "900",
    fontSize: 16,
  },
  backLinkItem: {
    borderRadius: safestepsLessonTheme.radius.medium,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 12,
    backgroundColor: safestepsLessonTheme.colors.lavender,
  },
  backLinkText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "900",
    fontSize: 15,
  },
});

