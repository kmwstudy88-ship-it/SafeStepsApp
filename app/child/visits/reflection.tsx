import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../../lib/child/components";
import { saveChildVisitReflection, type ShareAudience } from "../../../lib/child/childService";

const shareChoices: { label: string; value: ShareAudience }[] = [
  { label: "Keep private", value: "private" },
  { label: "Share with parent", value: "parent" },
  { label: "Share with caseworker", value: "caseworker" },
  { label: "Share with both", value: "both" },
];

export default function VisitReflectionScreen() {
  const [visitDate, setVisitDate] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatFeltUncomfortable, setWhatFeltUncomfortable] = useState("");
  const [whatMadeMeHappy, setWhatMadeMeHappy] = useState("");
  const [whatMadeMeWorried, setWhatMadeMeWorried] = useState("");
  const [parentWorkOn, setParentWorkOn] = useState("");
  const [shareAudience, setShareAudience] = useState<ShareAudience>("private");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSaveReflection() {
    try {
      setSaving(true);
      setMessage("");

      await saveChildVisitReflection({
        visitDate,
        whatWentWell,
        whatFeltUncomfortable,
        whatMadeMeHappy,
        whatMadeMeWorried,
        parentWorkOn,
        shareAudience,
      });

      setMessage("Visit reflection saved.");
      setVisitDate("");
      setWhatWentWell("");
      setWhatFeltUncomfortable("");
      setWhatMadeMeHappy("");
      setWhatMadeMeWorried("");
      setParentWorkOn("");
      setShareAudience("private");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save visit reflection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ChildScreenShell
      title="Visit Reflection"
      subtitle="A safe after-visit tool where the child can record what went well, what felt hard, and what they want adults to know."
    >
      <PrivacyNotice />

      <InfoCard title="Visit date" description="Optional. Use YYYY-MM-DD for now.">
        <TextInput
          style={styles.input}
          value={visitDate}
          onChangeText={setVisitDate}
          placeholder="2026-06-30"
          placeholderTextColor="#7A8A80"
        />
      </InfoCard>

      <InfoCard title="What went well?">
        <TextInput
          style={[styles.input, styles.bigInput]}
          value={whatWentWell}
          onChangeText={setWhatWentWell}
          placeholder="Write what went well..."
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <InfoCard title="What felt uncomfortable?">
        <TextInput
          style={[styles.input, styles.bigInput]}
          value={whatFeltUncomfortable}
          onChangeText={setWhatFeltUncomfortable}
          placeholder="Write anything that felt uncomfortable..."
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <InfoCard title="What made me happy?">
        <TextInput
          style={[styles.input, styles.bigInput]}
          value={whatMadeMeHappy}
          onChangeText={setWhatMadeMeHappy}
          placeholder="Write what made you happy..."
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <InfoCard title="What made me worried?">
        <TextInput
          style={[styles.input, styles.bigInput]}
          value={whatMadeMeWorried}
          onChangeText={setWhatMadeMeWorried}
          placeholder="Write what made you worried..."
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <InfoCard title="What do I want my parent to work on?">
        <TextInput
          style={[styles.input, styles.bigInput]}
          value={parentWorkOn}
          onChangeText={setParentWorkOn}
          placeholder="Write what you want your parent to work on..."
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <SectionTitle>Who can see this reflection?</SectionTitle>

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

      <Pressable style={styles.saveButton} onPress={handleSaveReflection} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Reflection"}</Text>
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
    minHeight: 100,
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