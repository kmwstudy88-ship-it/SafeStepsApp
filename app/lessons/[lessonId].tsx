import React, { useEffect, useState } from "react";
import { ImageBackground, ScrollView, Text } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";

import { SafeStepsSingleLessonExperience } from "../../components/SafeStepsLessonExperience";
import { useAuth } from "../../lib/auth";
import { getLessonById } from "../../lib/lessonContent";
import { completeLesson, getCompletedLessonIds } from "../../lib/platformData";
import { globalStyles } from "../../lib/styles";

export default function LessonDetailScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const lesson = getLessonById(lessonId);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId || !lesson) return;

    getCompletedLessonIds(userId).then((lessonIds) => {
      setCompleted(lessonIds.has(lesson.id));
    });
  }, [lesson, userId]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!lesson) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Lesson not found</Text>
        <Text style={globalStyles.subtitle}>This lesson is not available in the active SafeSteps library.</Text>
      </ScrollView>
    );
  }

  const handleComplete = async () => {
    setMessage("");

    try {
      await completeLesson(user.id, lesson.id, lesson.title);
      setCompleted(true);
      setMessage("Lesson marked complete.");
    } catch {
      setMessage("Could not save lesson completion yet. Try again shortly.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/safesteps-course-background.png")}
      resizeMode="cover"
      style={globalStyles.courseBackground}
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.courseScreen}>
        {message ? <Text style={message.startsWith("Lesson") ? globalStyles.notice : globalStyles.error}>{message}</Text> : null}
        <SafeStepsSingleLessonExperience
          lesson={{
            id: lesson.id,
            title: lesson.title,
            summary: lesson.summary,
            estimatedMinutes: lesson.estimatedMinutes,
            moduleTitle: `Week ${lesson.week}`,
            courseTitle: "SafeSteps Lessons",
            goals: lesson.sections.slice(0, 3).map((section) => section.heading),
            parentMeaningPrompt: lesson.sections[0]?.body ?? lesson.summary,
            completionLabel: completed ? "Completed" : "Complete Lesson",
            completionMessage: "Lesson marked complete.",
            onComplete: completed ? undefined : handleComplete,
          }}
        />
      </ScrollView>
    </ImageBackground>
  );
}
