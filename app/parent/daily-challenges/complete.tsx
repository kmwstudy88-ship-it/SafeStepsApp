import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Redirect, type Href, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { getParentChallengeById } from "../../../lib/data/safestepsParentChallenges";
import { completeUserTask, fetchParentChallengeTask, type UserTask } from "../../../lib/engines/taskEngine";
import {
  DailyChallengeHeader,
  ProgressRing,
  dailyChallengeColors,
  dailyChallengeStyles as styles,
  getDailyChallengePoints,
} from "./_shared";

export default function DailyChallengeComplete() {
  const { initializing, user } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const challenge = getParentChallengeById(String(id ?? ""));
  const [task, setTask] = useState<UserTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Completing challenge...");

  useEffect(() => {
    if (!challenge || !user) return;
    const activeChallenge = challenge;
    let active = true;
    async function finish() {
      try {
        const existing = await fetchParentChallengeTask(activeChallenge.id);
        if (!active) return;
        if (!existing) {
          setMessage("Start this challenge before completing it.");
          return;
        }
        const completed = existing.status === "completed" ? existing : await completeUserTask(existing);
        if (!active) return;
        setTask(completed);
        setMessage("Challenge completed.");
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Could not complete challenge.");
      } finally {
        if (active) setLoading(false);
      }
    }
    finish();
    return () => {
      active = false;
    };
  }, [challenge, user]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  if (!challenge) {
    return (
      <ScrollView contentContainerStyle={styles.screen}>
        <DailyChallengeHeader title="Challenge not found" />
      </ScrollView>
    );
  }

  const completed = task?.status === "completed";

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.screen}>
      <DailyChallengeHeader title="Challenge Complete" subtitle={challenge.displayTitle} />

      <View style={[styles.card, { alignItems: "center", gap: 14 }]}>
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: completed ? dailyChallengeColors.sage : dailyChallengeColors.gold,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name={completed ? "check" : "alert"} size={48} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.cardTitle}>{message}</Text>
        <Text style={[styles.body, { textAlign: "center" }]}>
          {completed
            ? "Your task and linked evidence are now recorded in SafeSteps."
            : "Daily challenges need linked evidence before completion."}
        </Text>
      </View>

      <View style={styles.softCard}>
        <Text style={styles.muted}>You earned</Text>
        <Text style={styles.title}>{completed ? getDailyChallengePoints(challenge) : 0} Points</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>Today Progress</Text>
          <ProgressRing progress={completed ? 1 : 0.67} />
        </View>
      </View>

      <Link href={"/parent/daily-challenges/rewards" as Href} asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>View Rewards</Text></Pressable>
      </Link>
      <Link href={"/parent/daily-challenges" as Href} asChild>
        <Pressable style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Back to Challenges</Text></Pressable>
      </Link>
    </ScrollView>
  );
}
