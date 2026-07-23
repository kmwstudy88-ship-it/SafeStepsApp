import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type SafetyTool = {
  id: string;
  title: string;
  badge: "Guide" | "Worksheet";
  detail: string;
  sections: {
    title: string;
    body: string;
    prompts: string[];
  }[];
  fields: string[];
};

const tools: SafetyTool[] = [
  {
    id: "emergency-contacts",
    title: "Emergency Support Contacts",
    badge: "Guide",
    detail: "A quick-access guide for recording safe contacts, service numbers, and what each contact can help with.",
    sections: [
      {
        title: "Immediate danger",
        body: "If someone is in immediate danger, use local emergency services first. SafeSteps resources do not replace emergency help.",
        prompts: ["Emergency number", "Nearest safe place", "Trusted person who can come now"],
      },
      {
        title: "Professional support",
        body: "List formal supports so contact details are ready before stress is high.",
        prompts: ["Caseworker or support worker", "Legal representative", "Counsellor or clinician", "Family support service"],
      },
      {
        title: "Practical support",
        body: "Name people who can help with transport, childcare, documents, food, housing, or attending appointments.",
        prompts: ["Transport contact", "Childcare support", "Safe storage for documents", "Appointment support person"],
      },
    ],
    fields: ["Emergency number", "Safe place", "Trusted immediate contact", "Caseworker", "Legal contact", "Counsellor or clinician", "Practical support person"],
  },
  {
    id: "safety-plan",
    title: "Safety Planning Worksheet",
    badge: "Worksheet",
    detail: "A structured worksheet for noticing warning signs, planning safe actions, and recording support steps.",
    sections: [
      {
        title: "Warning signs",
        body: "Notice early signals before a situation becomes harder to manage.",
        prompts: ["Escalating conflict", "Substance use or intoxication concerns", "Threats, intimidation, or coercion", "Child distress or fear cues"],
      },
      {
        title: "Safe actions",
        body: "Choose actions that reduce risk and can be followed under pressure.",
        prompts: ["Leave or move to a safer room", "Call a trusted contact", "Use a pre-agreed code word", "Keep essential documents accessible"],
      },
      {
        title: "Review limits",
        body: "Safety plans should be reviewed with a qualified support person when risk is complex, escalating, or legally sensitive.",
        prompts: ["Who reviews this plan", "When it should be reviewed", "What must not be shared", "What needs urgent professional advice"],
      },
    ],
    fields: ["Main warning signs", "Safe place", "Code word or signal", "People to call", "Documents or items needed", "Child privacy considerations", "Professional review date"],
  },
];

function safetyToolToText(tool: SafetyTool, notes: Record<string, string>) {
  return [
    tool.title,
    tool.detail,
    "",
    ...tool.sections.flatMap((section) => [
      section.title,
      section.body,
      ...section.prompts.map((prompt) => `- ${prompt}`),
      "",
    ]),
    "Plan fields",
    ...tool.fields.map((field) => `${field}: ${notes[field] ?? ""}`),
    "",
    "SafeSteps note: use for support planning. It is not an emergency service, legal advice, clinical decision, or automatic reunification decision.",
  ].join("\n");
}

export default function SafetyPlanningScreen() {
  const { tool } = useLocalSearchParams<{ tool?: string }>();
  const initialToolId = tools.some((item) => item.id === tool) ? tool : tools[0].id;
  const [selectedToolId, setSelectedToolId] = useState(initialToolId);
  const [notesByTool, setNotesByTool] = useState<Record<string, Record<string, string>>>({});
  const selectedTool = tools.find((item) => item.id === selectedToolId) ?? tools[0];
  const selectedNotes = useMemo(() => notesByTool[selectedTool.id] ?? {}, [notesByTool, selectedTool.id]);
  const selectedSummary = useMemo(() => safetyToolToText(selectedTool, selectedNotes), [selectedNotes, selectedTool]);

  useEffect(() => {
    if (tool && tools.some((item) => item.id === tool)) {
      setSelectedToolId(tool);
    }
  }, [tool]);

  function updateField(field: string, value: string) {
    setNotesByTool((current) => ({
      ...current,
      [selectedTool.id]: {
        ...(current[selectedTool.id] ?? {}),
        [field]: value,
      },
    }));
  }

  async function shareTool() {
    await Share.share({
      title: `SafeSteps ${selectedTool.title}`,
      message: selectedSummary,
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back to resources</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Safety and Support</Text>
        <Text style={styles.title}>Safety Planning Resources</Text>
        <Text style={styles.intro}>
          Practical safety resources for preparing contacts, noticing warning signs, and planning support steps. Use
          emergency services immediately if anyone is in immediate danger.
        </Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Important safety note</Text>
        <Text style={styles.noticeText}>
          These tools support preparation and documentation. They do not replace emergency services, legal advice,
          clinical support, or a dedicated safety professional.
        </Text>
      </View>

      <View style={styles.toolGrid}>
        {tools.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => setSelectedToolId(item.id)}
            style={[styles.toolCard, selectedTool.id === item.id && styles.toolCardSelected]}
          >
            <Text style={styles.badge}>{item.badge}</Text>
            <Text style={styles.toolTitle}>{item.title}</Text>
            <Text style={styles.toolDetail}>{item.detail}</Text>
            <Text style={styles.toolAction}>{selectedTool.id === item.id ? "Viewing resource" : "Open resource"}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.reader}>
        <View style={styles.readerHeader}>
          <View style={styles.readerTitleBlock}>
            <Text style={styles.badge}>{selectedTool.badge}</Text>
            <Text style={styles.readerTitle}>{selectedTool.title}</Text>
            <Text style={styles.readerDetail}>{selectedTool.detail}</Text>
          </View>
          <Pressable onPress={shareTool} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Share Resource</Text>
          </Pressable>
        </View>

        {selectedTool.sections.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
            {section.prompts.map((prompt) => (
              <View key={prompt} style={styles.pointRow}>
                <Text style={styles.pointDot}>•</Text>
                <Text style={styles.pointText}>{prompt}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.worksheetCard}>
          <Text style={styles.sectionTitle}>Plan fields</Text>
          {selectedTool.fields.map((field) => (
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
  eyebrow: { color: "#B54708", fontSize: 13, fontWeight: "900", marginBottom: 6, textTransform: "uppercase" },
  title: { color: "#12332B", fontSize: 30, fontWeight: "900", marginBottom: 8 },
  intro: { color: "#43534D", fontSize: 15, lineHeight: 22 },
  notice: { backgroundColor: "#FFF7ED", borderColor: "#FDBA74", borderRadius: 8, borderWidth: 1, marginBottom: 14, padding: 14 },
  noticeTitle: { color: "#7C2D12", fontSize: 16, fontWeight: "900" },
  noticeText: { color: "#8A4B22", fontSize: 13, lineHeight: 19, marginTop: 4 },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 },
  toolCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE8E2", borderRadius: 8, borderWidth: 1, flexBasis: 260, flexGrow: 1, padding: 14 },
  toolCardSelected: { backgroundColor: "#FFF7ED", borderColor: "#B54708" },
  badge: { alignSelf: "flex-start", backgroundColor: "#FFF7ED", borderColor: "#FDBA74", borderRadius: 999, borderWidth: 1, color: "#B54708", fontSize: 11, fontWeight: "900", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 4 },
  toolTitle: { color: "#183C33", fontSize: 16, fontWeight: "900", marginTop: 10 },
  toolDetail: { color: "#53635C", fontSize: 13, lineHeight: 19, marginTop: 4 },
  toolAction: { color: "#B54708", fontSize: 13, fontWeight: "900", marginTop: 10 },
  reader: { backgroundColor: "#FFFFFF", borderColor: "#DDE8E2", borderRadius: 8, borderWidth: 1, padding: 16 },
  readerHeader: { alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 14 },
  readerTitleBlock: { flex: 1, minWidth: 240 },
  readerTitle: { color: "#12332B", fontSize: 22, fontWeight: "900", marginTop: 10 },
  readerDetail: { color: "#53635C", fontSize: 14, lineHeight: 20, marginTop: 4 },
  primaryButton: { backgroundColor: "#B54708", borderRadius: 8, justifyContent: "center", minHeight: 40, paddingHorizontal: 14 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900" },
  sectionCard: { backgroundColor: "#F8FBF9", borderColor: "#D8E5DD", borderRadius: 8, borderWidth: 1, marginBottom: 10, padding: 12 },
  sectionTitle: { color: "#183C33", fontSize: 17, fontWeight: "900" },
  sectionBody: { color: "#43534D", fontSize: 14, lineHeight: 21, marginTop: 6 },
  pointRow: { alignItems: "flex-start", flexDirection: "row", gap: 8, marginTop: 10 },
  pointDot: { color: "#B54708", fontSize: 18, fontWeight: "900", lineHeight: 20 },
  pointText: { color: "#43534D", flex: 1, fontSize: 14, lineHeight: 21 },
  worksheetCard: { backgroundColor: "#FFFDF7", borderColor: "#E7D7A8", borderRadius: 8, borderWidth: 1, marginTop: 4, padding: 12 },
  fieldBlock: { gap: 6, marginTop: 12 },
  fieldLabel: { color: "#4B3B16", fontSize: 14, fontWeight: "900" },
  input: { backgroundColor: "#FFFFFF", borderColor: "#CCDCD4", borderRadius: 8, borderWidth: 1, color: "#12332B", fontSize: 14, minHeight: 72, padding: 10 },
});
