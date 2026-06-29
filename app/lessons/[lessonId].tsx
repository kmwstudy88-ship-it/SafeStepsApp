import React, { useEffect, useState } from "react";
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
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

  const featureSection = lesson.sections[0];
  const detailSections = lesson.sections.slice(1);

  return (
    <ImageBackground
      source={require("../../assets/safesteps-course-background.png")}
      resizeMode="cover"
      style={globalStyles.courseBackground}
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.courseScreen}>
        <View style={globalStyles.courseHeader}>
          <Text style={globalStyles.courseEyebrow}>LESSON {lesson.week}</Text>
          <View style={globalStyles.courseRule} />
          <Text style={globalStyles.courseTitle}>{lesson.title}</Text>
          <Text style={globalStyles.courseSubtitle}>{lesson.summary}</Text>
        </View>

        <View style={globalStyles.courseInfoRow}>
          <Text style={globalStyles.pill}>Week {lesson.week}</Text>
          <Text style={globalStyles.pill}>{lesson.estimatedMinutes} minutes</Text>
          <Text style={completed ? globalStyles.pillSuccess : globalStyles.pill}>
            {completed ? "Complete" : "In progress"}
          </Text>
        </View>

        {featureSection ? (
          <View style={globalStyles.courseFeatureCard}>
            <View style={globalStyles.courseFeatureIcon}>
              <Text style={globalStyles.courseFeatureIconText}>S</Text>
            </View>
            <View style={globalStyles.courseFeatureCopy}>
              <Text style={globalStyles.courseSectionTitle}>{featureSection.heading}</Text>
              <Text style={globalStyles.courseBody}>{featureSection.body}</Text>
            </View>
          </View>
        ) : null}

        {detailSections.length ? (
          <View style={globalStyles.courseBlock}>
            <Text style={globalStyles.courseBlockTitle}>Key lesson points</Text>
            <View style={globalStyles.courseGrid}>
              {detailSections.map((section) => (
                <View key={section.heading} style={globalStyles.coursePointCard}>
                  <Text style={globalStyles.courseSectionTitle}>{section.heading}</Text>
                  <Text style={globalStyles.courseBody}>{section.body}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={globalStyles.courseBlock}>
          <Text style={globalStyles.courseBlockTitle}>How to apply this in {lesson.actions.length} steps</Text>
          {lesson.actions.map((action, index) => (
            <View key={action} style={globalStyles.courseStepRow}>
              <View style={globalStyles.courseStepNumber}>
                <Text style={globalStyles.courseStepNumberText}>{index + 1}</Text>
              </View>
              <Text style={globalStyles.courseStepText}>{action}</Text>
            </View>
          ))}
        </View>

        {message ? <Text style={message.startsWith("Lesson") ? globalStyles.notice : globalStyles.error}>{message}</Text> : null}

        <TouchableOpacity
          disabled={completed}
          onPress={handleComplete}
          style={[completed ? globalStyles.secondaryButton : globalStyles.button, completed && globalStyles.buttonDisabled]}
        >
          <Text style={completed ? globalStyles.secondaryButtonText : globalStyles.buttonText}>
            {completed ? "Completed" : "Mark lesson complete"}
          </Text>
        </TouchableOpacity>

        <AppBottomNav />
      </ScrollView>
    </ImageBackground>
  );
}
