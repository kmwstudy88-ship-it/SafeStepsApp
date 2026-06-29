import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { saveCourse, saveLesson, saveProgram, saveResource } from "../../lib/platform/data";

type Mode = "program" | "course" | "lesson" | "resource";

export default function AdminContentScreen() {
  const [mode, setMode] = useState<Mode>("program");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dayNumber, setDayNumber] = useState("1");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [checkpointQuestion, setCheckpointQuestion] = useState("");
  const [scenarioQuestion, setScenarioQuestion] = useState("");
  const [practiceInstruction, setPracticeInstruction] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      if (!title.trim()) throw new Error("A title is required.");

      if (mode === "program") {
        await saveProgram({ title, description, status, durationWeeks: 12, riskLevel: "custom" });
      }

      if (mode === "course") {
        await saveCourse({ title, description, status, programId: programId.trim() || undefined });
      }

      if (mode === "resource") {
        await saveResource({ title, description, status, programId: programId.trim() || undefined, courseId: courseId.trim() || undefined, bodyMarkdown: contentMarkdown });
      }

      if (mode === "lesson") {
        await saveLesson({
          title,
          summary: description,
          status,
          courseId: courseId.trim() || undefined,
          dayNumber: Number(dayNumber) || 1,
          contentMarkdown,
          checkpoint: { question: checkpointQuestion, options: [], correctAnswer: "", explanation: "" },
          scenario: { situation: scenarioQuestion, question: scenarioQuestion, options: [], saferChoice: "", explanation: "" },
          practice: { title: "Practice", instruction: practiceInstruction, example: "" },
        });
      }

      Alert.alert("Saved", `${mode} saved to Supabase.`);
      setTitle("");
      setDescription("");
      setContentMarkdown("");
      setCheckpointQuestion("");
      setScenarioQuestion("");
      setPracticeInstruction("");
    } catch (error) {
      Alert.alert("Could not save", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin content builder</Text>
      <Text style={styles.body}>Create the database-backed platform content here. Switch status to published when it is ready for learners.</Text>

      <View style={styles.tabs}>
        {(["program", "course", "lesson", "resource"] as Mode[]).map((item) => (
          <Pressable key={item} style={[styles.tab, mode === item && styles.activeTab]} onPress={() => setMode(item)}>
            <Text style={styles.tabText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Description / summary" value={description} onChangeText={setDescription} multiline />

      {(mode === "course" || mode === "resource") && <Field label="Program ID, optional" value={programId} onChangeText={setProgramId} />}
      {(mode === "lesson" || mode === "resource") && <Field label="Course ID, optional for resources but required for lessons" value={courseId} onChangeText={setCourseId} />}
      {mode === "lesson" && <Field label="Day number" value={dayNumber} onChangeText={setDayNumber} keyboardType="numeric" />}
      {(mode === "lesson" || mode === "resource") && <Field label="Content markdown / resource body" value={contentMarkdown} onChangeText={setContentMarkdown} multiline />}
      {mode === "lesson" && <Field label="Checkpoint question" value={checkpointQuestion} onChangeText={setCheckpointQuestion} multiline />}
      {mode === "lesson" && <Field label="Scenario question" value={scenarioQuestion} onChangeText={setScenarioQuestion} multiline />}
      {mode === "lesson" && <Field label="Practice instruction" value={practiceInstruction} onChangeText={setPracticeInstruction} multiline />}
      <Field label="Status: draft, published, archived" value={status} onChangeText={setStatus} />

      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Saving..." : `Save ${mode}`}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...inputProps} style={[styles.input, inputProps.multiline && styles.multiline]} placeholderTextColor="#67736a" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, backgroundColor: "#eef5ef" },
  title: { fontSize: 28, fontWeight: "800" },
  body: { fontSize: 15, lineHeight: 22 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "white", borderWidth: 1, borderColor: "#d6e2d8" },
  activeTab: { borderColor: "#3a5f48", borderWidth: 2 },
  tabText: { fontWeight: "700", textTransform: "capitalize" },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: "800" },
  input: { backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: "#d6e2d8", padding: 12, fontSize: 15 },
  multiline: { minHeight: 110, textAlignVertical: "top" },
  button: { backgroundColor: "#2f5f4a", padding: 15, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "800", fontSize: 16 },
});