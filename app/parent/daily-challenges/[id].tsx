import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Redirect, router, type Href, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { getParentChallengeById } from "../../../lib/data/safestepsParentChallenges";
import {
  createUserTaskFromParentChallenge,
  fetchParentChallengeTask,
  type UserTask,
} from "../../../lib/engines/taskEngine";
import {
  DailyChallengeHeader,
  dailyChallengeColors,
  dailyChallengeStyles as styles,
  getDailyChallengeIcon,
  getDailyChallengePoints,
} from "../../../components/dailyChallenges/shared";

export default function DailyChallengeDetail() {
  const { initializing, user } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const challenge = getParentChallengeById(String(id ?? ""));
  const [task, setTask] = useState<UserTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!challenge || !user) return;
    let active = true;
    fetchParentChallengeTask(challenge.id)
      .then((result) => {
        if (active) setTask(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
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
        <Link href={"/parent/daily-challenges" as Href} asChild>
          <Pressable style={styles.button}><Text style={styles.buttonText}>Back to Challenges</Text></Pressable>
        </Link>
      </ScrollView>
    );
  }

  async function startChallenge() {
    if (saving || !challenge) return;
    setSaving(true);
    setMessage("");
    try {
      const savedTask = await createUserTaskFromParentChallenge(challenge.id);
      setTask(savedTask);
      router.push({
        pathname: "/parent/daily-challenges/evidence",
        params: { id: challenge.id, taskId: savedTask.id, taskTitle: savedTask.title },
      } as unknown as Href);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start challenge.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.screen}>
      <Link href={"/parent/daily-challenges" as Href} asChild>
        <Pressable><Text style={styles.muted}>Back to Daily Challenges</Text></Pressable>
      </Link>

      <View style={[styles.card, { alignItems: "center" }]}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: dailyChallengeColors.purple,
          }}
        >
          <MaterialCommunityIcons name={getDailyChallengeIcon(challenge)} size={42} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>{challenge.displayTitle}</Text>
        <Text style={styles.pill}>{getDailyChallengePoints(challenge)} points</Text>
        <Text style={[styles.body, { textAlign: "center" }]}>{challenge.purpose}</Text>
      </View>

      <View style={styles.softCard}>
        <Text style={styles.cardTitle}>What this means</Text>
        <Text style={styles.body}>{challenge.quickQuestionBeforeChallenge}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How to complete</Text>
        {challenge.challengeSteps.map((step, index) => (
          <View key={step} style={{ flexDirection: "row", gap: 8 }}>
            <Text style={{ color: dailyChallengeColors.sage, fontWeight: "900" }}>{index + 1}.</Text>
            <Text style={[styles.body, { flex: 1 }]}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Evidence required</Text>
        <Text style={styles.body}>{challenge.evidenceTask}</Text>
        <Text style={styles.muted}>This challenge cannot be completed until a linked evidence record is saved.</Text>
      </View>

      {loading ? <ActivityIndicator /> : task ? (
        <Link
          href={{
            pathname: "/parent/daily-challenges/evidence",
            params: { id: challenge.id, taskId: task.id, taskTitle: task.title },
          } as unknown as Href}
          asChild
        >
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>{task.status === "completed" ? "Review Evidence Step" : "Continue Challenge"}</Text>
          </Pressable>
        </Link>
      ) : (
        <Pressable disabled={saving} onPress={startChallenge} style={[styles.button, saving && { opacity: 0.65 }]}>
          <Text style={styles.buttonText}>{saving ? "Starting..." : "Start Challenge"}</Text>
        </Pressable>
      )}

      {message ? <Text style={styles.muted}>{message}</Text> : null}
    </ScrollView>
  );
}
