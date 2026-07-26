import { Link, Redirect, type Href } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { fetchUserTasks, type UserTask } from "../../../lib/engines/taskEngine";
import { DailyChallengeHeader, ProgressRing, dailyChallengeStyles as styles, dailyChallengeSummary } from "../../../components/dailyChallenges/shared";

export default function DailyChallengeSummary() {
  const { initializing, user } = useAuth();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const summary = useMemo(() => dailyChallengeSummary(tasks), [tasks]);

  useEffect(() => {
    if (!user) return;
    fetchUserTasks().then(setTasks);
  }, [user]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  const categories = summary.challenges.reduce<Record<string, { total: number; completed: number }>>((acc, challenge) => {
    const entry = acc[challenge.category] ?? { total: 0, completed: 0 };
    entry.total += 1;
    if (tasks.some((task) => task.related_lesson_id === `challenge:${challenge.id}` && task.status === "completed")) {
      entry.completed += 1;
    }
    acc[challenge.category] = entry;
    return acc;
  }, {});

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <DailyChallengeHeader title="Weekly Summary" subtitle="Progress, points, and completion rate." />
      <View style={styles.row}>
        <View style={[styles.card, { flex: 1, minWidth: 140 }]}>
          <Text style={styles.title}>{summary.completedCount}</Text>
          <Text style={styles.muted}>Challenges completed</Text>
        </View>
        <View style={[styles.card, { flex: 1, minWidth: 140 }]}>
          <Text style={styles.title}>{summary.points}</Text>
          <Text style={styles.muted}>Points earned</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>Completion Rate</Text>
          <ProgressRing progress={summary.progress} />
        </View>
      </View>
      {Object.entries(categories).map(([category, value]) => (
        <View key={category} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{category}</Text>
            <Text style={styles.muted}>{value.completed}/{value.total}</Text>
          </View>
        </View>
      ))}
      <Link href={"/parent/daily-challenges/history" as Href} asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>View Full History</Text></Pressable>
      </Link>
    </ScrollView>
  );
}
