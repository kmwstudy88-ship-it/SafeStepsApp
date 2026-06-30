import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { childRequests } from "../../lib/child/childData";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";
import { saveChildRequest, type ShareAudience } from "../../lib/child/childService";

const shareChoices: { label: string; value: ShareAudience }[] = [
  { label: "Keep private", value: "private" },
  { label: "Share with parent", value: "parent" },
  { label: "Share with caseworker", value: "caseworker" },
  { label: "Share with both", value: "both" },
];

export default function ChildRequestsScreen() {
  const [requestType, setRequestType] = useState("");
  const [messageText, setMessageText] = useState("");
  const [shareAudience, setShareAudience] = useState<ShareAudience>("parent");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSendRequest() {
    if (!requestType) {
      setMessage("Please choose a request first.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await saveChildRequest({
        requestType,
        message: messageText,
        shareAudience,
      });

      setMessage("Request saved.");
      setRequestType("");
      setMessageText("");
      setShareAudience("parent");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ChildScreenShell
      title="Requests"
      subtitle="A child-controlled space to ask for a game, a talk, help, or something they want their parent to work on."
    >
      <PrivacyNotice />

      <SectionTitle>Choose a request</SectionTitle>

      <View style={styles.grid}>
        {childRequests.map((request) => (
          <Pressable
            key={request.title}
            style={[styles.choice, requestType === request.title && styles.choiceSelected]}
            onPress={() => setRequestType(request.title)}
          >
            <Text style={[styles.choiceTitle, requestType === request.title && styles.choiceTextSelected]}>
              {request.title}
            </Text>
            <Text style={[styles.choiceDescription, requestType === request.title && styles.choiceTextSelected]}>
              {request.description}
            </Text>
          </Pressable>
        ))}
      </View>

      <InfoCard title="Message" description="Optional: Write what you want the adult to understand.">
        <TextInput
          style={[styles.input, styles.bigInput]}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Write your request..."
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <SectionTitle>Who can see this request?</SectionTitle>

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

      <Pressable style={styles.saveButton} onPress={handleSendRequest} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Send Request"}</Text>
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
    fontWeight: "900",
    fontSize: 15,
  },
  choiceDescription: {
    color: "#53665A",
    marginTop: 5,
    lineHeight: 20,
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