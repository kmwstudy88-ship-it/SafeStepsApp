import React, { useMemo, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link, Redirect, useLocalSearchParams } from "expo-router";

import { AppBottomNav } from "../../../../components/AppBottomNav";
import { SafeStepsSingleLessonExperience } from "../../../../components/SafeStepsLessonExperience";
import { useAuth } from "../../../../lib/auth";
import {
  getProgramById,
  getProgramWeekPlan,
  saveDailyProgramLessonCompletion,
} from "../../../../lib/platformData";
import { getSafeStepsLessonWatercolorPalette, safestepsLessonTheme } from "../../../../lib/safestepsLessonTheme";
import { globalStyles } from "../../../../lib/styles";

export default function DailyProgramLessonScreen() {
  const { initializing, user } = useAuth();
  const { programId, weekId, dayId } = useLocalSearchParams<{ programId: string; weekId: string; dayId: string }>();
  const program = getProgramById(programId);
  const week = getProgramWeekPlan(programId, weekId);
  const dayNumber = Number(dayId);
  const lesson = useMemo(
    () => week?.dailyLessons.find((item) => item.dayNumber === dayNumber) ?? null,
    [dayNumber, week],
  );
  const [meaningResponse, setMeaningResponse] = useState("");
  const [checkpointResponse, setCheckpointResponse] = useState("");
  const [scenarioResponse, setScenarioResponse] = useState("");
  const [practiceResponse, setPracticeResponse] = useState("");
  const [endReflection, setEndReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const palette = getSafeStepsLessonWatercolorPalette(`${programId}-${weekId}-${dayId}`);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!program || !week || !lesson) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.courseScreen}>
        <Text style={styles.title}>Daily lesson not found</Text>
        <Text style={styles.subtitle}>Choose another program week.</Text>
        <Link href="/programs" asChild>
          <TouchableOpacity style={[styles.button, { backgroundColor: safestepsLessonTheme.colors.purpleDark }]}>
            <Text style={styles.buttonText}>Back to programs</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    );
  }

  const handleComplete = async () => {
    setSaving(true);
    setMessage("");

    try {
      await saveDailyProgramLessonCompletion(user.id, {
        programId: program.id,
        programTitle: program.title,
        week,
        dayNumber: lesson.dayNumber,
        meaningResponse,
        checkpointResponse,
        scenarioResponse,
        practiceResponse,
        endReflection,
      });
      setMeaningResponse("");
      setCheckpointResponse("");
      setScenarioResponse("");
      setPracticeResponse("");
      setEndReflection("");
      setMessage("Daily lesson saved to reflections, timeline, and progress.");
    } catch {
      setMessage("Could not save this daily lesson yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../../assets/safesteps-course-background.png")}
      resizeMode="cover"
      style={globalStyles.courseBackground}
    >
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.courseScreen}>
      <SafeStepsSingleLessonExperience
        lesson={{
          id: `${program.id}-${week.weekNumber}-${lesson.dayNumber}`,
          title: lesson.title,
          summary: week.focus,
          estimatedMinutes: lesson.durationMinutes,
          moduleTitle: week.title,
          courseTitle: program.title,
          goals: [lesson.checkpoint, lesson.practiceTask, week.evidencePrompt],
          parentMeaningPrompt: lesson.meaningPrompt,
        }}
      />

      <View style={styles.inlineRow}>
        <Text style={[styles.pill, { backgroundColor: palette.washStrong, color: palette.accentDark }]}>{program.title}</Text>
        <Text style={[styles.pill, { backgroundColor: palette.washStrong, color: palette.accentDark }]}>{week.title}</Text>
        <Text style={[styles.pill, { backgroundColor: palette.washStrong, color: palette.accentDark }]}>Day {lesson.dayNumber}</Text>
        <Text style={[styles.pill, { backgroundColor: palette.washStrong, color: palette.accentDark }]}>{lesson.durationMinutes} min</Text>
      </View>

      <Text style={styles.title}>{lesson.title} reflection record</Text>
      <Text style={styles.subtitle}>{week.focus}</Text>

      <View style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <Text style={styles.cardTitle}>Before the lesson</Text>
        <Text style={styles.cardText}>{lesson.meaningPrompt}</Text>
        <TextInput
          multiline
          onChangeText={setMeaningResponse}
          placeholderTextColor={safestepsLessonTheme.colors.muted}
          placeholder="There are no right or wrong answers."
          style={[styles.input, styles.textArea]}
          value={meaningResponse}
        />
      </View>

      <View style={[styles.card, { backgroundColor: palette.wash }]}>
        <View style={[styles.cardAccent, { backgroundColor: palette.highlight }]} />
        <Text style={styles.cardTitle}>30-minute lesson</Text>
        <Text style={styles.cardText}>
          Focus on one practical idea from {week.monthTopic.toLowerCase()}. Notice what this skill looks like in your family, what makes it easier, and what makes it hard to use.
        </Text>
        <Text style={styles.cardText}>
          Keep the goal small: one conversation, one routine, one calmer response, or one repair attempt is enough for today&apos;s practice.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <Text style={styles.cardTitle}>Knowledge checkpoint</Text>
        <Text style={styles.cardText}>{lesson.checkpoint}</Text>
        <TextInput
          multiline
          onChangeText={setCheckpointResponse}
          placeholderTextColor={safestepsLessonTheme.colors.muted}
          placeholder="Write your answer."
          style={[styles.input, styles.textArea]}
          value={checkpointResponse}
        />
      </View>

      <View style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <Text style={styles.cardTitle}>Scenario checkpoint</Text>
        <Text style={styles.cardText}>
          Imagine this topic comes up during a stressful family moment. What would be a safe, respectful next step?
        </Text>
        <TextInput
          multiline
          onChangeText={setScenarioResponse}
          placeholderTextColor={safestepsLessonTheme.colors.muted}
          placeholder="Describe what you would try and why."
          style={[styles.input, styles.textArea]}
          value={scenarioResponse}
        />
      </View>

      <View style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <Text style={styles.cardTitle}>Real-world practice</Text>
        <Text style={styles.cardText}>{lesson.practiceTask}</Text>
        <TextInput
          multiline
          onChangeText={setPracticeResponse}
          placeholderTextColor={safestepsLessonTheme.colors.muted}
          placeholder="What happened when you tried it?"
          style={[styles.input, styles.textArea]}
          value={practiceResponse}
        />
      </View>

      <View style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <Text style={styles.cardTitle}>End reflection</Text>
        <Text style={styles.cardText}>What did you learn, practise, or notice after today&apos;s lesson?</Text>
        <TextInput
          multiline
          onChangeText={setEndReflection}
          placeholderTextColor={safestepsLessonTheme.colors.muted}
          placeholder="Write your end reflection."
          style={[styles.input, styles.textArea]}
          value={endReflection}
        />
      </View>

      {message ? <Text style={message.startsWith("Could") ? globalStyles.error : styles.notice}>{message}</Text> : null}

      <TouchableOpacity
        disabled={saving}
        onPress={handleComplete}
        style={[styles.button, { backgroundColor: palette.accentDark }, saving && globalStyles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Complete daily lesson"}</Text>
      </TouchableOpacity>

      <AppBottomNav />
    </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  courseScreen: {
    padding: 20,
    gap: 18,
    backgroundColor: safestepsLessonTheme.colors.background,
  },
  inlineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  pill: {
    borderRadius: safestepsLessonTheme.radius.pill,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontWeight: "800",
  },
  title: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
  },
  card: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 20,
    gap: 12,
    backgroundColor: safestepsLessonTheme.colors.card,
    ...safestepsLessonTheme.shadow,
  },
  cardAccent: {
    width: 52,
    height: 7,
    borderRadius: safestepsLessonTheme.radius.pill,
  },
  cardTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  cardText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.line,
    borderRadius: safestepsLessonTheme.radius.small,
    padding: 14,
    backgroundColor: safestepsLessonTheme.colors.white,
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
  },
  textArea: {
    minHeight: 118,
    textAlignVertical: "top",
  },
  notice: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "800",
    textAlign: "center",
  },
  button: {
    minHeight: 64,
    borderRadius: safestepsLessonTheme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    ...safestepsLessonTheme.shadow,
  },
  buttonText: {
    color: safestepsLessonTheme.colors.white,
    fontSize: 20,
    fontWeight: "900",
  },
});
