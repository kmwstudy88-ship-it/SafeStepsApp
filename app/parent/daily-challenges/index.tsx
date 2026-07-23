import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Redirect, type Href } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { fetchUserTasks, type UserTask } from "../../../lib/engines/taskEngine";
import {
  ChallengeRow,
  DailyChallengeHeader,
  DailyChallengeNav,
  ProgressRing,
  challengeTaskStatus,
  dailyChallengeColors,
  dailyChallengeStyles as styles,
  dailyChallengeSummary,
} from "./_shared";

export default function DailyChallengesDashboard() {
  const { initializing, user } = useAuth();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const summary = useMemo(() => dailyChallengeSummary(tasks), [tasks]);
  const todo = summary.challenges.filter((challenge) => !challengeTaskStatus(tasks, challenge).completed);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchUserTasks()
      .then((result) => {
        if (active) setTasks(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.screen}>
      <DailyChallengeHeader
        title="Daily Challenges"
        subtitle="Complete today's challenges by doing the task and attaching evidence before marking them complete."
      />
      <DailyChallengeNav />

      <View style={styles.softCard}>
        <View style={styles.row}>
          <View>
          <Text style={styles.cardTitle}>Today Progress</Text>
            <Text style={styles.body}>{summary.completedCount} / {summary.totalCount} Completed</Text>
          </View>
          <ProgressRing progress={summary.progress} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <MaterialCommunityIcons name="fire" size={56} color={dailyChallengeColors.orange} />
          <Text style={styles.cardTitle}>{summary.streak}</Text>
          <Text style={styles.body}>Days in a row</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <View
              key={day}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: day <= summary.streak ? dailyChallengeColors.sage : "#D9E5E1",
              }}
            >
              <MaterialCommunityIcons name={day <= summary.streak ? "check" : "circle"} size={14} color="#FFFFFF" />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, { flex: 1, minWidth: 160 }]}>
          <Text style={styles.cardTitle}>{summary.points}</Text>
          <Text style={styles.muted}>Points earned</Text>
        </View>
        <Link href={"/parent/daily-challenges/rewards" as Href} asChild>
          <Pressable style={[styles.secondaryButton, { flex: 1, minWidth: 160 }]}>
            <Text style={styles.secondaryButtonText}>View Rewards</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>My Challenges</Text>
          <Text style={styles.pill}>{todo.length} to do</Text>
        </View>
        {loading ? <ActivityIndicator /> : summary.challenges.map((challenge) => {
          const status = challengeTaskStatus(tasks, challenge);
          return <ChallengeRow key={challenge.id} challenge={challenge} task={status.task} />;
        })}
      </View>

      <Link href={"/parent/daily-challenges/summary" as Href} asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>View Weekly Summary</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
