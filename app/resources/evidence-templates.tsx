import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type EvidenceTemplate = {
  id: string;
  title: string;
  badge: "Worksheet" | "Checklist" | "Template";
  detail: string;
  guidance: string[];
  fields: string[];
};

const templates: EvidenceTemplate[] = [
  {
    id: "weekly-practice-log",
    title: "Weekly Parenting Practice Log",
    badge: "Worksheet",
    detail: "A weekly record of the parenting skill practised, what happened, and what should be repeated or adjusted.",
    guidance: [
      "Record observable examples rather than broad claims.",
      "Include barriers such as stress, transport, housing, illness, or service access.",
      "Keep child privacy in mind before sharing outside SafeSteps.",
    ],
    fields: ["Week starting", "Skill practised", "What I did", "Child response observed", "What helped", "Barrier or support needed", "Next repeatable step"],
  },
  {
    id: "home-routine-checklist",
    title: "Home Routine Evidence Checklist",
    badge: "Checklist",
    detail: "A practical checklist for showing routine setup, consistency, and changes in the home environment.",
    guidance: [
      "Use dates and plain descriptions so the record can be reviewed later.",
      "Attach photos or documents from the Evidence screen when appropriate.",
      "Do not overstate what a single checklist proves.",
    ],
    fields: ["Morning routine in place", "Meals or snacks planned", "School or care items ready", "Bedtime routine in place", "Safety or supervision step", "Evidence note"],
  },
  {
    id: "reflection-journal",
    title: "Reflection Journal Template",
    badge: "Template",
    detail: "A structured reflection for noticing effort, repair, accountability, and learning over time.",
    guidance: [
      "Separate feelings, facts, and interpretations.",
      "Name repair actions clearly when something did not go well.",
      "Use this as a parent reflection, not as a child disclosure record.",
    ],
    fields: ["Date", "What happened", "What I felt", "What my child may have needed", "Repair or accountability step", "What I will practise next"],
  },
  {
    id: "goal-progress-tracker",
    title: "Goal Progress Tracker",
    badge: "Worksheet",
    detail: "A tracker for one parenting or reunification goal with small repeatable actions and review notes.",
    guidance: [
      "Choose one concrete goal at a time.",
      "Track actions that can be observed or repeated.",
      "Record concerns and limits alongside progress.",
    ],
    fields: ["Goal", "Why this matters", "Small action this week", "Date completed", "Evidence or example", "Concern or limitation", "Next review date"],
  },
];

function templateToText(template: EvidenceTemplate, notes: Record<string, string>) {
  return [
    template.title,
    template.detail,
    "",
    "Use this template to:",
    ...template.guidance.map((item) => `- ${item}`),
    "",
    "Template fields",
    ...template.fields.map((field) => `${field}: ${notes[field] ?? ""}`),
    "",
    "SafeSteps note: use as support and engagement documentation, not as an automatic legal, clinical, safety, or reunification decision.",
  ].join("\n");
}

export default function EvidenceTemplatesScreen() {
  const { template } = useLocalSearchParams<{ template?: string }>();
  const initialTemplateId = templates.some((item) => item.id === template) ? template : templates[0].id;
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const [notesByTemplate, setNotesByTemplate] = useState<Record<string, Record<string, string>>>({});
  const selectedTemplate = templates.find((item) => item.id === selectedTemplateId) ?? templates[0];
  const selectedNotes = useMemo(() => notesByTemplate[selectedTemplate.id] ?? {}, [notesByTemplate, selectedTemplate.id]);
  const selectedSummary = useMemo(() => templateToText(selectedTemplate, selectedNotes), [selectedNotes, selectedTemplate]);

  useEffect(() => {
    if (template && templates.some((item) => item.id === template)) {
      setSelectedTemplateId(template);
    }
  }, [template]);

  function updateField(field: string, value: string) {
    setNotesByTemplate((current) => ({
      ...current,
      [selectedTemplate.id]: {
        ...(current[selectedTemplate.id] ?? {}),
        [field]: value,
      },
    }));
  }

  async function shareTemplate() {
    await Share.share({
      title: `SafeSteps ${selectedTemplate.title}`,
      message: selectedSummary,
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back to resources</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Evidence Templates</Text>
        <Text style={styles.title}>Evidence Templates</Text>
        <Text style={styles.intro}>
          Complete practical templates for recording parenting practice, routines, reflections, and goal progress without
          mixing facts, feelings, interpretations, and review limits.
        </Text>
      </View>

      <View style={styles.templateGrid}>
        {templates.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => setSelectedTemplateId(item.id)}
            style={[styles.templateCard, selectedTemplate.id === item.id && styles.templateCardSelected]}
          >
            <Text style={styles.badge}>{item.badge}</Text>
            <Text style={styles.templateTitle}>{item.title}</Text>
            <Text style={styles.templateDetail}>{item.detail}</Text>
            <Text style={styles.templateAction}>{selectedTemplate.id === item.id ? "Viewing template" : "Open template"}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.reader}>
        <View style={styles.readerHeader}>
          <View style={styles.readerTitleBlock}>
            <Text style={styles.badge}>{selectedTemplate.badge}</Text>
            <Text style={styles.readerTitle}>{selectedTemplate.title}</Text>
            <Text style={styles.readerDetail}>{selectedTemplate.detail}</Text>
          </View>
          <Pressable onPress={shareTemplate} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Share Template</Text>
          </Pressable>
        </View>

        <View style={styles.guidanceCard}>
          <Text style={styles.sectionTitle}>Before using this template</Text>
          {selectedTemplate.guidance.map((item) => (
            <View key={item} style={styles.pointRow}>
              <Text style={styles.pointDot}>•</Text>
              <Text style={styles.pointText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.worksheetCard}>
          <Text style={styles.sectionTitle}>Template fields</Text>
          {selectedTemplate.fields.map((field) => (
            <View key={field} style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{field}</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateField(field, value)}
                placeholder="Add notes..."
                placeholderTextColor="#6B776F"
                style={styles.input}
                textAlignVertical="top"
                value={selectedNotes[field] ?? ""}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7FAF8", flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  backButton: { alignSelf: "flex-start", marginBottom: 14, paddingVertical: 6 },
  backButtonText: { color: "#0D5C75", fontSize: 14, fontWeight: "800" },
  header: { marginBottom: 16, maxWidth: 940 },
  eyebrow: { color: "#0D5C75", fontSize: 13, fontWeight: "900", marginBottom: 6, textTransform: "uppercase" },
  title: { color: "#12332B", fontSize: 30, fontWeight: "900", marginBottom: 8 },
  intro: { color: "#43534D", fontSize: 15, lineHeight: 22 },
  templateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 },
  templateCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE8E2", borderRadius: 8, borderWidth: 1, flexBasis: 230, flexGrow: 1, padding: 14 },
  templateCardSelected: { backgroundColor: "#EAF6F4", borderColor: "#0D5C75" },
  badge: { alignSelf: "flex-start", backgroundColor: "#EDF7F4", borderColor: "#C9E1D9", borderRadius: 999, borderWidth: 1, color: "#0D5C75", fontSize: 11, fontWeight: "900", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 4 },
  templateTitle: { color: "#183C33", fontSize: 16, fontWeight: "900", marginTop: 10 },
  templateDetail: { color: "#53635C", fontSize: 13, lineHeight: 19, marginTop: 4 },
  templateAction: { color: "#0D5C75", fontSize: 13, fontWeight: "900", marginTop: 10 },
  reader: { backgroundColor: "#FFFFFF", borderColor: "#DDE8E2", borderRadius: 8, borderWidth: 1, padding: 16 },
  readerHeader: { alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 14 },
  readerTitleBlock: { flex: 1, minWidth: 240 },
  readerTitle: { color: "#12332B", fontSize: 22, fontWeight: "900", marginTop: 10 },
  readerDetail: { color: "#53635C", fontSize: 14, lineHeight: 20, marginTop: 4 },
  primaryButton: { backgroundColor: "#0D5C75", borderRadius: 8, justifyContent: "center", minHeight: 40, paddingHorizontal: 14 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900" },
  guidanceCard: { backgroundColor: "#F8FBF9", borderColor: "#D8E5DD", borderRadius: 8, borderWidth: 1, marginBottom: 10, padding: 12 },
  sectionTitle: { color: "#183C33", fontSize: 17, fontWeight: "900" },
  pointRow: { alignItems: "flex-start", flexDirection: "row", gap: 8, marginTop: 10 },
  pointDot: { color: "#0D5C75", fontSize: 18, fontWeight: "900", lineHeight: 20 },
  pointText: { color: "#43534D", flex: 1, fontSize: 14, lineHeight: 21 },
  worksheetCard: { backgroundColor: "#FFFDF7", borderColor: "#E7D7A8", borderRadius: 8, borderWidth: 1, marginTop: 4, padding: 12 },
  fieldBlock: { gap: 6, marginTop: 12 },
  fieldLabel: { color: "#4B3B16", fontSize: 14, fontWeight: "900" },
  input: { backgroundColor: "#FFFFFF", borderColor: "#CCDCD4", borderRadius: 8, borderWidth: 1, color: "#12332B", fontSize: 14, minHeight: 72, padding: 10 },
});
