import * as Linking from "expo-linking";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import {
  createSupportGuideReply,
  type SupportGuideDomain,
  type SupportGuideReply,
} from "../../lib/engines/supportGuideEngine";
import { streamPersonalAiChat } from "../../lib/safeStepsApi";
import {
  getSupportGuideReferrals,
  type SupportRegion,
} from "../../lib/engines/supportGuideReferralEngine";

const topics: Array<{
  id: SupportGuideDomain;
  icon: string;
  title: string;
  detail: string;
}> = [
  { id: "parenting", icon: "◌", title: "Parenting", detail: "Routines, boundaries, connection and repair" },
  { id: "child_psychology", icon: "◇", title: "Child wellbeing", detail: "Emotions, behaviour and development" },
  { id: "family_violence", icon: "⌂", title: "Family violence", detail: "Safety, recovery and coercive control" },
  { id: "substance_use", icon: "↗", title: "Alcohol & other drugs", detail: "Harm reduction, urges and family impact" },
  { id: "mental_health", icon: "◎", title: "Mental health", detail: "Grounding, coping and finding care" },
];

const regionOptions: Array<{ id: SupportRegion; label: string }> = [
  { id: "queensland", label: "Queensland" },
  { id: "northern_territory", label: "Northern Territory" },
  { id: "australia", label: "Elsewhere in Australia" },
];

type SharedTurn = { user: string; assistant: string };

export default function SupportGuideScreen() {
  const router = useRouter();
  const requestController = useRef<AbortController | null>(null);
  const [domain, setDomain] = useState<SupportGuideDomain>("parenting");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<SupportGuideReply | null>(null);
  const [consent, setConsent] = useState(false);
  const [saveConsent, setSaveConsent] = useState(false);
  const [moodTrendConsent, setMoodTrendConsent] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState("");
  const [sharedHistory, setSharedHistory] = useState<SharedTurn[]>([]);
  const [region, setRegion] = useState<SupportRegion>("queensland");
  const referrals = getSupportGuideReferrals(domain, region, reply?.triage);

  function clearSession() {
    requestController.current?.abort();
    requestController.current = null;
    setMessage("");
    setReply(null);
    setError("");
    setStreamingText("");
    setConsent(false);
    setSaveConsent(false);
    setMoodTrendConsent(false);
    setConversationId(undefined);
    setSharedHistory([]);
  }

  function quickExit() {
    clearSession();
    router.replace("/dashboard");
  }

  async function continueWithGuide() {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    const localReply = createSupportGuideReply(cleanMessage, domain);
    setError("");
    if (localReply.triage.abortStandardCoaching || !consent) {
      setReply(localReply);
      if (consent) setConsent(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    requestController.current = controller;
    try {
      const result = await streamPersonalAiChat({
        conversationId,
        domain,
        message: cleanMessage,
        consentToAiSupport: true,
        consentToStoreNote: saveConsent,
        consentToMoodTrends: moodTrendConsent,
        history: sharedHistory,
      }, setStreamingText, controller.signal);
      const nextReply = { triage: localReply.triage, routing: localReply.routing, ...result.reply };
      setReply(nextReply);
      setStreamingText("");
      if (result.conversationId) setConversationId(result.conversationId);
      setSharedHistory((current) => [
        ...current,
        {
          user: cleanMessage.slice(0, 600),
          assistant: [result.reply.acknowledgement, ...result.reply.steps].join(" ").slice(0, 900),
        },
      ].slice(-4));
      setMessage("");
    } catch {
      setStreamingText("");
      setReply(localReply);
      setError("The secure AI service is unavailable, so SafeSteps has shown its on-device guidance instead.");
    } finally {
      requestController.current = null;
      setLoading(false);
      setConsent(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <Link href="/dashboard" asChild>
            <Pressable accessibilityRole="button" style={styles.backButton}>
              <Text style={styles.backText}>‹ Dashboard</Text>
            </Pressable>
          </Link>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>SafeSteps</Text>
            <Text style={styles.privateLabel}>Private support space</Text>
          </View>
        </View>

        <View style={styles.privacyControls}>
          <Pressable accessibilityRole="button" accessibilityLabel="Quick exit and clear this conversation" onPress={quickExit} style={styles.quickExitButton}>
            <Text style={styles.quickExitText}>Quick exit</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Clear the conversation from this screen" onPress={clearSession} style={styles.privacyButton}>
            <Text style={styles.privacyButtonText}>Clear screen</Text>
          </Pressable>
          <Link href="/resources/safety-planning" asChild>
            <Pressable accessibilityRole="link" style={styles.privacyButton}>
              <Text style={styles.privacyButtonText}>Safer-device guidance</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.hero}>
          <View style={styles.guideMark}><Text style={styles.guideMarkText}>♡</Text></View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>MASTER’S-INFORMED VIRTUAL SUPPORT GUIDE</Text>
            <Text style={styles.title}>A calm place to work out your next safe step</Text>
            <Text style={styles.subtitle}>
              Trauma-informed guidance for parenting, child wellbeing, family violence recovery,
              alcohol and other drugs, and mental health.
            </Text>
          </View>
        </View>

        <View style={styles.boundaryCard}>
          <Text style={styles.boundaryIcon}>i</Text>
          <Text style={styles.boundaryText}>
            SafeSteps Personal AI Support is support only—not a counsellor, clinician, lawyer,
            emergency service, or substitute for professional care. Messages are not saved unless you separately choose storage.
          </Text>
        </View>

        <View style={styles.safetyStrip}>
          <View style={styles.safetyCopy}>
            <Text style={styles.safetyTitle}>Is anyone in immediate danger?</Text>
            <Text style={styles.safetyText}>Call Triple Zero. If using this device is unsafe, close the app and use a safer device.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call emergency services on 000"
            style={styles.emergencyButton}
            onPress={() => void Linking.openURL("tel:000")}
          >
            <Text style={styles.emergencyButtonText}>Call 000</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>1 · CHOOSE A FOCUS</Text>
          <Text style={styles.sectionTitle}>What would feel most helpful right now?</Text>
          <View style={styles.topicGrid}>
            {topics.map((topic) => {
              const selected = topic.id === domain;
              return (
                <Pressable
                  key={topic.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => { setDomain(topic.id); clearSession(); }}
                  style={[styles.topicCard, selected && styles.topicCardSelected]}
                >
                  <Text style={[styles.topicIcon, selected && styles.topicIconSelected]}>{topic.icon}</Text>
                  <Text style={[styles.topicTitle, selected && styles.topicTitleSelected]}>{topic.title}</Text>
                  <Text style={[styles.topicDetail, selected && styles.topicDetailSelected]}>{topic.detail}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>2 · SHARE ONLY WHAT FEELS SAFE</Text>
          <Text style={styles.sectionTitle}>What is happening?</Text>
          <View style={styles.quickSupportRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Call Lifeline crisis support on 13 11 14" onPress={() => void Linking.openURL("tel:131114")} style={styles.quickSupportButton}>
              <Text style={styles.quickSupportText}>Call crisis support</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Call 1800RESPECT domestic violence support" onPress={() => void Linking.openURL("tel:1800737732")} style={styles.quickSupportButton}>
              <Text style={styles.quickSupportText}>Call DV support</Text>
            </Pressable>
            <Link href="/facilitator" asChild><Pressable accessibilityRole="link" style={styles.quickSupportButton}><Text style={styles.quickSupportText}>Support team</Text></Pressable></Link>
            <Link href="/referral-support" asChild><Pressable accessibilityRole="link" style={styles.quickSupportButton}><Text style={styles.quickSupportText}>Support options</Text></Pressable></Link>
            <Link href="/personal-ai-memory" asChild><Pressable accessibilityRole="link" style={styles.quickSupportButton}><Text style={styles.quickSupportText}>My saved preferences</Text></Pressable></Link>
            <Link href="/personal-ai-mood-trends" asChild><Pressable accessibilityRole="link" style={styles.quickSupportButton}><Text style={styles.quickSupportText}>My communication cues</Text></Pressable></Link>
          </View>
          {sharedHistory.length > 0 ? (
            <View accessibilityLabel="Conversation so far" style={styles.transcript}>
              <Text style={styles.transcriptTitle}>Conversation so far</Text>
              {sharedHistory.map((turn, index) => (
                <View key={`${index}-${turn.user.slice(0, 12)}`} style={styles.turn}>
                  <View style={styles.userBubble}>
                    <Text style={styles.bubbleLabel}>You</Text>
                    <Text style={styles.userBubbleText}>{turn.user}</Text>
                  </View>
                  <View style={styles.assistantBubble}>
                    <Text style={styles.bubbleLabel}>SafeSteps Personal AI Support</Text>
                    <Text style={styles.assistantBubbleText}>{turn.assistant}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
          <TextInput
            accessibilityLabel="Describe what is happening"
            value={message}
            onChangeText={(value) => { setMessage(value); setReply(null); }}
            placeholder="You can keep this brief. Avoid names, addresses, case numbers or identifying details…"
            placeholderTextColor="#70818A"
            multiline
            maxLength={1200}
            style={styles.input}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.characterCount}>{message.length}/1200</Text>
            <Pressable
              accessibilityRole="button"
              disabled={!message.trim() || loading}
              onPress={continueWithGuide}
              style={[styles.continueButton, (!message.trim() || loading) && styles.continueButtonDisabled]}
            >
              <Text style={styles.continueButtonText}>{loading ? "Finding a safe next step…" : "Find my next step"}</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
            onPress={() => setConsent((current) => !current)}
            style={styles.consentRow}
          >
            <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
              <Text style={styles.checkmark}>{consent ? "✓" : ""}</Text>
            </View>
            <Text style={styles.consentText}>
              I consent to sending this message and up to four previously shared session turns to the SafeSteps AI service for this response.
              SafeSteps will not add it to my case evidence or save it on this device.
            </Text>
          </Pressable>
          <Text style={styles.consentHint}>
            Without consent, SafeSteps uses only the limited on-device guide. Urgent safety screening always happens before a message is sent.
          </Text>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: saveConsent }} onPress={() => setSaveConsent((value) => !value)} style={styles.consentRow}>
            <View style={[styles.checkbox, saveConsent && styles.checkboxChecked]}><Text style={styles.checkmark}>{saveConsent ? "✓" : ""}</Text></View>
            <Text style={styles.consentText}>Save this conversation and a minimum-necessary support note for future continuity. Safety-sensitive user wording is replaced with a non-verbatim marker.</Text>
          </Pressable>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: moodTrendConsent }} onPress={() => setMoodTrendConsent((value) => !value)} style={styles.consentRow}>
            <View style={[styles.checkbox, moodTrendConsent && styles.checkboxChecked]}><Text style={styles.checkmark}>{moodTrendConsent ? "✓" : ""}</Text></View>
            <Text style={styles.consentText}>Save a 90-day non-diagnostic mood-score snapshot. Message text is not stored in the mood record, and the score is not a clinical assessment or case-evidence measure.</Text>
          </Pressable>
          <Text style={styles.oneQuestionHint}>We’ll do one question and one safe step at a time.</Text>
          {error ? <Text accessibilityLiveRegion="polite" style={styles.serviceError}>{error}</Text> : null}
          {sharedHistory.length > 0 ? (
            <View style={styles.sessionRow}>
              <Text style={styles.sessionText}>
                Private session context: {sharedHistory.length} of 4 shared turns held in memory only.
              </Text>
              <Pressable accessibilityRole="button" onPress={clearSession} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear now</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {streamingText ? <View style={styles.streamingCard}><Text style={styles.streamingLabel}>SafeSteps Personal AI Support</Text><Text style={styles.streamingText}>{streamingText}<Text accessibilityElementsHidden>▌</Text></Text><Text style={styles.streamingNote}>This response was fully safety-checked before display.</Text></View> : null}

        {reply ? (
          <View
            accessibilityLiveRegion="polite"
            style={[styles.replyCard, reply.triage.abortStandardCoaching && styles.replyCardUrgent]}
          >
            <Text style={styles.replyKicker}>
              {reply.triage.abortStandardCoaching ? "SAFETY RESPONSE" : "A SMALL PLAN"}
            </Text>
            <Text style={styles.replyTitle}>{reply.heading}</Text>
            <Text style={styles.replyText}>{reply.acknowledgement}</Text>
            <View style={styles.steps}>
              {reply.steps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
            <View style={styles.followUp}>
              <Text style={styles.followUpLabel}>If it is safe to continue</Text>
              <Text style={styles.followUpText}>{reply.followUp}</Text>
            </View>
            <View style={styles.handoffRow}>
              <Link href="/facilitator" asChild>
                <Pressable style={styles.handoffButton}>
                  <Text style={styles.handoffButtonText}>Talk to my support team</Text>
                </Pressable>
              </Link>
              <Link href="/referrals" asChild>
                <Pressable style={styles.handoffButtonSecondary}>
                  <Text style={styles.handoffButtonSecondaryText}>Review human referrals</Text>
                </Pressable>
              </Link>
            </View>
            <Text style={styles.handoffNote}>
              Nothing is shared automatically. If you request human support, SafeSteps will show what minimum information would be shared and ask for consent first. SafeSteps never dispatches emergency services automatically.
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>HUMAN SUPPORT</Text>
          <Text style={styles.sectionTitle}>Talk with a trained person</Text>
          <Text style={styles.supportIntro}>
            Choose your region yourself. SafeSteps does not request or infer your location. Calling or opening a website may leave device, browser or phone records.
          </Text>
          <View style={styles.regionRow}>
            {regionOptions.map((option) => {
              const selected = option.id === region;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setRegion(option.id)}
                  style={[styles.regionButton, selected && styles.regionButtonSelected]}
                >
                  <Text style={[styles.regionButtonText, selected && styles.regionButtonTextSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.contactGrid}>
            {referrals.map((contact) => (
              <View key={contact.id} style={[styles.contactCard, contact.urgent && styles.contactCardUrgent]}>
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
                <Text style={styles.contactDetail}>{contact.detail}</Text>
                <Text style={styles.contactAvailability}>{contact.availability}</Text>
                {contact.safetyNote ? <Text style={styles.contactSafety}>{contact.safetyNote}</Text> : null}
                <View style={styles.contactActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${contact.label} on ${contact.phone}`}
                    onPress={() => void Linking.openURL(contact.dialTarget)}
                    style={styles.contactCallButton}
                  >
                    <Text style={styles.contactCallButtonText}>Call</Text>
                  </Pressable>
                  {contact.website ? (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Open ${contact.label} website`}
                      onPress={() => void Linking.openURL(contact.website!)}
                      style={styles.contactWebButton}
                    >
                      <Text style={styles.contactWebButtonText}>Website</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        <AppBottomNav />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const colors = {
  ink: "#12303A",
  muted: "#536B73",
  teal: "#087F78",
  tealDark: "#075A58",
  mint: "#E4F3EE",
  cream: "#FBF8F1",
  white: "#FFFFFF",
  border: "#CBDDD8",
  coral: "#B94738",
  coralSoft: "#FBE8E3",
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { width: "100%", maxWidth: 1120, alignSelf: "center", padding: 20, paddingBottom: 40, gap: 24 },
  topBar: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  backButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  backText: { color: colors.tealDark, fontSize: 16, fontWeight: "800" },
  brandBlock: { alignItems: "flex-end" },
  brand: { color: colors.tealDark, fontSize: 22, fontWeight: "900" },
  privateLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  privacyControls: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  quickExitButton: { minHeight: 48, justifyContent: "center", borderRadius: 9, paddingHorizontal: 18, backgroundColor: "#7D2C22" },
  quickExitText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  privacyButton: { minHeight: 48, justifyContent: "center", borderRadius: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.tealDark, backgroundColor: colors.white },
  privacyButtonText: { color: colors.tealDark, fontSize: 13, fontWeight: "900" },
  hero: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 22, borderRadius: 20, padding: 28, backgroundColor: "#DCEFEB" },
  guideMark: { width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  guideMarkText: { color: colors.teal, fontSize: 42, fontWeight: "700" },
  heroCopy: { flex: 1, minWidth: 240, gap: 8 },
  eyebrow: { color: colors.tealDark, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 39, fontWeight: "900", maxWidth: 760 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, maxWidth: 760 },
  boundaryCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  boundaryIcon: { width: 24, height: 24, borderRadius: 12, overflow: "hidden", color: colors.white, backgroundColor: colors.teal, textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  boundaryText: { flex: 1, color: colors.muted, fontSize: 14, lineHeight: 21 },
  safetyStrip: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, borderRadius: 14, padding: 18, backgroundColor: colors.coralSoft, borderWidth: 1, borderColor: "#E7B9AF" },
  safetyCopy: { flex: 1, minWidth: 230, gap: 3 },
  safetyTitle: { color: "#7D2C22", fontSize: 17, fontWeight: "900" },
  safetyText: { color: "#7D2C22", fontSize: 14, lineHeight: 20 },
  emergencyButton: { minHeight: 46, justifyContent: "center", borderRadius: 10, paddingHorizontal: 20, backgroundColor: colors.coral },
  emergencyButtonText: { color: colors.white, fontSize: 16, fontWeight: "900" },
  section: { gap: 12 },
  sectionKicker: { color: colors.teal, fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
  sectionTitle: { color: colors.ink, fontSize: 24, lineHeight: 30, fontWeight: "900" },
  transcript: { gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: "#F5FAF8" },
  transcriptTitle: { color: colors.tealDark, fontSize: 13, fontWeight: "900" },
  quickSupportRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickSupportButton: { minHeight: 46, justifyContent: "center", paddingHorizontal: 13, borderRadius: 9, borderWidth: 1, borderColor: colors.teal, backgroundColor: colors.white },
  quickSupportText: { color: colors.tealDark, fontSize: 13, fontWeight: "900" },
  turn: { gap: 8 },
  userBubble: { alignSelf: "flex-end", maxWidth: "88%", gap: 3, padding: 12, borderRadius: 12, backgroundColor: colors.tealDark },
  assistantBubble: { alignSelf: "flex-start", maxWidth: "92%", gap: 3, padding: 12, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  bubbleLabel: { color: "#6FAEA6", fontSize: 11, fontWeight: "900" },
  userBubbleText: { color: colors.white, fontSize: 14, lineHeight: 20 },
  assistantBubbleText: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  topicCard: { flexGrow: 1, flexBasis: 185, minHeight: 150, gap: 7, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  topicCardSelected: { backgroundColor: colors.tealDark, borderColor: colors.tealDark },
  topicIcon: { color: colors.teal, fontSize: 26, fontWeight: "900" },
  topicIconSelected: { color: "#9FE0D7" },
  topicTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  topicTitleSelected: { color: colors.white },
  topicDetail: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  topicDetailSelected: { color: "#D1E9E5" },
  input: { minHeight: 150, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, color: colors.ink, fontSize: 16, lineHeight: 23, textAlignVertical: "top" },
  inputFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  characterCount: { color: colors.muted, fontSize: 12 },
  continueButton: { minHeight: 48, justifyContent: "center", borderRadius: 10, paddingHorizontal: 20, backgroundColor: colors.teal },
  continueButtonDisabled: { opacity: 0.45 },
  continueButtonText: { color: colors.white, fontSize: 15, fontWeight: "900" },
  consentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.teal, backgroundColor: colors.white },
  checkboxChecked: { backgroundColor: colors.teal },
  checkmark: { color: colors.white, fontSize: 15, fontWeight: "900" },
  consentText: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 19 },
  consentHint: { color: colors.muted, fontSize: 12, lineHeight: 18, paddingLeft: 34 },
  oneQuestionHint: { color: colors.tealDark, fontSize: 13, lineHeight: 19, fontWeight: "800" },
  serviceError: { color: "#7D2C22", fontSize: 13, lineHeight: 19, fontWeight: "700" },
  streamingCard: { gap: 8, padding: 18, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  streamingLabel: { color: colors.tealDark, fontSize: 12, fontWeight: "900" },
  streamingText: { color: colors.ink, fontSize: 15, lineHeight: 23 },
  streamingNote: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  sessionRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 10, padding: 12, backgroundColor: colors.mint },
  sessionText: { flex: 1, minWidth: 220, color: colors.tealDark, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  clearButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: colors.teal },
  clearButtonText: { color: colors.tealDark, fontSize: 13, fontWeight: "900" },
  replyCard: { gap: 14, padding: 22, borderRadius: 16, borderWidth: 1, borderColor: "#A9D8CE", backgroundColor: "#EEF8F5" },
  replyCardUrgent: { borderColor: "#E0A69A", backgroundColor: colors.coralSoft },
  replyKicker: { color: colors.tealDark, fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
  replyTitle: { color: colors.ink, fontSize: 24, fontWeight: "900" },
  replyText: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  steps: { gap: 10 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, overflow: "hidden", color: colors.white, backgroundColor: colors.teal, textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  stepText: { flex: 1, color: colors.ink, fontSize: 15, lineHeight: 22 },
  followUp: { gap: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  followUpLabel: { color: colors.tealDark, fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  followUpText: { color: colors.ink, fontSize: 16, lineHeight: 23, fontWeight: "700" },
  handoffRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingTop: 4 },
  handoffButton: { minHeight: 46, justifyContent: "center", borderRadius: 9, paddingHorizontal: 16, backgroundColor: colors.tealDark },
  handoffButtonText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  handoffButtonSecondary: { minHeight: 46, justifyContent: "center", borderRadius: 9, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.tealDark, backgroundColor: colors.white },
  handoffButtonSecondaryText: { color: colors.tealDark, fontSize: 14, fontWeight: "900" },
  handoffNote: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  supportIntro: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  regionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  regionButton: { minHeight: 42, justifyContent: "center", borderRadius: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  regionButtonSelected: { borderColor: colors.tealDark, backgroundColor: colors.tealDark },
  regionButtonText: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  regionButtonTextSelected: { color: colors.white },
  contactGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  contactCard: { flexGrow: 1, flexBasis: 190, minHeight: 112, gap: 4, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  contactCardUrgent: { borderColor: "#E0A69A", backgroundColor: colors.coralSoft },
  contactLabel: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  contactPhone: { color: colors.tealDark, fontSize: 20, fontWeight: "900" },
  contactDetail: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  contactAvailability: { color: colors.tealDark, fontSize: 12, lineHeight: 18, fontWeight: "800" },
  contactSafety: { color: "#7D2C22", fontSize: 12, lineHeight: 18, fontWeight: "700" },
  contactActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 6 },
  contactCallButton: { minHeight: 40, justifyContent: "center", borderRadius: 8, paddingHorizontal: 15, backgroundColor: colors.teal },
  contactCallButtonText: { color: colors.white, fontSize: 13, fontWeight: "900" },
  contactWebButton: { minHeight: 40, justifyContent: "center", borderRadius: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.teal },
  contactWebButtonText: { color: colors.tealDark, fontSize: 13, fontWeight: "900" },
});
