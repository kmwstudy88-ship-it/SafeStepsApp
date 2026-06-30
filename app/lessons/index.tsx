import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link, Redirect } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { appLessons } from "../../lib/lessonContent";
import { getCompletedLessonIds } from "../../lib/platformData";
import { globalStyles } from "../../lib/styles";

export default function LessonsScreen() {
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    getCompletedLessonIds(userId).then(setCompletedLessonIds);
  }, [userId]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Lessons</Text>
      <Text style={globalStyles.subtitle}>Start with the core SafeSteps lessons and mark them complete as you go.</Text>

      {appLessons.map((lesson) => (
        <Link
          key={lesson.id}
          href={{ pathname: "/lessons/[lessonId]", params: { lessonId: lesson.id } }}
          asChild
        >
          <TouchableOpacity style={globalStyles.card}>
            <View style={globalStyles.inlineRow}>
              <Text style={globalStyles.cardTitle}>Week {lesson.week}</Text>
              {completedLessonIds.has(lesson.id) ? <Text style={globalStyles.notice}>Complete</Text> : null}
            </View>
            <Text style={globalStyles.cardTitle}>{lesson.title}</Text>
            <Text style={globalStyles.cardText}>{lesson.summary}</Text>
            <Text style={globalStyles.mutedText}>{lesson.estimatedMinutes} min</Text>
          </TouchableOpacity>
        </Link>
      ))}
      <AppBottomNav />
    </ScrollView>
  );
}
