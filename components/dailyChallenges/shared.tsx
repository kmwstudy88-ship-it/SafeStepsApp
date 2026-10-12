import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { safestepsParentChallenges, type SafeStepsParentChallenge } from "../../lib/data/safestepsParentChallenges";
import type { UserTask } from "../../lib/engines/taskEngine";

export type DailyChallengeTab = "all" | "todo" | "completed";
export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

export const dailyChallengeColors = {
  background: "#F8FCFA",
  card: "#FFFFFF",
  teal: "#007C7A",
  tealDark: "#005B5D",
  sage: "#5DAE8B",
  gold: "#F6B735",
  orange: "#F47B2A",
  purple: "#7B57C8",
  blue: "#3F88C5",
  red: "#E56B61",
  text: "#113C3D",
  muted: "#607174",
  border: "#D5E6E2",
  wash: "#EEF8F4",
};

export const dailyChallengePoints = {
  daily: 150,
  weekly: 250,
  monthly: 500,
} as const;

export function getDailyChallengePoints(challenge: SafeStepsParentChallenge) {
  return dailyChallengePoints[challenge.challengeType];
}

export function getDailyChallengeIcon(challenge: SafeStepsParentChallenge): IconName {
  const category = challenge.category.toLowerCase();
  if (category.includes("connection")) return "account-heart";
  if (category.includes("regulation")) return "meditation";
  if (category.includes("safety")) return "shield-check";
  if (category.includes("routine")) return "calendar-check";
  if (category.includes("evidence")) return "camera-plus";
  if (category.includes("wellbeing")) return "heart-pulse";
  return "check-circle";
}

export function dailyChallenges() {
  return safestepsParentChallenges.filter((challenge) => challenge.challengeType === "daily").slice(0, 6);
}

export function challengeTaskStatus(tasks: UserTask[], challenge: SafeStepsParentChallenge) {
  const task = tasks.find((item) => item.related_lesson_id === `challenge:${challenge.id}`);
  return {
    task,
    completed: task?.status === "completed",
    started: Boolean(task),
  };
}

export function dailyChallengeSummary(tasks: UserTask[]) {
  const challenges = dailyChallenges();
  const completed = challenges.filter((challenge) => challengeTaskStatus(tasks, challenge).completed);
  const points = completed.reduce((total, challenge) => total + getDailyChallengePoints(challenge), 0);

  return {
    challenges,
    completedCount: completed.length,
    totalCount: challenges.length,
    points,
    progress: challenges.length === 0 ? 0 : completed.length / challenges.length,
    streak: Math.max(1, Math.min(7, completed.length + 1)),
  };
}

export function DailyChallengeHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <MaterialCommunityIcons name="human-male-female-child" size={28} color={dailyChallengeColors.tealDark} />
        <Text style={styles.brand}>SafeSteps</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function DailyChallengeNav() {
  const links: { label: string; icon: IconName; href: Href }[] = [
    { label: "Challenges", icon: "format-list-checks", href: "/parent/daily-challenges" as Href },
    { label: "Streak", icon: "fire", href: "/parent/daily-challenges/streak" as Href },
    { label: "Rewards", icon: "star", href: "/parent/daily-challenges/rewards" as Href },
    { label: "History", icon: "history", href: "/parent/daily-challenges/history" as Href },
    { label: "Settings", icon: "cog", href: "/parent/daily-challenges/settings" as Href },
  ];

  return (
    <View style={styles.navRow}>
      {links.map((link) => (
        <Link key={link.label} href={link.href} asChild>
          <Pressable style={styles.navButton}>
            <MaterialCommunityIcons name={link.icon} size={18} color={dailyChallengeColors.tealDark} />
            <Text style={styles.navText}>{link.label}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

export function ProgressRing({ progress }: { progress: number }) {
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.ring}>
      <Text style={styles.ringText}>{percent}%</Text>
    </View>
  );
}

export function ChallengeRow({
  challenge,
  task,
}: {
  challenge: SafeStepsParentChallenge;
  task?: UserTask | null;
}) {
  const completed = task?.status === "completed";
  const href = {
    pathname: "/parent/daily-challenges/[id]",
    params: { id: challenge.id },
  } as unknown as Href;

  return (
    <Link href={href} asChild>
      <Pressable style={styles.challengeRow}>
        <View style={[styles.iconCircle, { backgroundColor: completed ? dailyChallengeColors.sage : dailyChallengeColors.purple }]}>
          <MaterialCommunityIcons name={completed ? "check" : getDailyChallengeIcon(challenge)} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.challengeCopy}>
          <Text style={styles.challengeTitle}>{challenge.displayTitle}</Text>
          <Text style={styles.challengeMeta}>{challenge.estimatedTime} | {challenge.category}</Text>
          <View style={styles.miniTrack}>
            <View style={[styles.miniFill, { width: completed ? "100%" : task ? "50%" : "0%" }]} />
          </View>
        </View>
        <View style={styles.pointsColumn}>
          <Text style={styles.pointsText}>{getDailyChallengePoints(challenge)}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
    backgroundColor: dailyChallengeColors.background,
  },
  header: {
    gap: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    color: dailyChallengeColors.tealDark,
    fontSize: 22,
    fontWeight: "900",
  },
  title: {
    color: dailyChallengeColors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: dailyChallengeColors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: dailyChallengeColors.border,
    padding: 16,
    gap: 10,
    backgroundColor: dailyChallengeColors.card,
  },
  softCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: dailyChallengeColors.border,
    padding: 16,
    gap: 10,
    backgroundColor: dailyChallengeColors.wash,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    color: dailyChallengeColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  body: {
    color: dailyChallengeColors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  muted: {
    color: dailyChallengeColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: dailyChallengeColors.teal,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F3EF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButtonText: {
    color: dailyChallengeColors.tealDark,
    fontSize: 15,
    fontWeight: "900",
  },
  pill: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#E7F4F1",
    color: dailyChallengeColors.tealDark,
    fontSize: 12,
    fontWeight: "900",
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  navButton: {
    flexGrow: 1,
    minWidth: 96,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: dailyChallengeColors.border,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: dailyChallengeColors.card,
  },
  navText: {
    color: dailyChallengeColors.tealDark,
    fontSize: 12,
    fontWeight: "900",
  },
  ring: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 8,
    borderColor: dailyChallengeColors.teal,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  ringText: {
    color: dailyChallengeColors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  challengeRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: dailyChallengeColors.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  challengeTitle: {
    color: dailyChallengeColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  challengeMeta: {
    color: dailyChallengeColors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  miniTrack: {
    height: 6,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E4EFEB",
  },
  miniFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: dailyChallengeColors.teal,
  },
  pointsColumn: {
    minWidth: 48,
    alignItems: "flex-end",
  },
  pointsText: {
    color: dailyChallengeColors.orange,
    fontSize: 14,
    fontWeight: "900",
  },
  pointsLabel: {
    color: dailyChallengeColors.orange,
    fontSize: 11,
    fontWeight: "800",
  },
  input: {
    minHeight: 110,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: dailyChallengeColors.border,
    padding: 12,
    backgroundColor: "#FFFFFF",
    color: dailyChallengeColors.text,
    textAlignVertical: "top",
  },
});

export const dailyChallengeStyles = styles;
