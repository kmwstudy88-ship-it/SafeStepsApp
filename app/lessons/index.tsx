import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Link, Redirect } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { appLessons } from "../../lib/lessonContent";
import { getCompletedLessonIds } from "../../lib/platformData";
import { getSafeStepsLessonWatercolorPalette, safestepsLessonTheme } from "../../lib/safestepsLessonTheme";

export default function LessonsScreen() {
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    getCompletedLessonIds(userId).then(setCompletedLessonIds);
  }, [userId]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.screen}>
      <Text style={styles.brand}>SafeSteps</Text>
      <Text style={styles.title}>Lessons</Text>
      <Text style={styles.subtitle}>Start with the core SafeSteps lessons and mark them complete as you go.</Text>

      {appLessons.map((lesson) => {
        const palette = getSafeStepsLessonWatercolorPalette(lesson.id);
        const complete = completedLessonIds.has(lesson.id);

        return (
          <Link
            key={lesson.id}
            href={{ pathname: "/lessons/[lessonId]", params: { lessonId: lesson.id } }}
            asChild
          >
            <TouchableOpacity style={[styles.lessonCard, { backgroundColor: palette.wash }]}>
              <View style={styles.inlineRow}>
                <Text style={[styles.weekPill, { backgroundColor: palette.washStrong, color: palette.accentDark }]}>
                  Week {lesson.week}
                </Text>
                {complete ? <Text style={[styles.completePill, { borderColor: palette.accent }]}>Complete</Text> : null}
              </View>
              <Text style={styles.cardTitle}>{lesson.title}</Text>
              <Text style={styles.cardText}>{lesson.summary}</Text>
              <View style={styles.lessonFooter}>
                <Text style={styles.mutedText}>{lesson.estimatedMinutes} min</Text>
                <View style={[styles.accentDot, { backgroundColor: palette.accent }]} />
              </View>
            </TouchableOpacity>
          </Link>
        );
      })}
      <AppBottomNav />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 20,
    gap: 16,
    backgroundColor: safestepsLessonTheme.colors.background,
  },
  brand: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  title: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
  },
  lessonCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 20,
    gap: 12,
    ...safestepsLessonTheme.shadow,
  },
  inlineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  weekPill: {
    borderRadius: safestepsLessonTheme.radius.pill,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontWeight: "800",
  },
  completePill: {
    borderRadius: safestepsLessonTheme.radius.pill,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: safestepsLessonTheme.colors.purpleDark,
    backgroundColor: safestepsLessonTheme.colors.card,
    fontWeight: "800",
  },
  cardTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  cardText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  lessonFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  mutedText: {
    color: safestepsLessonTheme.colors.muted,
    fontWeight: "800",
  },
  accentDot: {
    width: 18,
    height: 18,
    borderRadius: safestepsLessonTheme.radius.pill,
  },
});
