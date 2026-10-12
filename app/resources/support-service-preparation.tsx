import { useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

type ChecklistSection = {
  title: string;
  items: {
    id: string;
    title: string;
    detail: string;
  }[];
};

type Attachment = {
  name: string;
  uri: string;
  mimeType?: string;
};

const checklist: ChecklistSection[] = [
  {
    title: "Essential Information & Identification",
    items: [
      {
        id: "family-details",
        title: "Personal & Family Details",
        detail: "Full legal names, dates of birth, contact numbers, and current living arrangements for you and your children.",
      },
      {
        id: "key-documentation",
        title: "Key Documentation",
        detail: "Medicare cards, IDs, Centrelink reference numbers (CRNs), or relevant health insurance information.",
      },
      {
        id: "support-contacts",
        title: "Support & Emergency Contacts",
        detail: "Contacts for trusted family members, existing advocates, or current care providers.",
      },
    ],
  },
  {
    title: "Primary Goals & Immediate Needs",
    items: [
      {
        id: "main-reason",
        title: "Main Reason for Seeking Support",
        detail: "A brief, clear summary of what you are hoping to achieve, such as housing support, behavioural guidance, safety planning, or mediation.",
      },
      {
        id: "urgent-needs",
        title: "Urgent / High-Priority Needs",
        detail: "Any immediate safety, financial, or stability concerns that need quick attention.",
      },
      {
        id: "worked-before",
        title: "What Has / Hasn't Worked",
        detail: "A quick note on prior strategies, appointments, or services you have already accessed.",
      },
    ],
  },
  {
    title: "Key Documentation & Evidence",
    items: [
      {
        id: "logs-trackers",
        title: "Logs & Trackers",
        detail: "Parenting logs, routine checklists, or behaviour observation sheets.",
      },
      {
        id: "formal-documents",
        title: "Formal Documents",
        detail: "Relevant court orders, parenting plans, medical assessments, or school reports.",
      },
      {
        id: "financial-housing",
        title: "Financial / Housing Records",
        detail: "Pay slips, lease agreements, or financial summary statements for housing or financial counselling.",
      },
    ],
  },
  {
    title: "Questions to Ask the Support Provider",
    items: [
      {
        id: "service-capabilities",
        title: "Service Capabilities",
        detail: "What specific programs or resources do you provide for families in my situation?",
      },
      {
        id: "timelines",
        title: "Timelines & Availability",
        detail: "What are the expected wait times, or how frequently will we meet?",
      },
      {
        id: "next-steps",
        title: "Next Steps & Actions",
        detail: "What do I need to prepare or complete before our next appointment?",
      },
      {
        id: "privacy-sharing",
        title: "Privacy & Information Sharing",
        detail: "How is my family's information stored and shared?",
      },
    ],
  },
  {
    title: "Post-Appointment Action Items",
    items: [
      {
        id: "contact-name",
        title: "Case Worker / Contact Name",
        detail: "Direct line or email of the primary point of contact.",
      },
      {
        id: "assigned-actions",
        title: "Assigned Action Steps",
        detail: "Tasks agreed upon during the meeting.",
      },
      {
        id: "follow-up-date",
        title: "Follow-Up Date",
        detail: "Date and time of the next scheduled check-in or appointment.",
      },
    ],
  },
];

const allItemIds = checklist.flatMap((section) => section.items.map((item) => item.id));

export default function SupportServicePreparationScreen() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Record<string, Attachment | null>>({});
  const completedCount = allItemIds.filter((id) => checked[id]).length;

  const summary = useMemo(
    () =>
      checklist
        .map((section) => {
          const lines = section.items.map((item) => {
            const status = checked[item.id] ? "[x]" : "[ ]";
            const note = notes[item.id]?.trim();
            const attachment = attachments[item.id]?.name;

            return [
              `${status} ${item.title}`,
              note ? `  Note: ${note}` : "",
              attachment ? `  Attachment: ${attachment}` : "",
            ]
              .filter(Boolean)
              .join("\n");
          });

          return `${section.title}\n${lines.join("\n")}`;
        })
        .join("\n\n"),
    [attachments, checked, notes],
  );

  function toggleItem(id: string) {
    setChecked((current) => ({ ...current, [id]: !current[id] }));
  }

  async function pickAttachment(itemId: string) {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [
        "application/pdf",
        "image/*",
        "text/plain",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    if (!result.canceled) {
      const picked = result.assets[0];
      setAttachments((current) => ({
        ...current,
        [itemId]: {
          name: picked.name,
          uri: picked.uri,
          mimeType: picked.mimeType,
        },
      }));
    }
  }

  async function shareSummary() {
    await Share.share({
      title: "SafeSteps support service preparation checklist",
      message: `SafeSteps support service preparation checklist\n\n${summary}`,
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back to resources</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Checklist</Text>
        <Text style={styles.title}>Support Service Preparation</Text>
        <Text style={styles.intro}>
          Gather, organize, and prepare essential information before contacting or meeting with family support workers,
          legal aid, counsellors, child development specialists, housing agencies, or other support services.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryTitle}>Preparation progress</Text>
          <Text style={styles.summaryText}>
            {completedCount} of {allItemIds.length} items checked. Notes and attachment names are included in the
            shareable summary.
          </Text>
        </View>
        <Pressable onPress={shareSummary} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Summary</Text>
        </Pressable>
      </View>

      {checklist.map((section) => (
        <View key={section.title} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.items.map((item) => {
            const isChecked = Boolean(checked[item.id]);
            const attachment = attachments[item.id];

            return (
              <View key={item.id} style={styles.itemCard}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  onPress={() => toggleItem(item.id)}
                  style={styles.itemHeader}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    <Text style={[styles.checkboxMark, isChecked && styles.checkboxMarkChecked]}>✓</Text>
                  </View>
                  <View style={styles.itemTextBlock}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDetail}>{item.detail}</Text>
                  </View>
                </Pressable>

                <TextInput
                  multiline
                  onChangeText={(value) => setNotes((current) => ({ ...current, [item.id]: value }))}
                  placeholder="Add a short note for this item..."
                  placeholderTextColor="#6B776F"
                  style={styles.noteInput}
                  textAlignVertical="top"
                  value={notes[item.id] ?? ""}
                />

                <View style={styles.attachmentRow}>
                  <Pressable onPress={() => pickAttachment(item.id)} style={styles.attachmentButton}>
                    <Text style={styles.attachmentButtonText}>{attachment ? "Replace Attachment" : "Attach File"}</Text>
                  </Pressable>
                  {attachment ? (
                    <View style={styles.attachmentMeta}>
                      <Text style={styles.attachmentName}>{attachment.name}</Text>
                      <Pressable onPress={() => setAttachments((current) => ({ ...current, [item.id]: null }))}>
                        <Text style={styles.removeText}>Remove</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={styles.noAttachment}>No file attached</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F7FAF8",
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingVertical: 6,
  },
  backButtonText: {
    color: "#0D5C75",
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    marginBottom: 16,
    maxWidth: 900,
  },
  eyebrow: {
    color: "#0D5C75",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: "#12332B",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },
  intro: {
    color: "#43534D",
    fontSize: 15,
    lineHeight: 22,
  },
  summaryCard: {
    alignItems: "center",
    backgroundColor: "#EAF6F4",
    borderColor: "#B8DAD4",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 14,
  },
  summaryTitle: {
    color: "#12332B",
    fontSize: 17,
    fontWeight: "900",
  },
  summaryText: {
    color: "#43534D",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  shareButton: {
    backgroundColor: "#0D5C75",
    borderRadius: 8,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  sectionTitle: {
    color: "#183C33",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: "#F8FBF9",
    borderColor: "#D8E5DD",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
    padding: 12,
  },
  itemHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  checkbox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#AFC6BC",
    borderRadius: 6,
    borderWidth: 2,
    height: 26,
    justifyContent: "center",
    marginTop: 2,
    width: 26,
  },
  checkboxChecked: {
    backgroundColor: "#0D5C75",
    borderColor: "#0D5C75",
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  checkboxMarkChecked: {
    color: "#FFFFFF",
  },
  itemTextBlock: {
    flex: 1,
  },
  itemTitle: {
    color: "#1E352E",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  itemDetail: {
    color: "#53635C",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  noteInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CCDCD4",
    borderRadius: 8,
    borderWidth: 1,
    color: "#12332B",
    fontSize: 14,
    minHeight: 78,
    padding: 10,
  },
  attachmentRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  attachmentButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#0D5C75",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  attachmentButtonText: {
    color: "#0D5C75",
    fontSize: 13,
    fontWeight: "900",
  },
  attachmentMeta: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: "wrap",
    gap: 10,
  },
  attachmentName: {
    color: "#334740",
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  noAttachment: {
    color: "#66756E",
    fontSize: 13,
  },
  removeText: {
    color: "#9E2B25",
    fontSize: 13,
    fontWeight: "900",
  },
});
