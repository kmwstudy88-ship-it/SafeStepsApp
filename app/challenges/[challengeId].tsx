import { Link, Redirect, type Href, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "../../lib/auth";
import { getParentChallengeById } from "../../lib/data/safestepsParentChallenges";
import {
  createUserTaskFromParentChallenge,
  fetchParentChallengeTask,
  type UserTask,
} from "../../lib/engines/taskEngine";
import { globalStyles } from "../../lib/styles";

export default function ChallengeDetailScreen() {
  const { initializing, user } = useAuth();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const challenge = getParentChallengeById(String(challengeId ?? ""));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [task, setTask] = useState<UserTask | null>(null);
  const [checkingTask, setCheckingTask] = useState(true);

  useEffect(() => {
    let active = true;
    if (!challenge) {
      setCheckingTask(false);
      return;
    }

    fetchParentChallengeTask(challenge.id)
      .then((result) => {
        if (active) setTask(result);
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not check challenge status.");
      })
      .finally(() => {
        if (active) setCheckingTask(false);
      });

    return () => {
      active = false;
    };
  }, [challenge]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  if (!challenge) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Challenge not found</Text>
        <Link href={"/challenges" as Href} asChild><Pressable style={globalStyles.button}><Text style={globalStyles.buttonText}>Back to Challenges</Text></Pressable></Link>
      </ScrollView>
    );
  }

  async function addToTasks() {
    if (saving || !challenge) return;
    setSaving(true);
    setMessage("");
    try {
      const savedTask = await createUserTaskFromParentChallenge(challenge.id);
      setTask(savedTask);
      setMessage(savedTask.status === "completed" ? "You have already completed this challenge." : "Challenge is in your tasks.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add challenge.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Link href={"/challenges" as Href} asChild>
        <Pressable><Text style={globalStyles.mutedText}>Back to Challenges</Text></Pressable>
      </Link>
      <Text style={globalStyles.title}>{challenge.displayTitle}</Text>
      <View style={globalStyles.inlineRow}>
        <Text style={globalStyles.pill}>{challenge.challengeType}</Text>
        <Text style={globalStyles.pill}>{challenge.estimatedTime}</Text>
        <Text style={globalStyles.pill}>{challenge.category}</Text>
      </View>
      <Text style={globalStyles.subtitle}>{challenge.purpose}</Text>

      <Section title="Before you start" items={[challenge.quickQuestionBeforeChallenge]} />
      <Section title="Challenge steps" items={challenge.challengeSteps} numbered />
      <Section title="Reflection" items={challenge.reflectionQuestions} />
      <Section title="Evidence task" items={[challenge.evidenceTask]} />
      <Section title="Completion checklist" items={challenge.completionChecklist} />

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Safety</Text>
        <Text style={globalStyles.cardText}>{challenge.safetyNote}</Text>
      </View>

      {checkingTask ? (
        <ActivityIndicator />
      ) : task ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>
            {task.status === "completed" ? "Challenge completed" : "Challenge added"}
          </Text>
          <Text style={globalStyles.cardText}>
            {task.status === "completed"
              ? "This challenge is recorded as completed in your task history."
              : "Continue this challenge from My Tasks and attach evidence when ready."}
          </Text>
          <Link href={"/tasks" as Href} asChild>
            <Pressable style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Open My Tasks</Text>
            </Pressable>
          </Link>
          {task.evidence_required && task.status !== "completed" ? (
            <Link
              href={{
                pathname: "/evidence",
                params: {
                  taskId: task.id,
                  taskTitle: task.title,
                  challengeId: challenge.id,
                },
              } as unknown as Href}
              asChild
            >
              <Pressable style={globalStyles.secondaryButton}>
                <Text style={globalStyles.secondaryButtonText}>Add Evidence</Text>
              </Pressable>
            </Link>
          ) : null}
        </View>
      ) : (
        <Pressable disabled={saving} onPress={addToTasks} style={[globalStyles.button, saving && globalStyles.buttonDisabled]}>
          <Text style={globalStyles.buttonText}>{saving ? "Adding..." : "Add Challenge to My Tasks"}</Text>
        </Pressable>
      )}
      {message ? <Text selectable style={globalStyles.notice}>{message}</Text> : null}
    </ScrollView>
  );
}

function Section({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) {
  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.cardTitle}>{title}</Text>
      {items.map((item, index) => (
        <Text key={`${title}-${index}`} style={globalStyles.cardText}>
          {numbered ? `${index + 1}. ` : "• "}{item}
        </Text>
      ))}
    </View>
  );
}
