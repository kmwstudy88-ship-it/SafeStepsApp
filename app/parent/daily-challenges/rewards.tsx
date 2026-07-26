import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Redirect, type Href } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { fetchUserTasks, type UserTask } from "../../../lib/engines/taskEngine";
import { DailyChallengeHeader, dailyChallengeColors, dailyChallengeStyles as styles, dailyChallengeSummary } from "../../../components/dailyChallenges/shared";

const rewards = [
  { label: "Bronze Reward", points: 250, icon: "treasure-chest" },
  { label: "Silver Reward", points: 500, icon: "shield-star" },
  { label: "Gold Reward", points: 750, icon: "medal" },
  { label: "Bonus Reward", points: 1000, icon: "gift" },
] as const;

export default function DailyChallengeRewards() {
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
      <DailyChallengeHeader title="Rewards" subtitle="Claim rewards when enough evidence-backed challenges are complete." />
      <View style={styles.softCard}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="star" size={44} color={dailyChallengeColors.gold} />
          <View>
            <Text style={styles.title}>{summary.points}</Text>
            <Text style={styles.muted}>Available Points</Text>
          </View>
        </View>
      </View>
      {rewards.map((reward) => {
        const unlocked = summary.points >= reward.points;
        return (
          <View key={reward.label} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <MaterialCommunityIcons
                  name={reward.icon as never}
                  size={30}
                  color={unlocked ? dailyChallengeColors.gold : dailyChallengeColors.muted}
                />
                <View>
                  <Text style={styles.cardTitle}>{reward.label}</Text>
                  <Text style={styles.muted}>{reward.points} points</Text>
                </View>
              </View>
              <Text style={unlocked ? styles.pill : styles.muted}>{unlocked ? "Claim" : "Locked"}</Text>
            </View>
          </View>
        );
      })}
      <Link href={"/parent/daily-challenges" as Href} asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Back to Challenges</Text></Pressable>
      </Link>
    </ScrollView>
  );
}
