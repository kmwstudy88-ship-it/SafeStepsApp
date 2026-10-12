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

import { submitCouplesDfvSafetyCheck } from "../../lib/aiSupportApi";
import { FOUR_STAGE_COUPLES_DFV_RESTORATION_PATHWAY } from "../../lib/data/therapeuticCoachingProtocols";
import {
  buildSharedTimeOutContract,
  rewritePartnerMessageToBiff,
  type CouplesDfvSafetyCheckResult,
  type SafePartnerMessageBridgeResult,
  type SharedTimeOutContract,
} from "../../lib/engines/aiSupportCoachEngine";

export default function CouplesFamilyDfvRestorationScreen() {
  const router = useRouter();

  // Private Felt-Safety Check-In State (Never Shown to Partner)
  const [checkPhase, setCheckPhase] = useState<"pre_session" | "mid_session_pulse" | "post_session">("pre_session");
  const [feltSafetyScore, setFeltSafetyScore] = useState<number>(8);
  const [fearOfRetaliation, setFearOfRetaliation] = useState(false);
  const [coercedToParticipate, setCoercedToParticipate] = useState(false);
  const [immediateDanger, setImmediateDanger] = useState(false);
  const [privateNotes, setPrivateNotes] = useState("");
  const [safetyCheckResult, setSafetyCheckResult] = useState<CouplesDfvSafetyCheckResult | null>(null);

  // BIFF Safe Partner Message Bridge State
  const [draftMessage, setDraftMessage] = useState(
    "You never stick to the pickup time and even the kids know you are always late! Tell me where you are right now.",
  );
  const [childTopic, setChildTopic] = useState("school pickup and bedtime handover");
  const [biffResult, setBiffResult] = useState<SafePartnerMessageBridgeResult | null>(() =>
    rewritePartnerMessageToBiff(
      "You never stick to the pickup time and even the kids know you are always late! Tell me where you are right now.",
      "school pickup and bedtime handover",
    ),
  );

  // Shared 20-Minute Time-Out Contract State
  const [customCodeWord, setCustomCodeWord] = useState("Yellow Light — Taking 20 for the Kids");
  const [coolingMinutes, setCoolingMinutes] = useState(20);
  const [timeOutContract, setTimeOutContract] = useState<SharedTimeOutContract>(() =>
    buildSharedTimeOutContract({
      agreedCodeWord: "Yellow Light — Taking 20 for the Kids",
      coolingDurationMinutes: 20,
    }),
  );

  async function handleRunPrivateSafetyCheck() {
    const res = await submitCouplesDfvSafetyCheck({
      sessionId: "couples-dfv-session",
      participantUserId: "current-user",
      checkPhase,
      feltSafetyScore,
      fearOfRetaliation,
      coercedToParticipate,
      immediateDanger,
      privateNotes,
    });
    setSafetyCheckResult(res);
  }

  function handleRunBiffRewrite() {
    setBiffResult(rewritePartnerMessageToBiff(draftMessage, childTopic));
  }

  function handleUpdateTimeOutContract(minutes: number) {
    setCoolingMinutes(minutes);
    setTimeOutContract(
      buildSharedTimeOutContract({
        agreedCodeWord: customCodeWord,
        coolingDurationMinutes: minutes,
      }),
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>
          SAFE & TOGETHER™ + DVFCT CLINICAL PROTOCOL • SILENT SAFETY PIVOT PROTECTION
        </Text>
        <Text style={styles.heroTitle}>
          Couples & Families Where DFV Is Present — 4-Stage Restoration Hub
        </Text>
        <Text style={styles.heroSubtitle}>
          Supports intact couples, separated co-parents, and families seeking healing where DFV has
          occurred — strictly gated by private felt-safety check-ins, non-blaming accountability,
          and zero child triangulation.
        </Text>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/ai-support-coach" as never)}
          >
            <Text style={styles.navBtnText}>← Back to AI Support Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/ai-support-coach/check-in-scales" as never)}
          >
            <Text style={styles.navBtnText}>DVFCT-R & MARAM Scales →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 1: Private Pre/Mid/Post Felt-Safety Check-In */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionBadge}>STRICTLY PRIVATE • NEVER VISIBLE TO PARTNER</Text>
        <Text style={styles.sectionTitle}>
          1. Mandatory Private Felt-Safety Check-In & Silent Safety Pivot
        </Text>
        <Text style={styles.helperText}>
          If you score felt safety below 7/10 or mark fear/coercion, the system silently switches to
          Parallel Individual Mode using a routine curriculum message so your partner is never
          notified of your check-in answer.
        </Text>

        <View style={styles.chipRow}>
          {(
            [
              { id: "pre_session", label: "Pre-Session Gate" },
              { id: "mid_session_pulse", label: "Mid-Session Pulse" },
              { id: "post_session", label: "Post-Session Check" },
            ] as const
          ).map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setCheckPhase(p.id)}
              style={[styles.chip, checkPhase === p.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, checkPhase === p.id && styles.chipTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>
          How safe and free to speak honestly do you feel right now? ({feltSafetyScore}/10)
        </Text>
        <View style={styles.scoreRow}>
          {[0, 2, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <TouchableOpacity
              key={score}
              onPress={() => setFeltSafetyScore(score)}
              style={[
                styles.scorePill,
                feltSafetyScore === score &&
                  (score < 7 ? styles.scorePillDanger : styles.scorePillSafe),
              ]}
            >
              <Text
                style={[
                  styles.scorePillText,
                  feltSafetyScore === score && styles.scorePillTextActive,
                ]}
              >
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.toggleList}>
          <TouchableOpacity
            onPress={() => setFearOfRetaliation((v) => !v)}
            style={[styles.toggleCard, fearOfRetaliation && styles.toggleCardAlert]}
          >
            <Text style={styles.toggleCardText}>
              {fearOfRetaliation ? "✓ " : "○ "}I worry about arguments, punishment, or retaliation
              after this session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCoercedToParticipate((v) => !v)}
            style={[styles.toggleCard, coercedToParticipate && styles.toggleCardAlert]}
          >
            <Text style={styles.toggleCardText}>
              {coercedToParticipate ? "✓ " : "○ "}I felt pressured or told what I had to say in this
              session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setImmediateDanger((v) => !v)}
            style={[styles.toggleCard, immediateDanger && styles.toggleCardAlert]}
          >
            <Text style={styles.toggleCardText}>
              {immediateDanger ? "✓ " : "○ "}I or the children are in immediate physical danger right
              now
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={privateNotes}
          onChangeText={setPrivateNotes}
          placeholder="Optional private note for your specialist worker only (never shared with partner)..."
          placeholderTextColor="#7A8E93"
          style={styles.textInput}
        />

        <TouchableOpacity onPress={handleRunPrivateSafetyCheck} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Verify Private Safety Gate</Text>
        </TouchableOpacity>

        {safetyCheckResult ? (
          <View
            style={[
              styles.resultBox,
              safetyCheckResult.silentPivotTriggered ? styles.resultBoxPivot : styles.resultBoxSafe,
            ]}
          >
            <Text style={styles.resultTitle}>
              Mode Decision: {safetyCheckResult.recommendedMode.toUpperCase()} (
              {safetyCheckResult.permittedStage.replace(/_/g, " ")})
            </Text>
            <Text style={styles.privateMsgText}>
              Private Message to You: {safetyCheckResult.privateSurvivorSupportMessage}
            </Text>
            <View style={styles.neutralNoticeBox}>
              <Text style={styles.neutralNoticeLabel}>
                Neutral Screen Notice Shown on Partner&apos;s Device:
              </Text>
              <Text style={styles.neutralNoticeText}>
                &ldquo;{safetyCheckResult.partnerFacingNeutralNotice}&rdquo;
              </Text>
            </View>
            <Text style={styles.auditText}>
              SHA-256 Audit: {safetyCheckResult.auditSha256.slice(0, 24)}...
            </Text>
          </View>
        ) : null}
      </View>

      {/* Section 2: 4-Stage Safety-Gated Couples & Family DFV Restoration Pathway */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          2. The 4-Stage Safety-Gated Couples & Family DFV Restoration Pathway
        </Text>
        {FOUR_STAGE_COUPLES_DFV_RESTORATION_PATHWAY.map((stage) => (
          <View key={stage.id} style={styles.stageCard}>
            <Text style={styles.stageHeader}>{stage.title}</Text>
            <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>
            <Text style={styles.stageLabel}>Entry Prerequisites:</Text>
            {stage.entryCriteria.map((c) => (
              <Text key={c} style={styles.stageBullet}>
                • {c}
              </Text>
            ))}
            <Text style={styles.stageLabel}>Coaching Focus:</Text>
            {stage.coachFocus.map((f) => (
              <Text key={f} style={styles.stageBullet}>
                • {f}
              </Text>
            ))}
            <Text style={styles.pivotRuleText}>Safety Rule: {stage.automaticSafetyPivotRule}</Text>
          </View>
        ))}
      </View>

      {/* Section 3: AI-Bridged Safe Partner Message Coach (BIFF) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          3. AI-Bridged Safe Partner & Co-Parent Message Coach (BIFF)
        </Text>
        <Text style={styles.helperText}>
          Rewrites tense, emotional, or blaming drafts into Brief, Informative, Friendly, and Firm
          (BIFF) child-focused messages while screening out surveillance and child triangulation.
        </Text>

        <Text style={styles.fieldLabel}>Child Logistics Topic:</Text>
        <TextInput
          value={childTopic}
          onChangeText={setChildTopic}
          style={styles.singleLineInput}
        />

        <Text style={styles.fieldLabel}>Your Raw Message Draft:</Text>
        <TextInput
          value={draftMessage}
          onChangeText={setDraftMessage}
          multiline
          style={styles.textInput}
        />

        <TouchableOpacity onPress={handleRunBiffRewrite} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Rewrite into Safe BIFF Message</Text>
        </TouchableOpacity>

        {biffResult ? (
          <View style={styles.biffOutputBox}>
            <Text style={styles.biffOutputTitle}>
              Safe Child-Focused BIFF Message Ready to Use:
            </Text>
            <Text style={styles.biffOutputText}>
              &ldquo;{biffResult.biffRewrittenMessage}&rdquo;
            </Text>
            {biffResult.detectedToneFlags.length > 0 ? (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.flagHeader}>
                  Filtered Escalation / Triangulation Risks:
                </Text>
                {biffResult.detectedToneFlags.map((flag) => (
                  <Text key={flag} style={styles.flagItem}>
                    • {flag}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Section 4: Synchronised 20-Minute Time-Out Safety Contract Builder */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          4. Synchronised De-Escalation & Time-Out Safety Contract Builder
        </Text>
        <Text style={styles.fieldLabel}>Agreed Household Time-Out Code Phrase:</Text>
        <TextInput
          value={customCodeWord}
          onChangeText={(text) => {
            setCustomCodeWord(text);
            setTimeOutContract(
              buildSharedTimeOutContract({
                agreedCodeWord: text,
                coolingDurationMinutes: coolingMinutes,
              }),
            );
          }}
          style={styles.singleLineInput}
        />

        <Text style={styles.fieldLabel}>Physiological Cooling Duration (Minimum 20 mins):</Text>
        <View style={styles.chipRow}>
          {[20, 30, 45, 60].map((mins) => (
            <TouchableOpacity
              key={mins}
              onPress={() => handleUpdateTimeOutContract(mins)}
              style={[styles.chip, coolingMinutes === mins && styles.chipActive]}
            >
              <Text style={[styles.chipText, coolingMinutes === mins && styles.chipTextActive]}>
                {mins} Minutes
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contractBox}>
          <Text style={styles.contractTitle}>
            Active Household Time-Out Contract ({timeOutContract.coolingDurationMinutes} mins)
          </Text>
          <Text style={styles.stageLabel}>Early 3/10 Body Signals to Watch For:</Text>
          {timeOutContract.earlyBodySignals.map((sig) => (
            <Text key={sig} style={styles.stageBullet}>
              • {sig}
            </Text>
          ))}
          <Text style={styles.stageLabel}>Safe Exit Steps:</Text>
          {timeOutContract.exitProtocol.map((step) => (
            <Text key={step} style={styles.stageBullet}>
              • {step}
            </Text>
          ))}
          <Text style={styles.stageLabel}>What We Say to Reassure the Children:</Text>
          <Text style={styles.childReassuranceBox}>
            &ldquo;{timeOutContract.childReassuranceScript}&rdquo;
          </Text>
          <Text style={styles.stageLabel}>Strictly Prohibited Behaviours:</Text>
          {timeOutContract.prohibitedBehaviours.map((rule) => (
            <Text key={rule} style={styles.flagItem}>
              • {rule}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F6" },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  heroCard: {
    backgroundColor: "#1B3B48",
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  eyebrow: {
    color: "#8ED1B7",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: "#D5E5E8",
    fontSize: 13,
    lineHeight: 19,
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  navBtn: {
    backgroundColor: "#2C5566",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  navBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE6E5",
    gap: 10,
  },
  sectionBadge: {
    color: "#9A3412",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: "#143642",
    fontSize: 16,
    fontWeight: "900",
  },
  helperText: {
    color: "#456268",
    fontSize: 13,
    lineHeight: 19,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#EDF3F2",
  },
  chipActive: {
    backgroundColor: "#143642",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#143642",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  scoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  scorePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDF3F2",
    alignItems: "center",
    justifyContent: "center",
  },
  scorePillSafe: {
    backgroundColor: "#2F7D5C",
  },
  scorePillDanger: {
    backgroundColor: "#B91C1C",
  },
  scorePillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  scorePillTextActive: {
    color: "#FFFFFF",
  },
  toggleList: {
    gap: 8,
  },
  toggleCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F5F8F8",
    borderWidth: 1,
    borderColor: "#D5E2DF",
  },
  toggleCardAlert: {
    backgroundColor: "#FEF2F2",
    borderColor: "#DC2626",
  },
  toggleCardText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#143642",
  },
  singleLineInput: {
    borderWidth: 1,
    borderColor: "#C8D8D5",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: "#143642",
    backgroundColor: "#FAFCFC",
  },
  textInput: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: "#C8D8D5",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: "#143642",
    backgroundColor: "#FAFCFC",
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#2F7D5C",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  resultBox: {
    padding: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
  },
  resultBoxSafe: {
    backgroundColor: "#EDF7F2",
    borderColor: "#2F7D5C",
  },
  resultBoxPivot: {
    backgroundColor: "#FFFBEB",
    borderColor: "#D97706",
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#143642",
  },
  privateMsgText: {
    fontSize: 13,
    color: "#143642",
    lineHeight: 19,
  },
  neutralNoticeBox: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  neutralNoticeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
  },
  neutralNoticeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2,
  },
  auditText: {
    fontSize: 11,
    color: "#64748B",
  },
  stageCard: {
    backgroundColor: "#F8FAFA",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE7E5",
    gap: 4,
  },
  stageHeader: {
    fontSize: 14,
    fontWeight: "900",
    color: "#143642",
  },
  stageSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2F7D5C",
    marginBottom: 4,
  },
  stageLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#143642",
    marginTop: 4,
  },
  stageBullet: {
    fontSize: 12,
    color: "#2C4C54",
    lineHeight: 18,
  },
  pivotRuleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9A3412",
    marginTop: 4,
  },
  biffOutputBox: {
    backgroundColor: "#EDF7F2",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  biffOutputTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#143642",
  },
  biffOutputText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F5B42",
    lineHeight: 20,
  },
  flagHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#991B1B",
  },
  flagItem: {
    fontSize: 12,
    color: "#991B1B",
    lineHeight: 18,
  },
  contractBox: {
    backgroundColor: "#F2F8F5",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  contractTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#143642",
  },
  childReassuranceBox: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F5B42",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
  },
});
