import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getLesson, saveReflection } from "../../lib/platform/data";
import { completeLessonAndUnlockNext, markLessonInProgress } from "../../lib/platform/progress";
import { getNextLessonStep, getPreviousLessonStep, isCheckpointCorrect, stepLabel } from "../../lib/platform/lessonFlow";
import type { LessonFlowStep, LessonRecord } from "../../lib/platform/types";
import { getSafeStepsLessonWatercolorPalette, safestepsLessonTheme } from "../../lib/safestepsLessonTheme";

export default function LessonPlayerScreen() {
  const params = useLocalSearchParams<{ lessonId: string; enrolmentId?: string }>();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const enrolmentId = Array.isArray(params.enrolmentId) ? params.enrolmentId[0] : params.enrolmentId;

  const [lesson, setLesson] = useState<LessonRecord | null>(null);
  const [step, setStep] = useState<LessonFlowStep>("reflection");
  const [reflection, setReflection] = useState("");
  const [endReflection, setEndReflection] = useState("");
  const [checkpointAnswer, setCheckpointAnswer] = useState("");
  const [scenarioAnswer, setScenarioAnswer] = useState("");
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!lessonId) throw new Error("Missing lesson ID.");
        const data = await getLesson(lessonId);
        if (mounted) setLesson(data);
        if (enrolmentId) await markLessonInProgress(enrolmentId, lessonId, "reflection");
      } catch (error) {
        Alert.alert("Lesson error", error instanceof Error ? error.message : "Could not load lesson.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [lessonId, enrolmentId]);

  const progressText = useMemo(() => stepLabel(step), [step]);
  const palette = useMemo(() => getSafeStepsLessonWatercolorPalette(lesson?.id ?? lessonId ?? "lesson"), [lesson?.id, lessonId]);
  const steps: LessonFlowStep[] = ["reflection", "content", "checkpoint", "scenario", "practice", "end_reflection"];
  const stepIndex = Math.max(steps.indexOf(step), 0);

  async function goNext() {
    if (!lessonId || !lesson) return;

    try {
      setSaving(true);
      setFeedback("");

      if (step === "reflection") {
        if (!reflection.trim()) throw new Error("Add a short start reflection first.");
        await saveReflection({ enrolmentId, lessonId, phase: "start", prompt: "What are you noticing before this lesson?", answer: reflection });
      }

      if (step === "checkpoint") {
        const correct = isCheckpointCorrect(lesson.checkpoint, checkpointAnswer);
        if (correct === false) {
          setFeedback(lesson.checkpoint?.explanation || "Review the lesson content and try again.");
          return;
        }
      }

      if (step === "end_reflection") {
        if (!endReflection.trim()) throw new Error("Add an end reflection before completing.");
        await saveReflection({ enrolmentId, lessonId, phase: "end", prompt: "What will you practice after this lesson?", answer: endReflection });
        if (enrolmentId) await completeLessonAndUnlockNext(enrolmentId, lessonId);
        Alert.alert("Lesson complete", "Your reflection and progress have been saved.");
        router.back();
        return;
      }

      const next = getNextLessonStep(step);
      if (next) {
        setStep(next);
        if (enrolmentId) await markLessonInProgress(enrolmentId, lessonId, next);
      }
    } catch (error) {
      Alert.alert("Could not continue", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    const previous = getPreviousLessonStep(step);
    if (previous) setStep(previous);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text>Lesson was not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.pagePill}>Page {stepIndex + 1} of {steps.length}</Text>
      </View>
      <View style={styles.progressRow}>
        {steps.map((item, index) => (
          <View
            key={item}
            style={[
              styles.progressSegment,
              index <= stepIndex && { backgroundColor: palette.accent },
            ]}
          />
        ))}
      </View>
      <View style={[styles.heroWash, { backgroundColor: palette.wash }]}>
        <Text style={styles.kicker}>{progressText}</Text>
        <Text style={styles.brand}>SafeSteps</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        {!!lesson.summary && <Text style={styles.body}>{lesson.summary}</Text>}
      </View>

      {step === "reflection" && (
        <Card title="Start reflection" accent={palette.accent}>
          <Text style={styles.body}>Before learning, write what is happening for you right now and what you want to get from this lesson.</Text>
          <Input value={reflection} onChangeText={setReflection} placeholder="Write your reflection..." multiline />
        </Card>
      )}

      {step === "content" && (
        <Card title="Lesson content" accent={palette.accent}>
          <Text style={styles.content}>{lesson.content_markdown || "No lesson content has been added yet."}</Text>
        </Card>
      )}

      {step === "checkpoint" && (
        <Card title="Checkpoint" accent={palette.accent}>
          <Text style={styles.body}>{lesson.checkpoint?.question || "What is the most important part of this lesson?"}</Text>
          {(lesson.checkpoint?.options ?? []).map((option) => (
            <Pressable
              key={option}
              style={[styles.option, checkpointAnswer === option && { borderColor: palette.accent, backgroundColor: palette.wash }]}
              onPress={() => setCheckpointAnswer(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
          <Input value={checkpointAnswer} onChangeText={setCheckpointAnswer} placeholder="Your checkpoint answer..." />
          {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}
        </Card>
      )}

      {step === "scenario" && (
        <Card title="Scenario" accent={palette.accent}>
          <Text style={styles.body}>{lesson.scenario?.situation || "Scenario has not been added yet."}</Text>
          <Text style={styles.body}>{lesson.scenario?.question || "What would be the safest next step?"}</Text>
          <Input value={scenarioAnswer} onChangeText={setScenarioAnswer} placeholder="Write what you would do..." multiline />
        </Card>
      )}

      {step === "practice" && (
        <Card title={lesson.practice?.title || "Practice task"} accent={palette.accent}>
          <Text style={styles.body}>{lesson.practice?.instruction || "Write one practical step you will try today."}</Text>
          <Input value={practiceAnswer} onChangeText={setPracticeAnswer} placeholder="Write your practice plan..." multiline />
        </Card>
      )}

      {step === "end_reflection" && (
        <Card title="End reflection" accent={palette.accent}>
          <Text style={styles.body}>Finish by writing what changed in your thinking and what you will practice next.</Text>
          <Input value={endReflection} onChangeText={setEndReflection} placeholder="Write your end reflection..." multiline />
        </Card>
      )}

      <View style={styles.actions}>
        <Pressable style={[styles.secondaryButton, { borderColor: palette.accentDark }, !getPreviousLessonStep(step) && styles.disabled]} onPress={goBack} disabled={!getPreviousLessonStep(step)}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Pressable style={[styles.button, { backgroundColor: palette.accentDark }]} onPress={goNext} disabled={saving}>
          <Text style={styles.buttonText}>{step === "end_reflection" ? "Complete lesson" : saving ? "Saving..." : "Continue"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Card({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: accent }]} />
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} style={[styles.input, props.multiline && styles.multiline]} placeholderTextColor={safestepsLessonTheme.colors.muted} />;
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, backgroundColor: safestepsLessonTheme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  backButton: { width: 56, height: 56, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: safestepsLessonTheme.colors.card, ...safestepsLessonTheme.shadow },
  backButtonText: { color: safestepsLessonTheme.colors.purpleDark, fontSize: 30, fontWeight: "900" },
  pagePill: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12, overflow: "hidden", backgroundColor: safestepsLessonTheme.colors.lavender, color: safestepsLessonTheme.colors.purpleDark, fontWeight: "800" },
  progressRow: { flexDirection: "row", gap: 6 },
  progressSegment: { flex: 1, height: 8, borderRadius: 999, backgroundColor: safestepsLessonTheme.colors.line },
  heroWash: { borderRadius: 32, padding: 24, gap: 12, borderWidth: 1, borderColor: safestepsLessonTheme.colors.border },
  kicker: { color: safestepsLessonTheme.colors.purpleDark, fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  brand: { color: safestepsLessonTheme.colors.purpleDark, fontSize: 30, fontWeight: "800", textAlign: "center" },
  title: { color: safestepsLessonTheme.colors.navy, fontSize: 34, lineHeight: 40, fontWeight: "900", textAlign: "center" },
  body: { color: safestepsLessonTheme.colors.navy, fontSize: 16, lineHeight: 24 },
  content: { color: safestepsLessonTheme.colors.navy, fontSize: 16, lineHeight: 25, backgroundColor: safestepsLessonTheme.colors.white, padding: 14, borderRadius: 14 },
  card: { backgroundColor: safestepsLessonTheme.colors.card, borderRadius: 22, padding: 18, gap: 12, borderWidth: 1, borderColor: safestepsLessonTheme.colors.border },
  cardIcon: { width: 44, height: 6, borderRadius: 999 },
  cardTitle: { color: safestepsLessonTheme.colors.purpleDark, fontSize: 22, fontWeight: "800" },
  input: { borderWidth: 1, borderColor: safestepsLessonTheme.colors.line, borderRadius: 14, padding: 12, backgroundColor: safestepsLessonTheme.colors.white, color: safestepsLessonTheme.colors.navy, fontSize: 15 },
  multiline: { minHeight: 120, textAlignVertical: "top" },
  option: { padding: 12, borderWidth: 1, borderColor: safestepsLessonTheme.colors.line, borderRadius: 14, backgroundColor: safestepsLessonTheme.colors.white },
  optionText: { color: safestepsLessonTheme.colors.navy },
  feedback: { color: safestepsLessonTheme.colors.purpleDark, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12 },
  button: { flex: 1, padding: 15, borderRadius: 999, alignItems: "center" },
  buttonText: { color: safestepsLessonTheme.colors.white, fontWeight: "800" },
  secondaryButton: { flex: 1, backgroundColor: safestepsLessonTheme.colors.white, borderWidth: 1, padding: 15, borderRadius: 999, alignItems: "center" },
  secondaryButtonText: { color: safestepsLessonTheme.colors.purpleDark, fontWeight: "800" },
  disabled: { opacity: 0.4 },
});
