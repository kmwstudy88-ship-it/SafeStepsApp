import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getWorkshopById } from "../../curriculum/workshops";
import { getSafeStepsLessonWatercolorPalette, safestepsLessonTheme } from "../../lib/safestepsLessonTheme";
import { globalStyles } from "../../lib/styles";

function formatLabel(value: string): string {
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

export default function WorkshopDetailScreen() {
  const { workshopId } = useLocalSearchParams<{ workshopId: string }>();
  const workshop = getWorkshopById(workshopId ?? "");
  const [completedReflections, setCompletedReflections] = useState<Record<number, boolean>>({});

  if (!workshop) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Workshop not found</Text>
        <Text style={globalStyles.subtitle}>
          This workshop is not available in the current SafeSteps library.
        </Text>
      </ScrollView>
    );
  }

  const palette = getSafeStepsLessonWatercolorPalette(workshop.id);
  const allReflectionsChecked =
    workshop.reflectionPrompts.length > 0 &&
    workshop.reflectionPrompts.every((_, i) => completedReflections[i]);

  function toggleReflection(index: number) {
    setCompletedReflections((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  return (
    <ImageBackground
      source={require("../../assets/safesteps-course-background.png")}
      resizeMode="cover"
      style={globalStyles.courseBackground}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.screen}
      >
        {/* Header */}
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, { backgroundColor: palette.accentDark }]}>
            {formatLabel(workshop.format)}
          </Text>
          <Text style={[styles.badge, { backgroundColor: palette.accent }]}>
            {formatLabel(workshop.level)}
          </Text>
          <Text style={[styles.badge, { backgroundColor: safestepsLessonTheme.colors.purpleDark }]}>
            {formatDuration(workshop.durationMinutes)}
          </Text>
        </View>

        <Text style={styles.title}>{workshop.title}</Text>
        <Text style={styles.description}>{workshop.description}</Text>

        {/* Tags */}
        <View style={styles.tagRow}>
          {workshop.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>

        {/* Embedded lessons */}
        <View style={[styles.section, { backgroundColor: palette.wash }]}>
          <View style={[styles.sectionAccent, { backgroundColor: palette.accent }]} />
          <Text style={styles.sectionTitle}>Lessons in this workshop</Text>
          <Text style={styles.sectionBody}>
            These foundation lessons are embedded in this workshop. You can open each lesson for a
            deeper individual experience.
          </Text>
          {workshop.composedFromLessonIds.map((lessonId) => (
            <Link
              key={lessonId}
              href={{ pathname: "/lessons/[lessonId]", params: { lessonId } }}
              asChild
            >
              <Pressable style={[styles.lessonLink, { borderColor: palette.accent }]}>
                <Text style={[styles.lessonLinkText, { color: palette.accentDark }]}>
                  {formatLabel(lessonId)} →
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>

        {/* Facilitator notes */}
        {workshop.facilitatorNotes ? (
          <View style={styles.section}>
            <View style={[styles.sectionAccent, { backgroundColor: safestepsLessonTheme.colors.peach }]} />
            <Text style={styles.sectionTitle}>Facilitator notes</Text>
            <Text style={styles.sectionBody}>{workshop.facilitatorNotes}</Text>
          </View>
        ) : null}

        {/* Group activities */}
        {workshop.groupActivities && workshop.groupActivities.length > 0 ? (
          <View style={styles.section}>
            <View style={[styles.sectionAccent, { backgroundColor: safestepsLessonTheme.colors.teal }]} />
            <Text style={styles.sectionTitle}>Activities</Text>
            {workshop.groupActivities.map((activity, i) => (
              <View key={i} style={styles.activityCard}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                {activity.groupSize ? (
                  <Text style={styles.activityMeta}>
                    {activity.groupSize} · {activity.durationMinutes} min
                  </Text>
                ) : (
                  <Text style={styles.activityMeta}>{activity.durationMinutes} min</Text>
                )}
                <Text style={styles.sectionBody}>{activity.instructions}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Reflections */}
        <View style={[styles.section, { backgroundColor: safestepsLessonTheme.colors.lavender }]}>
          <View style={[styles.sectionAccent, { backgroundColor: safestepsLessonTheme.colors.purpleDark }]} />
          <Text style={styles.sectionTitle}>Reflection prompts</Text>
          <Text style={styles.sectionBody}>
            Work through these prompts during or after the workshop. Tap each one when you have
            considered it.
          </Text>
          {workshop.reflectionPrompts.map((prompt, i) => (
            <Pressable
              key={i}
              onPress={() => toggleReflection(i)}
              style={[
                styles.reflectionItem,
                completedReflections[i] && styles.reflectionItemChecked,
              ]}
            >
              <Text style={styles.reflectionCheck}>
                {completedReflections[i] ? "✓" : "○"}
              </Text>
              <Text style={styles.reflectionText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>

        {/* Evidence task */}
        <View style={styles.section}>
          <View style={[styles.sectionAccent, { backgroundColor: safestepsLessonTheme.colors.pink }]} />
          <Text style={styles.sectionTitle}>Evidence task</Text>
          <Text style={styles.sectionBody}>{workshop.evidenceTask}</Text>
          <Link href="/evidence" asChild>
            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: allReflectionsChecked ? safestepsLessonTheme.colors.purpleDark : safestepsLessonTheme.colors.line },
              ]}
            >
              <Text style={[
                styles.actionButtonText,
                { color: allReflectionsChecked ? safestepsLessonTheme.colors.white : safestepsLessonTheme.colors.navy },
              ]}>
                {allReflectionsChecked ? "Upload Evidence" : "Complete reflections first"}
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 22,
    gap: 18,
    backgroundColor: safestepsLessonTheme.colors.background,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    borderRadius: safestepsLessonTheme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    color: safestepsLessonTheme.colors.white,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    overflow: "hidden",
  },
  title: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
  },
  description: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 17,
    lineHeight: 26,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    borderRadius: safestepsLessonTheme.radius.pill,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: safestepsLessonTheme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  section: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 12,
    backgroundColor: safestepsLessonTheme.colors.card,
    ...safestepsLessonTheme.shadow,
  },
  sectionAccent: {
    width: 48,
    height: 7,
    borderRadius: safestepsLessonTheme.radius.pill,
  },
  sectionTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionBody: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  lessonLink: {
    borderRadius: safestepsLessonTheme.radius.medium,
    borderWidth: 1.5,
    padding: 12,
  },
  lessonLinkText: {
    fontWeight: "900",
    fontSize: 15,
  },
  activityCard: {
    borderRadius: safestepsLessonTheme.radius.medium,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 14,
    gap: 6,
    backgroundColor: safestepsLessonTheme.colors.card,
  },
  activityTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontWeight: "900",
    fontSize: 17,
  },
  activityMeta: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "800",
    fontSize: 13,
  },
  reflectionItem: {
    flexDirection: "row",
    gap: 12,
    borderRadius: safestepsLessonTheme.radius.medium,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 14,
    backgroundColor: safestepsLessonTheme.colors.card,
    alignItems: "flex-start",
  },
  reflectionItemChecked: {
    backgroundColor: "#E8F5E9",
    borderColor: "#66BB6A",
  },
  reflectionCheck: {
    fontSize: 18,
    fontWeight: "900",
    color: safestepsLessonTheme.colors.purpleDark,
    minWidth: 20,
  },
  reflectionText: {
    flex: 1,
    color: safestepsLessonTheme.colors.navy,
    fontSize: 15,
    lineHeight: 22,
  },
  actionButton: {
    borderRadius: safestepsLessonTheme.radius.pill,
    padding: 15,
    alignItems: "center",
    marginTop: 4,
  },
  actionButtonText: {
    fontWeight: "900",
    fontSize: 16,
  },
});
