import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  monthlyReflectionQuestions,
  safestepsReflectionWorksheets,
  weeklyReflectionQuestions,
} from "../../lib/engines/reflectionEngine";
import { saveReflectionRecord } from "../../lib/engines/reflectionSaveEngine";

export default function ProgramReflectionScreen() {
  const params = useLocalSearchParams();

  const level = String(params.level ?? "month");
  const programId = String(params.programId ?? "unknown-program");
  const programTitle = String(params.programTitle ?? "Program");

  const monthNumber = params.monthNumber ? Number(params.monthNumber) : null;
  const monthTopic = String(params.monthTopic ?? "");

  const weekNumber = params.weekNumber ? Number(params.weekNumber) : null;
  const weekSubTopic = String(params.weekSubTopic ?? "");
  const [selectedWorksheetId, setSelectedWorksheetId] = useState("");

  const questions = useMemo(() => {
    const worksheet = safestepsReflectionWorksheets.find((item) => item.id === selectedWorksheetId);
    if (worksheet) return worksheet.prompts;

    return level === "week" ? weeklyReflectionQuestions : monthlyReflectionQuestions;
  }, [level, selectedWorksheetId]);

  const title =
    level === "week"
      ? `Week ${weekNumber}: ${weekSubTopic}`
      : `Month ${monthNumber}: ${monthTopic}`;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [confidence, setConfidence] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const confidenceNumber = Number(confidence);

  const validConfidence =
    Number.isInteger(confidenceNumber) &&
    confidenceNumber >= 1 &&
    confidenceNumber <= 10;

  const allAnswered = questions.every(
    (_question, index) => String(answers[index] ?? "").trim().length > 0
  );

  const canSave = allAnswered && validConfidence;

  function updateAnswer(index: number, value: string) {
    setAnswers((current) => ({
      ...current,
      [index]: value,
    }));
  }

  function selectWorksheet(worksheetId: string) {
    setSelectedWorksheetId(worksheetId);
    setAnswers({});
    setConfidence("");
  }

  async function handleSave() {
    if (!canSave || saving) return;

    setSaving(true);
    setError("");

    try {
      await saveReflectionRecord({
        program_id: programId,
        program_title: programTitle,
        reflection_level: level === "week" ? "week" : "month",
        month_number: monthNumber,
        month_topic: monthTopic,
        week_number: weekNumber,
        week_sub_topic: weekSubTopic,
        responses: questions.map((question, index) => ({
          question,
          answer: String(answers[index] ?? "").trim(),
        })),
        confidence_rating: confidenceNumber,
      });

      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save reflection."
      );
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View
          style={{
            padding: 16,
            backgroundColor: "#dcefe8",
            borderRadius: 12,
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            Reflection Saved
          </Text>

          <Text style={{ marginTop: 8 }}>
            This reflection has been saved to Supabase. It will become part of
            the parent&apos;s growth timeline and future progress reports.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 6 }}>
        {level === "week" ? "Weekly Reflection" : "Monthly Reflection"}
      </Text>

      <Text style={{ marginBottom: 16 }}>{title}</Text>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Before We Begin
        </Text>
        <Text style={{ marginTop: 8 }}>
          There are no right or wrong answers. These questions help SafeSteps
          understand the parent&apos;s current thoughts, experiences, strengths, and
          support needs before learning begins.
        </Text>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#d8e5dd",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Reflection Worksheets
        </Text>
        <Text style={{ marginTop: 8 }}>
          Use one of the imported personal growth worksheet prompt sets for this reflection.
        </Text>

        <Pressable
          onPress={() => selectWorksheet("")}
          style={{
            padding: 10,
            backgroundColor: selectedWorksheetId === "" ? "#dcefe8" : "#f1f5f3",
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Standard SafeSteps reflection</Text>
        </Pressable>

        {safestepsReflectionWorksheets.map((worksheet) => (
          <Pressable
            key={worksheet.id}
            onPress={() => selectWorksheet(worksheet.id)}
            style={{
              padding: 10,
              backgroundColor: selectedWorksheetId === worksheet.id ? "#dcefe8" : "#f9fbfa",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#edf2ee",
              marginTop: 8,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{worksheet.title}</Text>
            <Text style={{ marginTop: 4 }}>{worksheet.purpose}</Text>
          </Pressable>
        ))}
      </View>

      {questions.map((question, index) => (
        <View
          key={question}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>{question}</Text>

          <TextInput
            value={String(answers[index] ?? "")}
            onChangeText={(value) => updateAnswer(index, value)}
            placeholder="Type your answer here."
            multiline
            style={{
              minHeight: 90,
              borderWidth: 1,
              borderColor: "#cbd8d0",
              borderRadius: 10,
              padding: 12,
              marginTop: 8,
              backgroundColor: "#f9fbfa",
              textAlignVertical: "top",
            }}
          />
        </View>
      ))}

      <View
        style={{
          padding: 16,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#d8e5dd",
          marginBottom: 14,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>
          How confident do you feel in this area from 1 to 10?
        </Text>

        <TextInput
          value={confidence}
          onChangeText={setConfidence}
          placeholder="Enter a number from 1 to 10"
          keyboardType="numeric"
          style={{
            minHeight: 50,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 8,
            backgroundColor: "#f9fbfa",
          }}
        />
      </View>

      {error.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ffecec",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Save Error</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      <Pressable
        disabled={!canSave || saving}
        onPress={handleSave}
        style={{
          padding: 14,
          backgroundColor: canSave ? "#dcefe8" : "#e5e5e5",
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
              color: canSave ? "#000000" : "#777777",
            }}
          >
            {canSave
              ? "Save Reflection"
              : "Answer all questions and confidence rating first"}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
