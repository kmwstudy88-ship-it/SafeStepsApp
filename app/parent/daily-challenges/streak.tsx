import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Redirect, type Href } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { fetchUserTasks, type UserTask } from "../../../lib/engines/taskEngine";
import { DailyChallengeHeader, dailyChallengeColors, dailyChallengeStyles as styles, dailyChallengeSummary } from "./_shared";

export default function DailyChallengeStreak() {
  const { initializing, user } = useAuth();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const summary = useMemo(() => dailyChallengeSummary(tasks), [tasks]);

  useEffect(() => {
    if (!user) return;
    fetchUserTasks().then(setTasks);
  }, [user]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <DailyChallengeHeader title="Daily Streak" subtitle="Streaks count evidence-backed completion, not just opening a challenge." />
      <View style={[styles.card, { alignItems: "center" }]}>
        <MaterialCommunityIcons name="fire" size={82} color={dailyChallengeColors.orange} />
        <Text style={styles.title}>{summary.streak}</Text>
        <Text style={styles.body}>Days in a Row</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <View key={`${day}-${index}`} style={{ alignItems: "center", gap: 6 }}>
              <Text style={styles.muted}>{day}</Text>
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: index < summary.streak ? dailyChallengeColors.sage : "#DDE9E5",
              }}>
                <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.softCard}>
        <Text style={styles.cardTitle}>Streak Bonus</Text>
        <Text style={styles.body}>Complete {Math.max(1, 7 - summary.streak)} more day{7 - summary.streak === 1 ? "" : "s"} to unlock your next reward.</Text>
      </View>
      <Link href={"/parent/daily-challenges" as Href} asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Back to Challenges</Text></Pressable>
      </Link>
    </ScrollView>
  );
}
