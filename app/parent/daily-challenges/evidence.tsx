import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Redirect, router, type Href, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { getParentChallengeById } from "../../../lib/data/safestepsParentChallenges";
import { createEvidenceItemWithOfflineFallback } from "../../../lib/engines/evidenceEngine";
import {
  DailyChallengeHeader,
  dailyChallengeColors,
  dailyChallengeStyles as styles,
} from "../../../components/dailyChallenges/shared";

export default function DailyChallengeEvidence() {
  const { initializing, user } = useAuth();
  const { id, taskId, taskTitle } = useLocalSearchParams<{
    id?: string;
    taskId?: string;
    taskTitle?: string;
  }>();
  const challenge = getParentChallengeById(String(id ?? ""));
  const [reflection, setReflection] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  if (!challenge || typeof taskId !== "string" || taskId.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.screen}>
        <DailyChallengeHeader title="Evidence step unavailable" subtitle="Start the challenge first so evidence can be linked to a task." />
        <Link href={"/parent/daily-challenges" as Href} asChild>
          <Pressable style={styles.button}><Text style={styles.buttonText}>Back to Challenges</Text></Pressable>
        </Link>
      </ScrollView>
    );
  }

  async function saveEvidence() {
    if (saving || reflection.trim().length === 0 || !challenge || typeof taskId !== "string") return;
    setSaving(true);
    setMessage("");
    try {
      await createEvidenceItemWithOfflineFallback({
        title: `Challenge evidence: ${challenge.displayTitle}`,
        notes: [
          `Reflection: ${reflection.trim()}`,
          evidenceNote.trim() ? `Evidence note: ${evidenceNote.trim()}` : "",
          `Evidence task: ${challenge.evidenceTask}`,
        ].filter(Boolean).join("\n"),
        evidence_type: "self_report_interview",
        purpose: `Complete daily challenge: ${challenge.displayTitle}`,
        structured_data: {
          task_id: taskId,
          task_title: typeof taskTitle === "string" ? taskTitle : challenge.displayTitle,
          challenge_id: challenge.id,
          challenge_type: challenge.challengeType,
          challenge_category: challenge.category,
          reflection,
          evidence_note: evidenceNote,
          source: "daily_challenge_evidence_screen",
        },
      });

      router.push({
        pathname: "/parent/daily-challenges/complete",
        params: { id: challenge.id, taskId, taskTitle: typeof taskTitle === "string" ? taskTitle : challenge.displayTitle },
      } as unknown as Href);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save challenge evidence.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.screen}>
      <DailyChallengeHeader title={challenge.displayTitle} subtitle="Reflection and evidence" />

      <View style={styles.softCard}>
        <View style={styles.row}>
          <Text style={styles.pill}>1 Reflect</Text>
          <Text style={styles.pill}>2 Evidence</Text>
          <Text style={styles.pill}>3 Complete</Text>
        </View>
        <Text style={styles.body}>{challenge.reflectionQuestions[0]}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How did it go?</Text>
        <TextInput
          value={reflection}
          onChangeText={setReflection}
          placeholder="Share what you did, how your child responded, and how you felt."
          placeholderTextColor={dailyChallengeColors.muted}
          multiline
          maxLength={300}
          style={styles.input}
        />
        <Text style={[styles.muted, { textAlign: "right" }]}>{reflection.length}/300</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add evidence</Text>
        <Text style={styles.body}>{challenge.evidenceTask}</Text>
        <TextInput
          value={evidenceNote}
          onChangeText={setEvidenceNote}
          placeholder="Write a short factual evidence note. File upload can be added from the main Evidence screen."
          placeholderTextColor={dailyChallengeColors.muted}
          multiline
          style={styles.input}
        />
        <View style={styles.row}>
          {[
            ["camera", "Photo"],
            ["video", "Video"],
            ["microphone", "Voice note"],
          ].map(([icon, label]) => (
            <View key={label} style={[styles.softCard, { flex: 1, minWidth: 96, alignItems: "center" }]}>
              <MaterialCommunityIcons name={icon as never} size={26} color={dailyChallengeColors.teal} />
              <Text style={styles.muted}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        disabled={saving || reflection.trim().length === 0}
        onPress={saveEvidence}
        style={[styles.button, (saving || reflection.trim().length === 0) && { opacity: 0.65 }]}
      >
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Save Evidence and Continue</Text>}
      </Pressable>

      <Link
        href={{
          pathname: "/evidence",
          params: { taskId, taskTitle: typeof taskTitle === "string" ? taskTitle : challenge.displayTitle, challengeId: challenge.id },
        } as unknown as Href}
        asChild
      >
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open Full Evidence Upload</Text>
        </Pressable>
      </Link>

      {message ? <Text style={styles.muted}>{message}</Text> : null}
    </ScrollView>
  );
}
