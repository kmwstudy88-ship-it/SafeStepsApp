import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  generateAdaptiveMicroPrescriptions,
  submitAddictionUrgeSurfShield,
  submitCulturalSewbYarningMap,
  submitKinshipCarerProQolCheck,
  submitNeuroSleepHouseholdToolkit,
} from "../../lib/aiSupportApi";
import type { AdaptiveMicroPrescriptionResult } from "../../lib/engines/forensicConvergenceAndChildPlayroomEngine";
import type {
  AddictionRecoveryShieldResult,
  CulturalSewbYarningResult,
  KinshipCarerSupportResult,
  NeuroSleepHouseholdResult,
} from "../../lib/engines/specializedClinicalPopulationsEngine";

const SENSORY_PRESETS = [
  { id: "dim_lighting", label: "🌙 Low-Lux Sensory Lighting (<20 lux)" },
  { id: "deep_pressure", label: "🛌 Weighted Blanket / Deep Pressure" },
  { id: "visual_schedule", label: "📋 Predictable Visual Routine Cards" },
  { id: "brown_noise", label: "🎧 Calming Brown Noise / Voice Tone" },
  { id: "seamless_fabrics", label: "👕 Tagless & Non-Constrictive Clothing" },
];

export default function SpecializedClinicalToolkitsScreen() {
  const router = useRouter();

  // Module 5: Addiction Urge-Surfing & MAT Shield
  const [cravingBefore, setCravingBefore] = useState("7");
  const [cravingAfter, setCravingAfter] = useState("3");
  const [highRiskEvent, setHighRiskEvent] = useState("Thursday Payday & Court Mention");
  const [matChecked, setMatChecked] = useState(true);
  const [addictionResult, setAddictionResult] = useState<AddictionRecoveryShieldResult | null>(null);

  // 90-Second TIPP Urge Surf Timer
  const [tippTimerSeconds, setTippTimerSeconds] = useState(90);
  const [tippTimerActive, setTippTimerActive] = useState(false);

  useEffect(() => {
    if (!tippTimerActive) return;
    const interval = setInterval(() => {
      setTippTimerSeconds((prev) => {
        if (prev <= 1) {
          setTippTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tippTimerActive]);

  // Module 6: Neurodivergent & Trauma Sleep Toolkit
  const [selectedSensoryPresets, setSelectedSensoryPresets] = useState<string[]>([
    "dim_lighting",
    "deep_pressure",
    "visual_schedule",
  ]);
  const [neuroResult, setNeuroResult] = useState<NeuroSleepHouseholdResult | null>(null);

  // Module 7: Kinship & Foster Carer ProQOL
  const [compassionScore, setCompassionScore] = useState("38");
  const [burnoutScore, setBurnoutScore] = useState("26");
  const [stsScore, setStsScore] = useState("24");
  const [carerResult, setCarerResult] = useState<KinshipCarerSupportResult | null>(null);

  // Module 8: First Nations Cultural SEWB 7-Domain Yarning Map
  const [domainFamilyKinship, setDomainFamilyKinship] = useState(
    "Aunty and Grandmother supporting afternoon school pickup and yarning circles",
  );
  const [domainCountry, setDomainCountry] = useState(
    "Weekend walk on Country by the river with the children",
  );
  const [culturalWorkerName, setCulturalWorkerName] = useState("Uncle David (Cultural Worker)");
  const [culturalAttestationNote, setCulturalAttestationNote] = useState(
    "Co-designed with cultural safety protocols; upholds Aboriginal Child Placement Principles.",
  );
  const [sewbResult, setSewbResult] = useState<CulturalSewbYarningResult | null>(null);

  // Module 11: Closed-Loop Adaptive Micro-Lessons & 7/14/30d Re-Tests
  const [prescriptionResult, setPrescriptionResult] =
    useState<AdaptiveMicroPrescriptionResult | null>(null);

  const toggleSensoryPreset = (id: string) => {
    setSelectedSensoryPresets((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleRunAddictionShield = async () => {
    const res = await submitAddictionUrgeSurfShield({
      participantUserId: "parent-local",
      cravingBefore0to10: Number(cravingBefore) || 7,
      cravingAfter0to10: Number(cravingAfter) || 3,
      urgeSurfSecondsCompleted: 90 - tippTimerSeconds,
      haltSTriggers: ["tired_or_sleep_deprived", "stressed_court_or_contact_worry"],
      upcomingHighRiskEvent: highRiskEvent,
      matAdherenceChecked: matChecked,
      lapseOccurred: false,
      childSafeCareArranged: true,
    });
    setAddictionResult(res);
  };

  const handleRunNeuroSleep = async () => {
    const res = await submitNeuroSleepHouseholdToolkit({
      participantUserId: "parent-local",
      neurodivergentTraits: [
        "autism_sensory_predictability",
        "fasd_concrete_visual_single_step",
        "parent_abi_or_idd_plain_language_chunking",
      ],
      sensoryTriggers: selectedSensoryPresets.map((id) =>
        SENSORY_PRESETS.find((p) => p.id === id)?.label || id,
      ),
      sleepDistressSignals: ["nightmares_or_night_terrors", "bedtime_hyperarousal_or_stall_tactics"],
    });
    setNeuroResult(res);
  };

  const handleRunCarerProQol = async () => {
    const res = await submitKinshipCarerProQolCheck({
      carerUserId: "carer-local",
      carerType: "kinship_grandparent",
      compassionSatisfaction0to50: Number(compassionScore) || 38,
      burnout0to50: Number(burnoutScore) || 26,
      secondaryTraumaticStress0to50: Number(stsScore) || 24,
    });
    setCarerResult(res);
  };

  const handleRunSewbMap = async () => {
    const res = await submitCulturalSewbYarningMap({
      participantUserId: "parent-local",
      domainBody: "Regular bushwalking, sleep rest, and healthy meals",
      domainMindEmotions: "Steady breathing and yarning with peer mentor",
      domainFamilyKinship,
      domainCommunity: "Connected with local Aboriginal Family Gathering Place",
      domainCulture: "Storytelling and cultural pride with the kids",
      domainCountry,
      domainSpiritAncestors: "Honouring Elders and keeping family spirit strong",
      culturalWorkerCoSigned: true,
      culturalWorkerName: `${culturalWorkerName} [${culturalAttestationNote}]`,
    });
    setSewbResult(res);
  };

  const handleRunAdaptivePrescriptions = async () => {
    const res = await generateAdaptiveMicroPrescriptions({
      participantUserId: "parent-local",
      flaggedDomains: [
        {
          domainKey: "co_regulation_under_stress",
          triggerSource: "Live Stress Roleplay Simulator",
          currentScore0to100: 62,
        },
        {
          domainKey: "biff_co_parenting_boundaries",
          triggerSource: "Safe Partner Message Bridge",
          currentScore0to100: 58,
        },
        {
          domainKey: "addiction_craving_regulation",
          triggerSource: "HALT+S Evening Check-In",
          currentScore0to100: 64,
        },
      ],
    });
    setPrescriptionResult(res);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>
        Specialized Clinical Toolkits: Addiction, Neuro/Sleep, Kinship, Cultural SEWB &amp; Adaptive Rx
      </Text>

      {/* Module 5: 24/7 Addiction Urge-Surfing & MAT Shield */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          1. 24/7 Addiction 90-Second Urge-Surfing, HALT+S &amp; MAT Routine Shield
        </Text>

        {/* 90-Second TIPP Urge Surf Player */}
        <View style={styles.timerCard}>
          <View style={styles.timerHeader}>
            <Text style={styles.timerTitle}>🌊 Somatic Urge-Surfing &amp; TIPP Reset</Text>
            <Text style={styles.timerClock}>{formatTimer(tippTimerSeconds)}</Text>
          </View>
          <Text style={styles.timerHint}>
            T = Temperature (splash cold water/hold ice) | I = Intense burst (pushups/steps) | P = Paced breathing | P = Paired relaxation
          </Text>
          <View style={styles.timerBtnRow}>
            <Pressable
              style={[styles.timerBtn, tippTimerActive && styles.timerBtnActive]}
              onPress={() => setTippTimerActive((prev) => !prev)}
            >
              <Text style={styles.timerBtnText}>
                {tippTimerActive ? "Pause Urge-Surf" : "Start 90s Urge Surf"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.timerSecondaryBtn}
              onPress={() => {
                setTippTimerActive(false);
                setTippTimerSeconds(90);
              }}
            >
              <Text style={styles.timerSecondaryBtnText}>Reset (90s)</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Craving Before Wave (0–10)</Text>
            <TextInput
              style={styles.input}
              value={cravingBefore}
              onChangeText={setCravingBefore}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Craving After Wave (0–10)</Text>
            <TextInput
              style={styles.input}
              value={cravingAfter}
              onChangeText={setCravingAfter}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.label}>Upcoming High-Risk Calendar Trigger (Payday / Anniversary)</Text>
        <TextInput
          style={styles.input}
          value={highRiskEvent}
          onChangeText={setHighRiskEvent}
        />
        <Pressable
          style={styles.toggleRow}
          onPress={() => setMatChecked((prev) => !prev)}
        >
          <Text style={styles.toggleText}>
            {matChecked ? "☑" : "☐"} Prescribed MAT / Recovery Medication Taken &amp; Locked in Child-Safe Box
          </Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} onPress={handleRunAddictionShield}>
          <Text style={styles.primaryBtnText}>Complete 90-Second Urge-Surf &amp; Recovery Shield</Text>
        </Pressable>

        {addictionResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              Urge Wave Delta: {addictionResult.cravingDelta} pts | Tier: {addictionResult.riskTier}
            </Text>
            <Text style={styles.resultBody}>{addictionResult.ninetySecondWaveCoachScript}</Text>
            <Text style={styles.resultSafe}>{addictionResult.matRoutineReminder}</Text>
            <Text style={styles.resultWarning}>
              • {addictionResult.highRiskCalendarShieldNote}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Module 6: Child Trauma Sleep & Neurodivergent Low-Arousal Household Toolkit */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          2. Child Trauma Sleep/Nightmare Coach &amp; Neurodivergent Low-Arousal Toolkit
        </Text>
        <Text style={styles.helperText}>
          Select active household sensory accommodations for bedtime decompression:
        </Text>

        <View style={styles.presetGrid}>
          {SENSORY_PRESETS.map((preset) => {
            const active = selectedSensoryPresets.includes(preset.id);
            return (
              <Pressable
                key={preset.id}
                style={[styles.presetChip, active && styles.presetChipActive]}
                onPress={() => toggleSensoryPreset(preset.id)}
              >
                <Text style={[styles.presetChipText, active && styles.presetChipTextActive]}>
                  {active ? "☑ " : "☐ "}
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.primaryBtn} onPress={handleRunNeuroSleep}>
          <Text style={styles.primaryBtnText}>Build Low-Arousal Bedtime &amp; Sensory Plan</Text>
        </Pressable>

        {neuroResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Bedtime Co-Regulation Script</Text>
            <Text style={styles.resultSafe}>{neuroResult.bedtimeCoRegulationScript}</Text>
            <Text style={styles.resultBody}>{neuroResult.nightmareAwakeningProtocol}</Text>
            {neuroResult.chunkedVisualSchedule.map((step) => (
              <Text key={step.stepNumber} style={styles.resultBody}>
                Step {step.stepNumber} ({step.iconLabel}): {step.plainLanguageInstruction}
              </Text>
            ))}
            <Text style={styles.resultWarning}>{neuroResult.evaluatorAccommodationFlag}</Text>
          </View>
        ) : null}
      </View>

      {/* Module 7: Kinship, Foster & Grandparent Carer ProQOL & Contact Coach */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          3. Kinship, Foster &amp; Grandparent Carer Secondary Trauma (ProQOL) Coach
        </Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Compassion (0–50)</Text>
            <TextInput
              style={styles.input}
              value={compassionScore}
              onChangeText={setCompassionScore}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Burnout (0–50)</Text>
            <TextInput
              style={styles.input}
              value={burnoutScore}
              onChangeText={setBurnoutScore}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Secondary Trauma (0–50)</Text>
            <TextInput
              style={styles.input}
              value={stsScore}
              onChangeText={setStsScore}
              keyboardType="numeric"
            />
          </View>
        </View>
        <Pressable style={styles.primaryBtn} onPress={handleRunCarerProQol}>
          <Text style={styles.primaryBtnText}>Evaluate Carer Stability &amp; Boundary Script</Text>
        </Pressable>

        {carerResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              Placement Stability Band: {carerResult.placementStabilityBand}
            </Text>
            <Text style={styles.resultBody}>{carerResult.proQolInterpretation}</Text>
            <Text style={styles.resultSafe}>
              Birth-Parent Contact Boundary Script: {carerResult.birthParentBoundaryScript}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Module 8: First Nations Cultural SEWB 7-Domain Yarning Map */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          4. First Nations Cultural SEWB 7-Domain Yarning Map &amp; Cultural Worker Co-Sign
        </Text>
        <Text style={styles.label}>Connection to Family &amp; Kinship Network</Text>
        <TextInput
          style={styles.input}
          value={domainFamilyKinship}
          onChangeText={setDomainFamilyKinship}
        />
        <Text style={styles.label}>Connection to Country &amp; Land</Text>
        <TextInput style={styles.input} value={domainCountry} onChangeText={setDomainCountry} />
        <Text style={styles.label}>Co-Signing Cultural Worker / Elder Name</Text>
        <TextInput
          style={styles.input}
          value={culturalWorkerName}
          onChangeText={setCulturalWorkerName}
        />
        <Text style={styles.label}>Cultural Protocol Attestation &amp; Elder Endorsement</Text>
        <TextInput
          style={styles.input}
          value={culturalAttestationNote}
          onChangeText={setCulturalAttestationNote}
        />
        <Pressable style={styles.primaryBtn} onPress={handleRunSewbMap}>
          <Text style={styles.primaryBtnText}>Weave 7-Domain SEWB Yarning Map &amp; Co-Sign</Text>
        </Pressable>

        {sewbResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              SEWB Vitality Score: {sewbResult.sewbVitalityScore0to100}/100 | Co-Signed by:{" "}
              {sewbResult.culturalWorkerName}
            </Text>
            {sewbResult.antiBiasKinshipGuardrailNotes.map((note, idx) => (
              <Text key={idx} style={styles.resultSafe}>
                ✓ {note}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      {/* Module 11: Closed-Loop Adaptive Micro-Lesson & Spaced Re-Test Prescriber */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          5. Closed-Loop Adaptive 3-Minute Micro-Lessons &amp; 7/14/30-Day Re-Test Scheduler
        </Text>
        <Pressable style={styles.primaryBtn} onPress={handleRunAdaptivePrescriptions}>
          <Text style={styles.primaryBtnText}>Generate Closed-Loop Skill Prescriptions</Text>
        </Pressable>

        {prescriptionResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{prescriptionResult.spacedRepetitionSummary}</Text>
            {prescriptionResult.prescriptions.map((rx) => (
              <View key={rx.prescriptionId} style={{ marginTop: 6 }}>
                <Text style={styles.resultSafe}>
                  ★ {rx.microLessonTitle} (Triggered by: {rx.triggeredBySource})
                </Text>
                <Text style={styles.resultBody}>Drill: {rx.threeMinutePracticeDrill}</Text>
                <Text style={styles.helperText}>
                  Re-Tests: 7d ({rx.retest7dDueIso.slice(0, 10)}) | 14d (
                  {rx.retest14dDueIso.slice(0, 10)}) | 30d ({rx.retest30dDueIso.slice(0, 10)})
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.navRow}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/ai-support-coach")}
        >
          <Text style={styles.secondaryBtnText}>Back to AI Support Coach</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/ai-support-coach/safety-plan-vault")}
        >
          <Text style={styles.secondaryBtnText}>Stealth &amp; Escape Safety Vault</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { padding: 18, paddingBottom: 48, gap: 16 },
  pageTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  helperText: { color: "#94A3B8", fontSize: 12 },
  label: { color: "#CBD5E1", fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row", gap: 10 },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  timerCard: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerTitle: { color: "#38BDF8", fontSize: 13, fontWeight: "700" },
  timerClock: { color: "#F8FAFC", fontSize: 18, fontWeight: "800", fontFamily: "monospace" },
  timerHint: { color: "#94A3B8", fontSize: 11, lineHeight: 15 },
  timerBtnRow: { flexDirection: "row", gap: 8 },
  timerBtn: {
    flex: 1,
    backgroundColor: "#0284C7",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  timerBtnActive: { backgroundColor: "#0369A1" },
  timerBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  timerSecondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#334155",
    borderRadius: 6,
    alignItems: "center",
  },
  timerSecondaryBtnText: { color: "#F8FAFC", fontWeight: "600", fontSize: 12 },
  presetGrid: { gap: 6 },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#0F172A",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  presetChipActive: { backgroundColor: "#1E3A8A", borderColor: "#60A5FA" },
  presetChipText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  presetChipTextActive: { color: "#BFDBFE", fontWeight: "700" },
  toggleRow: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  toggleText: { color: "#E2E8F0", fontSize: 13 },
  primaryBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  resultBox: {
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0284C7",
    gap: 6,
  },
  resultTitle: { color: "#38BDF8", fontWeight: "700", fontSize: 14 },
  resultBody: { color: "#E2E8F0", fontSize: 13 },
  resultSafe: { color: "#6EE7B7", fontSize: 13 },
  resultWarning: { color: "#FCD34D", fontSize: 12 },
  navRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  secondaryBtn: {
    backgroundColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
});
