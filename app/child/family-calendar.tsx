import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";
import { saveChildRequest, type ShareAudience } from "../../lib/child/childService";

const calendarTypes = [
  {
    label: "Upcoming Visit",
    requestType: "Family Calendar Visit",
    description: "A visit or contact time I want adults to know about.",
  },
  {
    label: "Activity",
    requestType: "Family Calendar Activity",
    description: "A family activity, outing, or shared routine.",
  },
  {
    label: "Family Task",
    requestType: "Family Calendar Task",
    description: "A task we need to do as a family.",
  },
  {
    label: "Requested Game",
    requestType: "Family Calendar Game",
    description: "A future game or play time I want to ask for.",
  },
] as const;

type CalendarType = (typeof calendarTypes)[number];

const shareChoices: { label: string; value: Exclude<ShareAudience, "private"> }[] = [
  { label: "Share with parent", value: "parent" },
  { label: "Share with caseworker", value: "caseworker" },
  { label: "Share with both", value: "both" },
];

export default function ChildFamilyCalendarScreen() {
  const [selectedType, setSelectedType] = useState<CalendarType>(calendarTypes[0]);
  const [requestedFor, setRequestedFor] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [shareAudience, setShareAudience] = useState<Exclude<ShareAudience, "private">>("parent");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function shareCalendarItem() {
    if (!title.trim()) {
      setMessage("Add a short title first.");
      return;
    }

    if (!requestedFor.trim()) {
      setMessage("Add the date or time this is for.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await saveChildRequest({
        requestType: selectedType.requestType,
        message: `${selectedType.label}: ${title.trim()} | When: ${requestedFor.trim()}${
          note.trim() ? ` | Note: ${note.trim()}` : ""
        }`,
        shareAudience,
      });

      setRequestedFor("");
      setTitle("");
      setNote("");
      setShareAudience("parent");
      setMessage("Calendar item shared.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not share the calendar item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ChildScreenShell
      title="Family Calendar"
      subtitle="Share upcoming visits, activities, family tasks, and future requested games. Parents only see what you choose to share."
    >
      <PrivacyNotice />

      <SectionTitle>What do you want to add?</SectionTitle>
      <View style={styles.grid}>
        {calendarTypes.map((item) => (
          <Pressable
            key={item.requestType}
            style={[styles.choice, selectedType.requestType === item.requestType && styles.choiceSelected]}
            onPress={() => setSelectedType(item)}
          >
            <Text style={[styles.choiceTitle, selectedType.requestType === item.requestType && styles.choiceTextSelected]}>
              {item.label}
            </Text>
            <Text style={[styles.choiceDescription, selectedType.requestType === item.requestType && styles.choiceTextSelected]}>
              {item.description}
            </Text>
          </Pressable>
        ))}
      </View>

      <InfoCard title="Calendar details" description="Use plain words. A caseworker or parent can help schedule it later.">
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title, for example: Saturday visit, park activity, homework task"
          placeholderTextColor="#7A8A80"
        />
        <TextInput
          style={styles.input}
          value={requestedFor}
          onChangeText={setRequestedFor}
          placeholder="Date/time, for example: 2026-07-20 18:30 or next Saturday"
          placeholderTextColor="#7A8A80"
        />
        <TextInput
          style={[styles.input, styles.bigInput]}
          value={note}
          onChangeText={setNote}
          placeholder="Optional note about what would help this feel safe or organised"
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <SectionTitle>Who can see this?</SectionTitle>
      <View style={styles.grid}>
        {shareChoices.map((choice) => (
          <Pressable
            key={choice.value}
            style={[styles.choice, shareAudience === choice.value && styles.choiceSelected]}
            onPress={() => setShareAudience(choice.value)}
          >
            <Text style={[styles.choiceTitle, shareAudience === choice.value && styles.choiceTextSelected]}>
              {choice.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.saveButton} onPress={shareCalendarItem} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Sharing..." : "Share Calendar Item"}</Text>
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <BackToChildHome />
    </ChildScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
    marginBottom: 14,
  },
  choice: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E2DA",
    borderRadius: 16,
    padding: 14,
  },
  choiceSelected: {
    backgroundColor: "#315D44",
    borderColor: "#315D44",
  },
  choiceTitle: {
    color: "#20382B",
    fontSize: 15,
    fontWeight: "900",
  },
  choiceDescription: {
    color: "#53665A",
    lineHeight: 20,
    marginTop: 5,
  },
  choiceTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#F6FAF7",
    borderWidth: 1,
    borderColor: "#D7E2DA",
    borderRadius: 14,
    color: "#20382B",
    fontSize: 15,
    marginTop: 12,
    padding: 14,
  },
  bigInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#20382B",
    borderRadius: 16,
    marginTop: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  message: {
    color: "#20382B",
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
});
