import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { submitAiCoachTurn } from "../../lib/aiSupportApi";
import type { SupportCoachTurnOutput } from "../../lib/engines/aiSupportCoachEngine";
import VoiceChatControls from "../../lib/voice/VoiceChatControls";

const KID_BODY_FEELINGS = [
  {
    id: "butterfly_tummy",
    emoji: "🦋",
    label: "Butterfly or Knotted Tummy",
    superpowerReset:
      "Put one warm hand on your belly and do 3 slow Balloon Breaths — smell the warm cookie for 4 seconds, blow the bubble for 6 seconds.",
  },
  {
    id: "fast_heart",
    emoji: "💓",
    label: "Fast Heart or Jumpy Body",
    superpowerReset:
      "Press both feet into the floor like strong tree roots and name 5 safe colours you can see in the room right now.",
  },
  {
    id: "heavy_cloud",
    emoji: "🌧️",
    label: "Heavy, Sad or Tired Cloud",
    superpowerReset:
      "Wrap up in a cosy blanket or hug a soft pillow, sip some water, and remember: grown-up stress is NEVER your fault.",
  },
  {
    id: "calm_sunny",
    emoji: "☀️",
    label: "Safe, Calm & Steady",
    superpowerReset:
      "Awesome! Notice how calm and strong your body feels right now — that is your Safe Place superpower.",
  },
];

export default function ChildSupportCoachScreen() {
  const router = useRouter();
  const [ageBand, setAgeBand] = useState<"5-8" | "9-12" | "13-17">("9-12");
  const [worryThermometer, setWorryThermometer] = useState<number>(3);
  const [selectedBodyId, setSelectedBodyId] = useState(KID_BODY_FEELINGS[0].id);
  const [shareWithParent, setShareWithParent] = useState(false);
  const [childMessage, setChildMessage] = useState("");
  const [coachReply, setCoachReply] = useState<SupportCoachTurnOutput | null>(null);

  const selectedBody =
    KID_BODY_FEELINGS.find((b) => b.id === selectedBodyId) ?? KID_BODY_FEELINGS[0];

  async function handleAskBuddy() {
    const prompt =
      childMessage.trim() ||
      `My Worry Thermometer is ${worryThermometer}/10 and my body feels ${selectedBody.label}.`;
    const reply = await submitAiCoachTurn({
      personaMode: "child_support_coach",
      clinicalPathway: "child_feeling_safe_voice",
      interactionForm: "reflective_dialogue",
      childAgeBand: ageBand,
      userMessage: prompt,
    });
    setCoachReply(reply);
    setChildMessage("");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>SAFESTEPS CHILD & YOUTH VOICE BUDDY • PRIVATE BY DEFAULT</Text>
        <Text style={styles.heroTitle}>Your Safe Space, Feelings Thermometer & Calm Buddy</Text>
        <Text style={styles.heroSubtitle}>
          Grown-up worries and arguments are NEVER your fault. You can check in here anytime, practise
          a 60-second Superpower Reset, or reach a safe helper.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/child" as never)}
        >
          <Text style={styles.backBtnText}>← Back to Child Space</Text>
        </TouchableOpacity>
      </View>

      {/* Age Band Selector */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. Pick Your Age Group</Text>
        <View style={styles.chipRow}>
          {(
            [
              { id: "5-8", label: "Ages 5–8 (Kids)" },
              { id: "9-12", label: "Ages 9–12 (Tweens)" },
              { id: "13-17", label: "Ages 13–17 (Teens / Youth)" },
            ] as const
          ).map((band) => (
            <TouchableOpacity
              key={band.id}
              onPress={() => setAgeBand(band.id)}
              style={[styles.chip, ageBand === band.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, ageBand === band.id && styles.chipTextActive]}>
                {band.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Worry Thermometer */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          2. Worry & Felt-Safety Thermometer ({worryThermometer}/10)
        </Text>
        <Text style={styles.helperText}>
          0 = Super Calm & Safe • 5 = Medium Worry • 10 = Very Scared or Upset
        </Text>
        <View style={styles.thermometerRow}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
            <TouchableOpacity
              key={val}
              onPress={() => setWorryThermometer(val)}
              style={[
                styles.thermoPill,
                worryThermometer === val &&
                  (val >= 7 ? styles.thermoPillHigh : styles.thermoPillSafe),
              ]}
            >
              <Text
                style={[
                  styles.thermoText,
                  worryThermometer === val && styles.thermoTextActive,
                ]}
              >
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Somatic Kid Body Map */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>3. Where Are Feelings Living in Your Body Today?</Text>
        {KID_BODY_FEELINGS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedBodyId(item.id)}
            style={[
              styles.bodyCard,
              selectedBodyId === item.id && styles.bodyCardActive,
            ]}
          >
            <Text style={styles.bodyTitle}>
              {item.emoji} {item.label}
            </Text>
            <Text style={styles.bodyResetText}>{item.superpowerReset}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Child Privacy & Chat Input */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>4. Talk or Type to Your SafeSteps Buddy</Text>
        <TouchableOpacity
          onPress={() => setShareWithParent((v) => !v)}
          style={styles.privacyBanner}
        >
          <Text style={styles.privacyText}>
            {shareWithParent
              ? "🔓 You chose to share this check-in with your safe grown-up/worker"
              : "🔒 Private Mode Active: Your messages are NOT shown to parents unless you choose to share"}
          </Text>
        </TouchableOpacity>

        <TextInput
          value={childMessage}
          onChangeText={setChildMessage}
          placeholder="Tell your Buddy how your day feels..."
          placeholderTextColor="#6E848A"
          multiline
          style={styles.textInput}
        />

        <TouchableOpacity onPress={handleAskBuddy} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Check In With SafeSteps Buddy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/child/three-houses-playroom" as never)}
          style={[styles.primaryButton, { backgroundColor: "#0D9488", marginTop: 8 }]}
        >
          <Text style={styles.primaryButtonText}>
            Open My Three Houses, 5-Finger Safety Hand & Worry Monster Playroom →
          </Text>
        </TouchableOpacity>

        <VoiceChatControls
          label="Kid-Safe Voice Buddy & Balloon Breathing Audio"
          safetyNotice="Child-safe audio mode active — no scary questions, always at your pace."
          onToggle={() => {}}
        />

        {coachReply ? (
          <View
            style={[
              styles.replyBox,
              !coachReply.safetyEvaluation.safeToProceed && styles.replyBoxCrisis,
            ]}
          >
            <Text style={styles.replyTitle}>SafeSteps Buddy Says:</Text>
            <Text style={styles.replyText}>{coachReply.assistantMessage}</Text>
            <Text style={styles.followUpText}>{coachReply.followUpPrompt}</Text>
          </View>
        ) : null}
      </View>

      {/* Kids Helpline Always-Visible Banner */}
      <View style={styles.kidsHelplineCard}>
        <Text style={styles.kidsHelplineTitle}>
          Need a Real Safe Person Right Now?
        </Text>
        <Text style={styles.kidsHelplineText}>
          • Kids Helpline (Free, 24/7 for ages 5–25): 1800 55 1800{"\n"}• 13YARN (Aboriginal & Torres
          Strait Islander Support): 13 92 76{"\n"}• Emergency Police / Ambulance: 000
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F9" },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  heroCard: {
    backgroundColor: "#1B4D5C",
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  eyebrow: {
    color: "#A3E4CB",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: "#E0F2F7",
    fontSize: 14,
    lineHeight: 20,
  },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#2C6B7D",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginTop: 4,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D6E6EB",
    gap: 10,
  },
  sectionTitle: {
    color: "#143642",
    fontSize: 16,
    fontWeight: "900",
  },
  helperText: {
    color: "#456268",
    fontSize: 13,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#E9F3F6",
  },
  chipActive: {
    backgroundColor: "#1B4D5C",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1B4D5C",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  thermometerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  thermoPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E9F3F6",
    alignItems: "center",
    justifyContent: "center",
  },
  thermoPillSafe: {
    backgroundColor: "#2F7D5C",
  },
  thermoPillHigh: {
    backgroundColor: "#D97706",
  },
  thermoText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  thermoTextActive: {
    color: "#FFFFFF",
  },
  bodyCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F7FBFC",
    borderWidth: 1,
    borderColor: "#D6E6EB",
    gap: 4,
  },
  bodyCardActive: {
    backgroundColor: "#E8F6F0",
    borderColor: "#2F7D5C",
  },
  bodyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#143642",
  },
  bodyResetText: {
    fontSize: 13,
    color: "#254E5A",
    lineHeight: 19,
  },
  privacyBanner: {
    backgroundColor: "#EDF7F2",
    padding: 10,
    borderRadius: 10,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1F5B42",
  },
  textInput: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: "#C5DBE0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#143642",
    backgroundColor: "#FAFCFD",
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#2F7D5C",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  replyBox: {
    backgroundColor: "#EDF7F2",
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2F7D5C",
    gap: 6,
  },
  replyBoxCrisis: {
    backgroundColor: "#FEF2F2",
    borderColor: "#B91C1C",
  },
  replyTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#143642",
  },
  replyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#143642",
    lineHeight: 20,
  },
  followUpText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2F7D5C",
  },
  kidsHelplineCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
    gap: 6,
  },
  kidsHelplineTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#92400E",
  },
  kidsHelplineText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78350F",
    lineHeight: 20,
  },
});
