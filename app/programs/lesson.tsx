import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { saveDailyLessonRecord } from "../../lib/engines/lessonSaveEngine";

export default function DailyLessonPlayerScreen() {
  const params = useLocalSearchParams();

  const programId = String(params.programId ?? "unknown-program");
  const programTitle = String(params.programTitle ?? "Program");
  const monthNumber = String(params.monthNumber ?? "0");
  const monthTopic = String(params.monthTopic ?? "Monthly Topic");
  const weekNumber = String(params.weekNumber ?? "0");
  const weekSubTopic = String(params.weekSubTopic ?? "Weekly Sub Topic");
  const day = String(params.day ?? "0");
  const lessonTitle = String(params.lessonTitle ?? "Daily Lesson");
  const lessonCheckpoint = String(
    params.lessonCheckpoint ??
      "Name one idea from this lesson that could help family growth, safety, or child wellbeing.",
  );
  const scenarioPrompt = String(
    params.scenarioPrompt ??
      "Imagine this lesson comes up during a stressful family moment. What would be a safe, respectful next step?",
  );
  const practiceTask = String(
    params.practiceTask ??
      "Practise one small real-world action from this lesson and record what happened factually.",
  );

  const [startReflection, setStartReflection] = useState("");
  const [confidenceBefore, setConfidenceBefore] = useState("");
  const [knowledgeCheckpointDone, setKnowledgeCheckpointDone] = useState(false);
  const [scenarioCheckpointDone, setScenarioCheckpointDone] = useState(false);
  const [practicalActivity, setPracticalActivity] = useState("");
  const [endReflection, setEndReflection] = useState("");
  const [confidenceAfter, setConfidenceAfter] = useState("");

  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedRecordId, setSavedRecordId] = useState("");

  const beforeNumber = Number(confidenceBefore);
  const afterNumber = Number(confidenceAfter);

  const validConfidenceBefore =
    Number.isInteger(beforeNumber) && beforeNumber >= 1 && beforeNumber <= 10;

  const validConfidenceAfter =
    Number.isInteger(afterNumber) && afterNumber >= 1 && afterNumber <= 10;

  const canCompleteLesson = useMemo(() => {
    return (
      startReflection.trim().length > 0 &&
      validConfidenceBefore &&
      knowledgeCheckpointDone &&
      scenarioCheckpointDone &&
      practicalActivity.trim().length > 0 &&
      endReflection.trim().length > 0 &&
      validConfidenceAfter
    );
  }, [
    startReflection,
    validConfidenceBefore,
    knowledgeCheckpointDone,
    scenarioCheckpointDone,
    practicalActivity,
    endReflection,
    validConfidenceAfter,
  ]);

  async function handleCompleteLesson() {
    if (!canCompleteLesson || saving) return;

    setSaving(true);
    setSaveError("");

    try {
      const saved = await saveDailyLessonRecord({
        program_id: programId,
        program_title: programTitle,
        month_number: Number(monthNumber),
        month_topic: monthTopic,
        week_number: Number(weekNumber),
        week_sub_topic: weekSubTopic,
        day_number: Number(day),
        lesson_title: lessonTitle,
        start_reflection: startReflection.trim(),
        confidence_before: beforeNumber,
        knowledge_checkpoint_done: knowledgeCheckpointDone,
        scenario_checkpoint_done: scenarioCheckpointDone,
        practical_activity: practicalActivity.trim(),
        end_reflection: endReflection.trim(),
        confidence_after: afterNumber,
        completed: true,
      });

      setSavedRecordId(saved.id);
      setLessonCompleted(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving this lesson."
      );
    } finally {
      setSaving(false);
    }
  }

  function RequirementItem({
    done,
    label,
  }: {
    done: boolean;
    label: string;
  }) {
    return (
      <Text style={{ marginBottom: 4 }}>
        {done ? "[x]" : "[ ]"} {label}
      </Text>
    );
  }

  function Section({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <View
        style={{
          padding: 16,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: "#d8e5dd",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          {title}
        </Text>
        {children}
      </View>
    );
  }

  function Field({
    value,
    onChangeText,
    placeholder,
    multiline = true,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
  }) {
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={multiline ? "default" : "numeric"}
        style={{
          minHeight: multiline ? 90 : 50,
          borderWidth: 1,
          borderColor: "#cbd8d0",
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
          backgroundColor: "#f9fbfa",
          textAlignVertical: "top",
        }}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 6 }}>
        {lessonTitle}
      </Text>

      <Text style={{ marginBottom: 16 }}>
        {programTitle} - Month {monthNumber} - Week {weekNumber} - Day {day}
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Lesson Completion Requirements
        </Text>

        <View style={{ marginTop: 10 }}>
          <RequirementItem
            done={startReflection.trim().length > 0}
            label="Start reflection answered"
          />
          <RequirementItem
            done={validConfidenceBefore}
            label="Before confidence rating entered between 1 and 10"
          />
          <RequirementItem
            done={knowledgeCheckpointDone}
            label="Knowledge checkpoint completed"
          />
          <RequirementItem
            done={scenarioCheckpointDone}
            label="Scenario checkpoint completed"
          />
          <RequirementItem
            done={practicalActivity.trim().length > 0}
            label="Real-world activity recorded"
          />
          <RequirementItem
            done={endReflection.trim().length > 0}
            label="End reflection answered"
          />
          <RequirementItem
            done={validConfidenceAfter}
            label="After confidence rating entered between 1 and 10"
          />
        </View>
      </View>

      <Section title="Monthly Topic">
        <Text>{monthTopic}</Text>
        <Text style={{ marginTop: 8 }}>
          Parents answer what this monthly topic means to them before beginning
          the month. There are no right or wrong answers.
        </Text>
      </Section>

      <Section title="Weekly Sub-Topic">
        <Text>{weekSubTopic}</Text>
        <Text style={{ marginTop: 8 }}>
          Parents answer what this weekly sub-topic means to them before
          beginning the week.
        </Text>
      </Section>

      <Section title="Start of Daily Lesson">
        <Text style={{ fontWeight: "bold" }}>
          What does {lessonTitle.toLowerCase()} mean to you today?
        </Text>

        <Field
          value={startReflection}
          onChangeText={setStartReflection}
          placeholder="Type your answer here. There are no right or wrong answers."
        />

        <Text style={{ marginTop: 12, fontWeight: "bold" }}>
          How confident do you feel before this lesson? 1 to 10
        </Text>

        <Field
          value={confidenceBefore}
          onChangeText={setConfidenceBefore}
          placeholder="Enter a number from 1 to 10"
          multiline={false}
        />
      </Section>

      <Section title="30 Minute Lesson Content">
        <Text>
          Focus on one practical action from {monthTopic.toLowerCase()}. Connect it to the weekly focus,{" "}
          {weekSubTopic.toLowerCase()}, and keep the practice small enough to complete safely.
        </Text>
        <Text style={{ marginTop: 8 }}>
          Use this lesson to notice what your child may experience, what your body does under pressure, what support
          you can use, and what evidence would show reliable change without promising any reunification outcome.
        </Text>
      </Section>

      <Section title="Checkpoint 1: Knowledge Check">
        <Text style={{ marginBottom: 10 }}>
          This checkpoint confirms the parent has engaged with the lesson
          content. This is for learning, not punishment.
        </Text>

        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
          Question:
        </Text>

        <Text style={{ marginBottom: 10 }}>
          {lessonCheckpoint}
        </Text>

        <Pressable
          onPress={() => setKnowledgeCheckpointDone(true)}
          style={{
            padding: 12,
            borderRadius: 10,
            backgroundColor: knowledgeCheckpointDone ? "#dcefe8" : "#eef3f5",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
            {knowledgeCheckpointDone
              ? "Knowledge Check Completed"
              : "Mark Knowledge Check Complete"}
          </Text>
        </Pressable>
      </Section>

      <Section title="Checkpoint 2: Scenario Exercise">
        <Text style={{ marginBottom: 10 }}>
          This checkpoint asks the parent to apply the lesson to a realistic
          family situation.
        </Text>

        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
          Scenario:
        </Text>

        <Text style={{ marginBottom: 10 }}>
          {scenarioPrompt}
        </Text>

        <Pressable
          onPress={() => setScenarioCheckpointDone(true)}
          style={{
            padding: 12,
            borderRadius: 10,
            backgroundColor: scenarioCheckpointDone ? "#dcefe8" : "#eef3f5",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
            {scenarioCheckpointDone
              ? "Scenario Exercise Completed"
              : "Mark Scenario Exercise Complete"}
          </Text>
        </Pressable>
      </Section>

      <Section title="Real-World Practice Activity">
        <Text style={{ fontWeight: "bold" }}>
          What practical activity did you complete for this lesson?
        </Text>

        <Text style={{ marginTop: 6 }}>
          {practiceTask}
        </Text>

        <Field
          value={practicalActivity}
          onChangeText={setPracticalActivity}
          placeholder="Describe what you practised in real life."
        />
      </Section>

      <Section title="End Reflection">
        <Text style={{ fontWeight: "bold" }}>
          What did you learn from today's lesson?
        </Text>

        <Field
          value={endReflection}
          onChangeText={setEndReflection}
          placeholder="Write what changed, what you noticed, or what you learned."
        />

        <Text style={{ marginTop: 12, fontWeight: "bold" }}>
          How confident do you feel after this lesson? 1 to 10
        </Text>

        <Field
          value={confidenceAfter}
          onChangeText={setConfidenceAfter}
          placeholder="Enter a number from 1 to 10"
          multiline={false}
        />
      </Section>

      {saveError.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ffecec",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Save Error</Text>
          <Text style={{ marginTop: 6 }}>{saveError}</Text>
        </View>
      )}

      {lessonCompleted ? (
        <View
          style={{
            padding: 16,
            backgroundColor: "#dcefe8",
            borderRadius: 12,
            marginBottom: 40,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Lesson Completed and Saved
          </Text>
          <Text style={{ marginTop: 6 }}>
            This lesson has been saved to Supabase and can now be used in the
            Growth Timeline and Reports.
          </Text>
          {savedRecordId.length > 0 && (
            <Text style={{ marginTop: 6 }}>Record saved successfully.</Text>
          )}
        </View>
      ) : (
        <Pressable
          disabled={!canCompleteLesson || saving}
          onPress={handleCompleteLesson}
          style={{
            padding: 14,
            backgroundColor: canCompleteLesson ? "#dcefe8" : "#e5e5e5",
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={{
                fontWeight: "bold",
                color: canCompleteLesson ? "#000000" : "#777777",
              }}
            >
              {canCompleteLesson
                ? "Complete and Save Lesson"
                : "Complete all required steps first"}
            </Text>
          )}
        </Pressable>
      )}
    </ScrollView>
  );
}
