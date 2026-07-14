import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getRecommendedChallenges } from "../lib/challenges/recommendations";
import { getSafeStepsLessonWatercolorPalette, safestepsLessonTheme } from "../lib/safestepsLessonTheme";

export function ChallengeRecommendations({
  context,
  title = "Practise with a challenge",
  limit = 4,
}: {
  context: string;
  title?: string;
  limit?: number;
}) {
  const challenges = getRecommendedChallenges(context, limit);
  if (challenges.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>
        These optional activities help apply this learning in everyday family life.
      </Text>
      {challenges.map((challenge) => {
        const palette = getSafeStepsLessonWatercolorPalette(challenge.id);

        return (
          <Link
            key={challenge.id}
            href={{
              pathname: "/challenges/[challengeId]",
              params: { challengeId: challenge.id },
            } as unknown as Href}
            asChild
          >
            <Pressable style={[styles.challengeCard, { backgroundColor: palette.wash }]}>
              <View style={styles.inlineRow}>
                <Text style={[styles.pill, { backgroundColor: palette.washStrong, color: palette.accentDark }]}>
                  {challenge.challengeType}
                </Text>
                <Text style={styles.mutedText}>{challenge.estimatedTime}</Text>
              </View>
              <Text style={styles.challengeTitle}>{challenge.displayTitle}</Text>
              <Text style={styles.cardText}>{challenge.purpose}</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 12,
    backgroundColor: safestepsLessonTheme.colors.card,
    ...safestepsLessonTheme.shadow,
  },
  cardAccent: {
    width: 52,
    height: 7,
    borderRadius: safestepsLessonTheme.radius.pill,
    backgroundColor: safestepsLessonTheme.colors.peach,
  },
  cardTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  cardText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  challengeCard: {
    borderRadius: safestepsLessonTheme.radius.medium,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 16,
    gap: 10,
  },
  inlineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  pill: {
    borderRadius: safestepsLessonTheme.radius.pill,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontWeight: "900",
  },
  mutedText: {
    color: safestepsLessonTheme.colors.muted,
    fontWeight: "800",
  },
  challengeTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
  },
});
