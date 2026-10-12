import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";
import { saveChildFeelingCheckIn, type ShareAudience } from "../../lib/child/childService";

const feelings = [
  "Happy",
  "Sad",
  "Worried",
  "Angry",
  "Calm",
  "Confused",
  "Excited",
  "I do not know yet",
];

const shareChoices: { label: string; value: ShareAudience }[] = [
  { label: "Keep private", value: "private" },
  { label: "Share with parent", value: "parent" },
  { label: "Share with caseworker", value: "caseworker" },
  { label: "Share with both", value: "both" },
];

export default function ChildCheckInScreen() {
  const [feeling, setFeeling] = useState("");
  const [note, setNote] = useState("");
  const [bodySignal, setBodySignal] = useState("");
  const [shareAudience, setShareAudience] = useState<ShareAudience>("private");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!feeling) {
      setMessage("Please choose a feeling first.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await saveChildFeelingCheckIn({
        feeling,
        note,
        bodySignal,
        shareAudience,
      });

      setMessage("Saved. Your choice has been recorded.");
      setFeeling("");
      setNote("");
      setBodySignal("");
      setShareAudience("private");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save check-in.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ChildScreenShell
      title="Today’s Feelings Check-In"
      subtitle="Pick how you feel today. You can keep it private or choose to share it."
    >
      <PrivacyNotice />

      <SectionTitle>How do you feel today?</SectionTitle>

      <View style={styles.grid}>
        {feelings.map((item) => (
          <Pressable
            key={item}
            style={[styles.choice, feeling === item && styles.choiceSelected]}
            onPress={() => setFeeling(item)}
          >
            <Text style={[styles.choiceText, feeling === item && styles.choiceTextSelected]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <InfoCard title="Body signal" description="Optional: Where do you feel it in your body?">
        <TextInput
          style={styles.input}
          value={bodySignal}
          onChangeText={setBodySignal}
          placeholder="Example: tummy, chest, head, hands"
          placeholderTextColor="#7A8A80"
        />
      </InfoCard>

      <InfoCard title="My note" description="Optional: Write anything you want to remember.">
        <TextInput
          style={[styles.input, styles.bigInput]}
          value={note}
          onChangeText={setNote}
          placeholder="Write a private note..."
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
            <Text style={[styles.choiceText, shareAudience === choice.value && styles.choiceTextSelected]}>
              {choice.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Check-In"}</Text>
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
  choiceText: {
    color: "#20382B",
    fontWeight: "800",
    textAlign: "center",
  },
  choiceTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#F6FAF7",
    borderWidth: 1,
    borderColor: "#D7E2DA",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    fontSize: 15,
    color: "#20382B",
  },
  bigInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#20382B",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 16,
  },
  message: {
    marginTop: 12,
    color: "#20382B",
    fontWeight: "700",
    textAlign: "center",
  },
});