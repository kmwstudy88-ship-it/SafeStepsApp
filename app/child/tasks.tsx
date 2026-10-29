import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { childTasks, shareOptions, type ShareAudience } from "../../lib/child/childData";
import {
  BackToChildHome,
  ChildScreenShell,
  InfoCard,
  PrivacyNotice,
  SectionTitle,
} from "../../lib/child/components";

const ACTIVITY_FEELINGS = [
  { id: "fun", emoji: "🌟", label: "Fun & Happy" },
  { id: "calm", emoji: "😊", label: "Calm & Safe" },
  { id: "okay", emoji: "😐", label: "Just Okay" },
  { id: "break", emoji: "🛑", label: "Wanted a Break" },
] as const;

export default function ChildTasksScreen() {
  const [takingBreak, setTakingBreak] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<ShareAudience>("private");
  const [savedReflection, setSavedReflection] = useState<string | null>(null);

  return (
    <ChildScreenShell
      title="Child Tasks & Family Activities"
      subtitle="Interactive, child-friendly, trauma-informed tasks and voluntary family activities that can stay private or be shared by choice."
    >
      <PrivacyNotice />

      <InfoCard
        title="🛑 Need a Break? (Always Okay)"
        description="You can pause or stop any task or shared family challenge at any time. Nothing bad happens when you take a break."
      >
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.breakButton, takingBreak && styles.breakButtonActive]}
            onPress={() => setTakingBreak((prev) => !prev)}
          >
            <Text style={[styles.breakButtonText, takingBreak && styles.breakButtonTextActive]}>
              {takingBreak ? "⏸ Taking a Calm Break — Tap When Ready" : "🛑 I Need a Break Right Now"}
            </Text>
          </Pressable>
        </View>
        {takingBreak ? (
          <Text style={styles.statusNotice}>
            You are on a safe break. Take all the time you need—your space and choices are protected.
          </Text>
        ) : null}
      </InfoCard>

      <SectionTitle>How Did a Family Activity Feel? (Your Choice)</SectionTitle>
      <InfoCard
        title="Separate Child Reflection"
        description="If you did a game, story, or family activity, you can pick how it felt for you. It stays private unless you choose to share it."
      >
        <View style={styles.chipRow}>
          {ACTIVITY_FEELINGS.map((item) => {
            const active = selectedFeeling === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.feelingChip, active && styles.feelingChipActive]}
                onPress={() => {
                  setSelectedFeeling(item.id);
                  setSavedReflection(null);
                }}
              >
                <Text style={[styles.feelingChipText, active && styles.feelingChipTextActive]}>
                  {item.emoji} {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.subLabel}>Who can see this?</Text>
        <View style={styles.chipRow}>
          {shareOptions.map((opt) => {
            const active = selectedAudience === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[styles.audienceChip, active && styles.audienceChipActive]}
                onPress={() => {
                  setSelectedAudience(opt.value as ShareAudience);
                  setSavedReflection(null);
                }}
              >
                <Text style={[styles.audienceChipText, active && styles.audienceChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.saveButton, !selectedFeeling && styles.saveButtonDisabled]}
          disabled={!selectedFeeling}
          onPress={() => {
            const feelingLabel =
              ACTIVITY_FEELINGS.find((f) => f.id === selectedFeeling)?.label ?? "Saved";
            const audienceLabel =
              shareOptions.find((s) => s.value === selectedAudience)?.label ?? "Keep private";
            setSavedReflection(`Saved "${feelingLabel}" (${audienceLabel}).`);
          }}
        >
          <Text style={styles.saveButtonText}>Save My Choice</Text>
        </Pressable>

        {savedReflection ? <Text style={styles.statusNotice}>{savedReflection}</Text> : null}
      </InfoCard>

      <SectionTitle>Task Types</SectionTitle>

      {childTasks.map((task) => (
        <InfoCard
          key={task.title}
          title={task.title}
          description={`${task.description} Privacy: ${task.privacy}.`}
        />
      ))}

      <BackToChildHome />
    </ChildScreenShell>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  breakButton: {
    backgroundColor: "#FFF3DA",
    borderColor: "#E4B869",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  breakButtonActive: {
    backgroundColor: "#5C3D99",
    borderColor: "#5C3D99",
  },
  breakButtonText: {
    color: "#734B12",
    fontWeight: "800",
    fontSize: 14,
  },
  breakButtonTextActive: {
    color: "#FFFFFF",
  },
  chipRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  feelingChip: {
    backgroundColor: "#F6F1FC",
    borderColor: "#D9CBEF",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  feelingChipActive: {
    backgroundColor: "#5C3D99",
    borderColor: "#5C3D99",
  },
  feelingChipText: {
    color: "#1B2A4A",
    fontWeight: "700",
    fontSize: 13,
  },
  feelingChipTextActive: {
    color: "#FFFFFF",
  },
  subLabel: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "800",
    color: "#1B2A4A",
  },
  audienceChip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9CBEF",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  audienceChipActive: {
    backgroundColor: "#EDE4FA",
    borderColor: "#5C3D99",
  },
  audienceChipText: {
    color: "#4B5568",
    fontWeight: "700",
    fontSize: 12,
  },
  audienceChipTextActive: {
    color: "#5C3D99",
  },
  saveButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#247A57",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  statusNotice: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#247A57",
  },
});
