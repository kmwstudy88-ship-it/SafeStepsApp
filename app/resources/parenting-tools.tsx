import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type ParentingTool = {
  id: string;
  title: string;
  badge: "Template" | "Checklist" | "Guide" | "Worksheet";
  description: string;
  sections: {
    title: string;
    body: string;
    prompts: string[];
  }[];
  fields: string[];
};

const tools: ParentingTool[] = [
  {
    id: "family-meeting",
    title: "Family Meeting Template",
    badge: "Template",
    description: "A calm structure for short family conversations, weekly planning, repair, and shared problem solving.",
    sections: [
      {
        title: "Before the meeting",
        body: "Keep the meeting short, predictable, and focused on one or two practical topics.",
        prompts: [
          "Choose a quiet time when no one is rushing.",
          "Start with something that went well this week.",
          "Use simple language and avoid blame.",
          "Let each person speak without interruption.",
        ],
      },
      {
        title: "Meeting flow",
        body: "Use a repeatable flow so children know what to expect and parents can stay grounded.",
        prompts: [
          "One good thing from the week.",
          "One hard thing from the week.",
          "One routine or boundary to practise.",
          "One support or repair action the family agrees to try.",
        ],
      },
      {
        title: "After the meeting",
        body: "Record the agreed action while it is still fresh and keep it realistic.",
        prompts: [
          "Write the action in one sentence.",
          "Name who is responsible for each step.",
          "Choose when to review it.",
          "Notice progress rather than expecting perfection.",
        ],
      },
    ],
    fields: ["Meeting date", "Who attended", "What went well", "What felt hard", "Agreed family action", "Review date"],
  },
  {
    id: "daily-routine",
    title: "Daily Routine Checklist",
    badge: "Checklist",
    description: "A practical checklist for building predictable mornings, transitions, evenings, and sleep routines.",
    sections: [
      {
        title: "Morning routine",
        body: "Morning routines work best when the order is simple and visible.",
        prompts: [
          "Wake-up time is predictable.",
          "Clothes, bag, and essentials are prepared.",
          "Breakfast or morning food is offered.",
          "The child knows the next transition.",
        ],
      },
      {
        title: "After-school / afternoon routine",
        body: "Transitions are often easier when the child has time to reset before demands increase.",
        prompts: [
          "Offer food, water, or quiet time first.",
          "Use a short check-in before correction.",
          "Set one clear expectation at a time.",
          "Plan movement or outdoor time where possible.",
        ],
      },
      {
        title: "Evening routine",
        body: "Evening structure supports sleep, emotional regulation, and the next day.",
        prompts: [
          "Reduce screen stimulation before bed.",
          "Use predictable hygiene and bedtime steps.",
          "Prepare tomorrow's essentials.",
          "End with connection, reassurance, or reading.",
        ],
      },
    ],
    fields: ["Morning steps", "Afternoon steps", "Evening steps", "Hardest transition", "What helped today", "Tomorrow's adjustment"],
  },
  {
    id: "positive-communication",
    title: "Positive Communication Guide",
    badge: "Guide",
    description: "A plain-language guide for calm, respectful, child-aware communication during everyday parenting moments.",
    sections: [
      {
        title: "Start with connection",
        body: "Children are more likely to listen when they feel seen and safe.",
        prompts: [
          "Get close before giving an instruction.",
          "Use the child's name gently.",
          "Name what you see before correcting.",
          "Keep instructions short and concrete.",
        ],
      },
      {
        title: "Use repair language",
        body: "Repair helps a difficult moment become a learning moment rather than a shame moment.",
        prompts: [
          "I got too loud. I am going to try that again.",
          "You are not in trouble for having feelings.",
          "We still need to keep everyone safe.",
          "Let's work out the next small step.",
        ],
      },
      {
        title: "When emotions are high",
        body: "The priority is calming and safety before teaching or problem solving.",
        prompts: [
          "Lower your voice and slow the pace.",
          "Offer a simple choice if appropriate.",
          "Move away from an audience.",
          "Come back to the lesson after the child is calmer.",
        ],
      },
    ],
    fields: ["Situation", "What I said", "What my child showed", "Repair phrase used", "What I will try next time"],
  },
  {
    id: "behaviour-observation",
    title: "Child Behaviour Observation Sheet",
    badge: "Worksheet",
    description: "A structured way to observe patterns without jumping straight to blame or conclusions.",
    sections: [
      {
        title: "Observe the pattern",
        body: "Useful behaviour notes separate what happened from what it might mean.",
        prompts: [
          "What happened before the behaviour?",
          "What did the child do or say?",
          "What happened after?",
          "How long did it last?",
        ],
      },
      {
        title: "Look for needs and triggers",
        body: "Behaviour can signal tiredness, overwhelm, hunger, fear, confusion, sensory load, or unmet connection needs.",
        prompts: [
          "Was the child tired, hungry, rushed, or overstimulated?",
          "Was there a transition, limit, separation, or conflict?",
          "Did the child need help naming feelings?",
          "What helped the child settle?",
        ],
      },
      {
        title: "Plan the next response",
        body: "A good next step is specific, calm, and repeatable.",
        prompts: [
          "Change one part of the routine.",
          "Teach one replacement behaviour.",
          "Practise one calming strategy.",
          "Review the pattern again after a few days.",
        ],
      },
    ],
    fields: ["Date and time", "Before", "Behaviour observed", "After", "Possible trigger", "What helped", "Next response"],
  },
];

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function toolToText(tool: ParentingTool, notes: Record<string, string>) {
  return [
    tool.title,
    tool.description,
    "",
    ...tool.sections.flatMap((section) => [
      section.title,
      section.body,
      ...section.prompts.map((prompt) => `- ${prompt}`),
      "",
    ]),
    "Worksheet fields",
    ...tool.fields.map((field) => `${field}: ${notes[field] ?? ""}`),
  ].join("\n");
}

function toolToHtml(tool: ParentingTool, notes: Record<string, string>) {
  const sectionsHtml = tool.sections
    .map(
      (section) => `
        <section>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.body)}</p>
          <ul>${section.prompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join("")}</ul>
        </section>
      `,
    )
    .join("");
  const fieldsHtml = tool.fields
    .map((field) => `<li><strong>${escapeHtml(field)}:</strong> ${escapeHtml(notes[field] ?? "")}</li>`)
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { color: #12332B; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.45; padding: 32px; }
          h1 { font-size: 28px; margin: 0 0 8px; }
          h2 { color: #0D5C75; font-size: 18px; margin: 24px 0 8px; }
          p { color: #43534D; margin: 0 0 10px; }
          li { margin: 6px 0; }
          .badge { border: 1px solid #C9E1D9; border-radius: 999px; color: #0D5C75; display: inline-block; font-size: 11px; font-weight: 800; margin-bottom: 12px; padding: 5px 10px; text-transform: uppercase; }
          .fields { background: #FFFDF7; border: 1px solid #E7D7A8; border-radius: 8px; margin-top: 24px; padding: 16px; }
          .footer { border-top: 1px solid #DDE8E2; color: #66756E; font-size: 11px; margin-top: 28px; padding-top: 12px; }
        </style>
      </head>
      <body>
        <span class="badge">${escapeHtml(tool.badge)}</span>
        <h1>SafeSteps ${escapeHtml(tool.title)}</h1>
        <p>${escapeHtml(tool.description)}</p>
        ${sectionsHtml}
        <section class="fields">
          <h2>Printable worksheet</h2>
          <ul>${fieldsHtml}</ul>
        </section>
        <p class="footer">SafeSteps parenting tool. Use for reflection and support planning; avoid sharing private child details unless appropriate.</p>
      </body>
    </html>
  `;
}

export default function ParentingToolsScreen() {
  const { tool } = useLocalSearchParams<{ tool?: string }>();
  const initialToolId = tools.some((item) => item.id === tool) ? tool : tools[0].id;
  const [selectedToolId, setSelectedToolId] = useState(initialToolId);
  const [notesByTool, setNotesByTool] = useState<Record<string, Record<string, string>>>({});
  const selectedTool = tools.find((tool) => tool.id === selectedToolId) ?? tools[0];
  const selectedNotes = useMemo(() => notesByTool[selectedTool.id] ?? {}, [notesByTool, selectedTool.id]);

  const selectedSummary = useMemo(() => toolToText(selectedTool, selectedNotes), [selectedNotes, selectedTool]);

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
      message: `SafeSteps ${selectedTool.title}\n\n${selectedSummary}`,
    });
  }

  async function exportToolPdf() {
    const result = await Print.printToFileAsync({
      base64: false,
      html: toolToHtml(selectedTool, selectedNotes),
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        dialogTitle: `Share SafeSteps ${selectedTool.title}`,
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
      return;
    }

    await Share.share({
      title: `SafeSteps ${selectedTool.title}`,
      message: `PDF created: ${result.uri}\n\n${selectedSummary}`,
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back to resources</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Parenting Tools</Text>
        <Text style={styles.title}>Practical Parenting Tools</Text>
        <Text style={styles.intro}>
          Use these tools to plan routines, hold calm family conversations, practise communication, and observe behaviour patterns with less stress.
        </Text>
      </View>

      <View style={styles.toolGrid}>
        {tools.map((tool) => (
          <Pressable
            accessibilityRole="button"
            key={tool.id}
            onPress={() => setSelectedToolId(tool.id)}
            style={[styles.toolCard, selectedTool.id === tool.id && styles.toolCardSelected]}
          >
            <Text style={styles.badge}>{tool.badge}</Text>
            <Text style={styles.toolTitle}>{tool.title}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
            <Text style={styles.toolAction}>{selectedTool.id === tool.id ? "Viewing tool" : "Open tool"}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.reader}>
        <View style={styles.readerHeader}>
          <View style={styles.readerTitleBlock}>
            <Text style={styles.badge}>{selectedTool.badge}</Text>
            <Text style={styles.readerTitle}>{selectedTool.title}</Text>
            <Text style={styles.readerDescription}>{selectedTool.description}</Text>
          </View>
          <Pressable onPress={shareTool} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Share Tool</Text>
          </Pressable>
          <Pressable onPress={exportToolPdf} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Download PDF</Text>
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
          <Text style={styles.sectionTitle}>Printable worksheet</Text>
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
  eyebrow: { color: "#0D5C75", fontSize: 13, fontWeight: "900", marginBottom: 6, textTransform: "uppercase" },
  title: { color: "#12332B", fontSize: 30, fontWeight: "900", marginBottom: 8 },
  intro: { color: "#43534D", fontSize: 15, lineHeight: 22 },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 },
  toolCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 230,
    flexGrow: 1,
    padding: 14,
  },
  toolCardSelected: { backgroundColor: "#EAF6F4", borderColor: "#0D5C75" },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDF7F4",
    borderColor: "#C9E1D9",
    borderRadius: 999,
    borderWidth: 1,
    color: "#0D5C75",
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toolTitle: { color: "#183C33", fontSize: 16, fontWeight: "900", marginTop: 10 },
  toolDescription: { color: "#53635C", fontSize: 13, lineHeight: 19, marginTop: 4 },
  toolAction: { color: "#0D5C75", fontSize: 13, fontWeight: "900", marginTop: 10 },
  reader: { backgroundColor: "#FFFFFF", borderColor: "#DDE8E2", borderRadius: 8, borderWidth: 1, padding: 16 },
  readerHeader: { alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 14 },
  readerTitleBlock: { flex: 1, minWidth: 240 },
  readerTitle: { color: "#12332B", fontSize: 22, fontWeight: "900", marginTop: 10 },
  readerDescription: { color: "#53635C", fontSize: 14, lineHeight: 20, marginTop: 4 },
  primaryButton: { backgroundColor: "#0D5C75", borderRadius: 8, justifyContent: "center", minHeight: 40, paddingHorizontal: 14 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900" },
  secondaryButton: { backgroundColor: "#FFFFFF", borderColor: "#0D5C75", borderRadius: 8, borderWidth: 1, justifyContent: "center", minHeight: 40, paddingHorizontal: 14 },
  secondaryButtonText: { color: "#0D5C75", fontWeight: "900" },
  sectionCard: { backgroundColor: "#F8FBF9", borderColor: "#D8E5DD", borderRadius: 8, borderWidth: 1, marginBottom: 10, padding: 12 },
  sectionTitle: { color: "#183C33", fontSize: 17, fontWeight: "900" },
  sectionBody: { color: "#43534D", fontSize: 14, lineHeight: 21, marginTop: 6 },
  pointRow: { alignItems: "flex-start", flexDirection: "row", gap: 8, marginTop: 10 },
  pointDot: { color: "#0D5C75", fontSize: 18, fontWeight: "900", lineHeight: 20 },
  pointText: { color: "#43534D", flex: 1, fontSize: 14, lineHeight: 21 },
  worksheetCard: { backgroundColor: "#FFFDF7", borderColor: "#E7D7A8", borderRadius: 8, borderWidth: 1, marginTop: 4, padding: 12 },
  fieldBlock: { gap: 6, marginTop: 12 },
  fieldLabel: { color: "#4B3B16", fontSize: 14, fontWeight: "900" },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CCDCD4",
    borderRadius: 8,
    borderWidth: 1,
    color: "#12332B",
    fontSize: 14,
    minHeight: 72,
    padding: 10,
  },
});
