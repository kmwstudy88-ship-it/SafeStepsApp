import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";
import { saveChildRequest, type ShareAudience } from "../../lib/child/childService";
import CoPlayMode from "../../lib/games/family/CoPlayMode";

const gameIdeas = [
  "Feelings card game",
  "Calm drawing challenge",
  "Story building game",
  "Turn-taking board game",
] as const;

export default function ChildGamesScreen() {
  const [gameTitle, setGameTitle] = useState<string>(gameIdeas[0]);
  const [note, setNote] = useState("");
  const [shareAudience, setShareAudience] = useState<ShareAudience>("parent");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function requestGame() {
    try {
      setSaving(true);
      setMessage("");

      await saveChildRequest({
        requestType: "Game Request",
        message: `${gameTitle}${note.trim() ? ` - ${note.trim()}` : ""}`,
        shareAudience,
      });

      setNote("");
      setShareAudience("parent");
      setMessage("Game request shared.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not share the game request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ChildScreenShell
      title="Parent-Child Games"
      subtitle="Choose a safe game or activity. Parents only see the request if you share it with them."
    >
      <PrivacyNotice />

      <CoPlayMode parent={{ id: "parent", name: "Parent" }} child={{ id: "child", name: "Child" }} />

      <SectionTitle>Choose a game</SectionTitle>
      <View style={styles.grid}>
        {gameIdeas.map((idea) => (
          <Pressable
            key={idea}
            style={[styles.choice, gameTitle === idea && styles.choiceSelected]}
            onPress={() => setGameTitle(idea)}
          >
            <Text style={[styles.choiceTitle, gameTitle === idea && styles.choiceTextSelected]}>{idea}</Text>
          </Pressable>
        ))}
      </View>

      <InfoCard title="Message" description="Optional: tell your parent what would make this feel safe or fun.">
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Write a short note..."
          placeholderTextColor="#7A8A80"
          multiline
        />
      </InfoCard>

      <SectionTitle>Who can see this?</SectionTitle>
      <View style={styles.grid}>
        {[
          { label: "Share with parent", value: "parent" as const },
          { label: "Share with caseworker", value: "caseworker" as const },
          { label: "Share with both", value: "both" as const },
        ].map((choice) => (
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

      <Pressable style={styles.saveButton} onPress={requestGame} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Sharing..." : "Share Game Request"}</Text>
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
    minHeight: 96,
    padding: 14,
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
