import { Link, Redirect, type Href } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { fetchUserTasks, type UserTask } from "../../../lib/engines/taskEngine";
import { DailyChallengeHeader, dailyChallengeStyles as styles } from "../../../components/dailyChallenges/shared";

export default function DailyChallengeHistory() {
  const { initializing, user } = useAuth();
  const [tasks, setTasks] = useState<UserTask[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchUserTasks().then((result) =>
      setTasks(result.filter((task) => task.related_lesson_id?.startsWith("challenge:"))),
    );
  }, [user]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <DailyChallengeHeader title="History" subtitle="Completed challenge tasks and evidence-backed progress." />
      {tasks.length === 0 ? (
        <View style={styles.card}><Text style={styles.body}>No challenge history yet.</Text></View>
      ) : tasks.map((task) => (
        <View key={task.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{task.title}</Text>
            <Text style={task.status === "completed" ? styles.pill : styles.muted}>{task.status.replace("_", " ")}</Text>
          </View>
          <Text style={styles.muted}>{task.completed_at ? new Date(task.completed_at).toLocaleString() : "Evidence or completion still pending"}</Text>
        </View>
      ))}
      <Link href={"/parent/daily-challenges" as Href} asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Back to Challenges</Text></Pressable>
      </Link>
    </ScrollView>
  );
}
