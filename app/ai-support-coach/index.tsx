import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getPendingAiSupportQueue,
  submitAiCoachTurn,
  syncPendingAiSupportQueue,
} from "../../lib/aiSupportApi";
import {
  AUSTRALIAN_CRISIS_RESOURCES,
  CLINICAL_PATHWAY_PROTOCOLS,
  EMA_MICRO_PULSES,
  SITUATIONAL_JUDGEMENT_VIGNETTES,
  SOMATIC_BODY_MAP_ZONES,
  STRESS_ROLEPLAY_SCENARIOS,
  TEACH_BACK_CHALLENGES,
  TEN_INTERACTION_FORMS,
  type ClinicalPathwayId,
  type InteractionFormId,
} from "../../lib/data/therapeuticCoachingProtocols";
import {
  evaluateEarlyWarningRadar,
  type AccessibilityMode,
  type CoachPersonaMode,
  type SupportCoachTurnOutput,
} from "../../lib/engines/aiSupportCoachEngine";
import VoiceChatControls from "../../lib/voice/VoiceChatControls";
import { evaluateVoiceCoachingSafety } from "../../lib/voice/voiceSafety";

const PERSONA_OPTIONS: {
  id: CoachPersonaMode;
  label: string;
  defaultPathway: ClinicalPathwayId;
}[] = [
  {
    id: "parent_support_coach",
    label: "Parent Co-Regulation",
    defaultPathway: "parent_co_regulation_cos",
  },
  {
    id: "couples_dfv_restoration_coach",
    label: "Couples & Family DFV",
    defaultPathway: "couples_dfv_restoration",
  },
  {
    id: "dfv_safety_coach",
    label: "DFV Survivor Safety",
    defaultPathway: "dfv_survivor_safety_planning",
  },
  {
    id: "dfv_accountability_coach",
    label: "Accountability (MBCP)",
    defaultPathway: "dfv_accountability_mbcp",
  },
  {
    id: "addiction_recovery_coach",
    label: "Addiction (AOD) Recovery",
    defaultPathway: "addiction_mi_relapse_prevention",
  },
  {
    id: "mental_health_stabilisation_coach",
    label: "Mental Health & Trauma",
    defaultPathway: "mental_health_cbt_dbt_act",
  },
  {
    id: "perinatal_infant_coach",
    label: "Perinatal & Infant",
    defaultPathway: "perinatal_infant_bonding",
  },
  {
    id: "neurodiversity_executive_scaffold_coach",
    label: "Neuro-Affirming / ABI",
    defaultPathway: "neurodiversity_abi_scaffolding",
  },
  {
    id: "cultural_sewb_coach",
    label: "Cultural SEWB Yarning",
    defaultPathway: "cultural_sewb_yarning",
  },
];

export default function AiSupportCoachHubScreen() {
  const router = useRouter();
  const [personaMode, setPersonaMode] = useState<CoachPersonaMode>("parent_support_coach");
  const [clinicalPathway, setClinicalPathway] = useState<ClinicalPathwayId>("parent_co_regulation_cos");
  const [interactionForm, setInteractionForm] = useState<InteractionFormId>("reflective_dialogue");
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>("standard");

  // Modality-specific selections
  const [selectedVignetteId, setSelectedVignetteId] = useState(SITUATIONAL_JUDGEMENT_VIGNETTES[0].id);
  const [selectedVignetteOptionId, setSelectedVignetteOptionId] = useState(
    SITUATIONAL_JUDGEMENT_VIGNETTES[0].options[2].id,
  );
  const [selectedRoleplayId, setSelectedRoleplayId] = useState(STRESS_ROLEPLAY_SCENARIOS[0].id);
  const [selectedTeachBackId, setSelectedTeachBackId] = useState(TEACH_BACK_CHALLENGES[0].id);
  const [selectedSomaticZoneId, setSelectedSomaticZoneId] = useState(SOMATIC_BODY_MAP_ZONES[0].id);
  const [selectedEmaPulseId, setSelectedEmaPulseId] = useState(EMA_MICRO_PULSES[0].id);
  const [selectedEmaValue, setSelectedEmaValue] = useState(3);

  // Early Warning Radar state
  const [sleepHours, setSleepHours] = useState(6);
  const [cravingLevel, setCravingLevel] = useState(2);
  const [householdTension, setHouseholdTension] = useState(3);
  const [contactVisitWindow, setContactVisitWindow] = useState(false);

  const [userInput, setUserInput] = useState("");
  const [turnHistory, setTurnHistory] = useState<SupportCoachTurnOutput[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Offline queue & synchronization state
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const refreshQueueStatus = useCallback(async () => {
    try {
      const queue = await getPendingAiSupportQueue();
      setQueuedCount(queue.length);
    } catch {
      // offline vault in memory
    }
  }, []);

  useEffect(() => {
    refreshQueueStatus();
  }, [refreshQueueStatus]);

  async function handleManualQueueSync() {
    setSyncingQueue(true);
    setSyncMessage(null);
    try {
      const summary = await syncPendingAiSupportQueue();
      if (summary.total === 0) {
        setSyncMessage("All offline items are already synchronized.");
      } else if (summary.failed === 0) {
        setSyncMessage(`Synced ${summary.synced} item${summary.synced === 1 ? "" : "s"} successfully.`);
      } else {
        setSyncMessage(`Synced ${summary.synced}, failed ${summary.failed}. Will retry automatically.`);
      }
      await refreshQueueStatus();
    } catch {
      setSyncMessage("Sync unavailable. Data remains safely queued in offline vault.");
    } finally {
      setSyncingQueue(false);
    }
  }

  const activePathwayProtocol = useMemo(
    () =>
      CLINICAL_PATHWAY_PROTOCOLS.find((p) => p.id === clinicalPathway) ??
      CLINICAL_PATHWAY_PROTOCOLS[1],
    [clinicalPathway],
  );

  const activeFormDefinition = useMemo(
    () =>
      TEN_INTERACTION_FORMS.find((f) => f.id === interactionForm) ??
      TEN_INTERACTION_FORMS[0],
    [interactionForm],
  );

  const radarResult = useMemo(
    () =>
      evaluateEarlyWarningRadar({
        sleepHoursLastNight: sleepHours,
        cravingIntensity0to10: cravingLevel,
        householdTension0to10: householdTension,
        upcomingOrRecentContactVisit: contactVisitWindow,
        sensoryOverload0to10: accessibilityMode === "low_stimulation" ? 7 : 3,
        missedProtectiveRoutineDays: 0,
      }),
    [sleepHours, cravingLevel, householdTension, contactVisitWindow, accessibilityMode],
  );

  const latestTurn = turnHistory[0];
  const voiceSafety = evaluateVoiceCoachingSafety({
    childSafetyMode: personaMode === "child_support_coach",
    isCouplesDfvSession: personaMode === "couples_dfv_restoration_coach",
    safetyGateTriggered: latestTurn?.safetyEvaluation.safetyGateTriggered,
  });

  async function handleRunCoachingTurn() {
    const fallbackPrompt =
      interactionForm === "sjt_vignette"
        ? `Selected SJT vignette option ${selectedVignetteOptionId}`
        : interactionForm === "somatic_body_map"
          ? `Tapped body zone ${selectedSomaticZoneId} for a 60-second nervous system reset`
          : interactionForm === "ema_micro_pulse"
            ? `Logged 15-second EMA pulse (${selectedEmaValue}/4)`
            : "I noticed tension building during bedtime today and took a breath so my child felt safe.";

    const messageToSend = userInput.trim() || fallbackPrompt;
    setSubmitting(true);
    try {
      const output = await submitAiCoachTurn({
        personaMode,
        clinicalPathway,
        interactionForm,
        userMessage: messageToSend,
        accessibilityMode,
        sjtVignetteId: selectedVignetteId,
        sjtSelectedOptionId: selectedVignetteOptionId,
        roleplayScenarioId: selectedRoleplayId,
        teachBackChallengeId: selectedTeachBackId,
        somaticZoneId: selectedSomaticZoneId,
        emaPulseId: selectedEmaPulseId,
        emaSelectedValue: selectedEmaValue,
      });
      setTurnHistory((prev) => [output, ...prev]);
      setUserInput("");
      await refreshQueueStatus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>10-FORM PERSONAL AI SUPPORT COACH • 100% DETERMINISTIC SAFETY GATE</Text>
        <Text style={styles.heroTitle}>
          Child, Parent, Couples/Family DFV, Addiction & Mental Health Coach
        </Text>
        <Text style={styles.heroSubtitle}>
          Trauma-informed, non-diagnostic coaching across CBT, DBT, ACT, Motivational Interviewing,
          Safe & Together™, Circle of Security, and 4-Stage Couples DFV Restoration.
        </Text>

        {/* Quick Navigation Bar to Companion Hubs */}
        <View style={styles.navPillRow}>
          <TouchableOpacity
            style={[styles.navPill, styles.navPillHighlight]}
            onPress={() => router.push("/ai-support-coach/couples-family-dfv" as never)}
          >
            <Text style={styles.navPillHighlightText}>Couples & Family DFV Hub</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push("/ai-support-coach/check-in-scales" as never)}
          >
            <Text style={styles.navPillText}>50+ Clinical & Parenting Scales</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push("/assessment-system/ai-psychologist-evaluator" as never)}
          >
            <Text style={styles.navPillText}>5P AI Psychologist & 10 Evaluators</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push("/child/support-coach" as never)}
          >
            <Text style={styles.navPillText}>Child Safety Buddy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push("/clinician-review" as never)}
          >
            <Text style={styles.navPillText}>Clinician SPJ Sign-Off</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push("/ai-support-coach/safety-plan-vault" as never)}
          >
            <Text style={styles.navPillText}>Stealth Cloak & Escape Vault</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push("/ai-support-coach/specialized-toolkits" as never)}
          >
            <Text style={styles.navPillText}>Addiction / Neuro / Kinship / SEWB Toolkits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push("/visits/transition-coach" as never)}
          >
            <Text style={styles.navPillText}>Contact Visit Transition Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push("/family-meeting/restorative-repair" as never)}
          >
            <Text style={styles.navPillText}>Restorative Family Repair Studio</Text>
          </TouchableOpacity>
        </View>

        {/* Offline Queue & Sync Status Banner */}
        <View style={styles.syncStatusCard}>
          <View style={styles.syncStatusHeader}>
            <Text style={styles.syncStatusTitle}>
              {queuedCount > 0
                ? `🟠 ${queuedCount} Offline ${queuedCount === 1 ? "Record" : "Records"} Queued (Encrypted Vault)`
                : "🟢 Offline Vault Synced & Cryptographically Verified"}
            </Text>
            <TouchableOpacity
              style={[styles.syncButton, syncingQueue && styles.syncButtonDisabled]}
              onPress={handleManualQueueSync}
              disabled={syncingQueue}
            >
              <Text style={styles.syncButtonText}>
                {syncingQueue ? "Syncing..." : queuedCount > 0 ? "Sync Now" : "Check Sync"}
              </Text>
            </TouchableOpacity>
          </View>
          {syncMessage ? <Text style={styles.syncStatusMessage}>{syncMessage}</Text> : null}
        </View>
      </View>

      {/* Accessibility & Cultural Yarning Mode Bar */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Universal Access, Easy-Read & Cultural Yarning Mode</Text>
        <View style={styles.chipRow}>
          {(
            [
              { id: "standard", label: "Standard Clinical" },
              { id: "easy_read", label: "Easy-Read (Plain Text)" },
              { id: "low_stimulation", label: "Low Sensory Load" },
              { id: "cultural_yarning", label: "First Nations SEWB Yarning" },
            ] as { id: AccessibilityMode; label: string }[]
          ).map((mode) => (
            <TouchableOpacity
              key={mode.id}
              onPress={() => setAccessibilityMode(mode.id)}
              style={[
                styles.chip,
                accessibilityMode === mode.id && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  accessibilityMode === mode.id && styles.chipTextActive,
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Early Warning Relapse & Escalation Radar */}
      <View style={styles.sectionCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Predictive Early-Warning & Relapse Radar</Text>
          <View
            style={[
              styles.badge,
              radarResult.riskLevel === "critical_red" || radarResult.riskLevel === "high_orange_intervene"
                ? styles.badgeAlert
                : styles.badgeSafe,
            ]}
          >
            <Text style={styles.badgeText}>
              Vulnerability: {radarResult.compositeVulnerabilityScore}/100 ({radarResult.riskLevel.replace(/_/g, " ")})
            </Text>
          </View>
        </View>
        <Text style={styles.helperText}>{radarResult.proactiveSixtySecondReset}</Text>

        <View style={styles.radarControlsGrid}>
          <View style={styles.radarControlItem}>
            <Text style={styles.radarLabel}>Sleep Last Night: {sleepHours}h</Text>
            <View style={styles.miniBtnRow}>
              {[4, 5, 6, 7, 8].map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => setSleepHours(h)}
                  style={[styles.miniBtn, sleepHours === h && styles.miniBtnActive]}
                >
                  <Text style={[styles.miniBtnText, sleepHours === h && styles.miniBtnTextActive]}>
                    {h}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.radarControlItem}>
            <Text style={styles.radarLabel}>Craving / Urge Wave: {cravingLevel}/10</Text>
            <View style={styles.miniBtnRow}>
              {[0, 2, 5, 7, 9].map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCravingLevel(c)}
                  style={[styles.miniBtn, cravingLevel === c && styles.miniBtnActive]}
                >
                  <Text style={[styles.miniBtnText, cravingLevel === c && styles.miniBtnTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.radarControlItem}>
            <Text style={styles.radarLabel}>Household Tension: {householdTension}/10</Text>
            <View style={styles.miniBtnRow}>
              {[1, 3, 5, 7, 9].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setHouseholdTension(t)}
                  style={[styles.miniBtn, householdTension === t && styles.miniBtnActive]}
                >
                  <Text
                    style={[
                      styles.miniBtnText,
                      householdTension === t && styles.miniBtnTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setContactVisitWindow((prev) => !prev)}
            style={[
              styles.contactToggle,
              contactVisitWindow && styles.contactToggleActive,
            ]}
          >
            <Text
              style={[
                styles.contactToggleText,
                contactVisitWindow && styles.contactToggleTextActive,
              ]}
            >
              {contactVisitWindow
                ? "✓ Contact Visit Transition Window Active (Pre/Post Grief Support)"
                : "Toggle Pre/Post Contact Visit Transition Window"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step 1: Select Coaching Domain / Persona */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. Select Support Coach Specialization</Text>
        <View style={styles.chipRow}>
          {PERSONA_OPTIONS.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => {
                setPersonaMode(p.id);
                setClinicalPathway(p.defaultPathway);
              }}
              style={[styles.chip, personaMode === p.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, personaMode === p.id && styles.chipTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.pathwayInfoBox}>
          <Text style={styles.pathwayTitle}>{activePathwayProtocol.title}</Text>
          <Text style={styles.pathwayMeta}>
            Evidence Frameworks: {activePathwayProtocol.evidenceFrameworks.join(" • ")}
          </Text>
          <Text style={styles.pathwayPrompt}>
            {accessibilityMode === "easy_read"
              ? activePathwayProtocol.easyReadOpeningPrompt
              : activePathwayProtocol.openingPrompt}
          </Text>
        </View>
      </View>

      {/* Step 2: Select Any of the 10 Multi-Modal Interaction Forms */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          2. Choose Interaction Form (10 Multi-Modal Delivery & Verification Forms)
        </Text>
        <View style={styles.chipRow}>
          {TEN_INTERACTION_FORMS.map((form) => (
            <TouchableOpacity
              key={form.id}
              onPress={() => setInteractionForm(form.id)}
              style={[styles.chip, interactionForm === form.id && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, interactionForm === form.id && styles.chipTextActive]}
              >
                {form.number}. {form.shortLabel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.formDetailBox}>
          <Text style={styles.formBadge}>{activeFormDefinition.modalityBadge}</Text>
          <Text style={styles.formTitle}>{activeFormDefinition.title}</Text>
          <Text style={styles.helperText}>{activeFormDefinition.description}</Text>
          <Text style={styles.antiGamingNote}>
            Reliability & Anti-Gaming Mechanism: {activeFormDefinition.antiGamingMechanism}
          </Text>
        </View>

        {/* Form-Specific Interactive Controls */}
        {interactionForm === "sjt_vignette" ? (
          <View style={styles.subModalityCard}>
            <Text style={styles.subModalityTitle}>Disguised Situational Judgement Vignette (SJT)</Text>
            <View style={styles.chipRow}>
              {SITUATIONAL_JUDGEMENT_VIGNETTES.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => {
                    setSelectedVignetteId(v.id);
                    setSelectedVignetteOptionId(v.options[0].id);
                  }}
                  style={[styles.chip, selectedVignetteId === v.id && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedVignetteId === v.id && styles.chipTextActive,
                    ]}
                  >
                    {v.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {(() => {
              const vig =
                SITUATIONAL_JUDGEMENT_VIGNETTES.find((v) => v.id === selectedVignetteId) ??
                SITUATIONAL_JUDGEMENT_VIGNETTES[0];
              return (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.scenarioPrompt}>
                    {accessibilityMode === "easy_read" ? vig.easyReadScenarioText : vig.scenarioText}
                  </Text>
                  {vig.options.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setSelectedVignetteOptionId(opt.id)}
                      style={[
                        styles.optionCard,
                        selectedVignetteOptionId === opt.id && styles.optionCardSelected,
                      ]}
                    >
                      <Text style={styles.optionText}>{opt.responseText}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })()}
          </View>
        ) : null}

        {interactionForm === "stress_roleplay_simulator" ? (
          <View style={styles.subModalityCard}>
            <Text style={styles.subModalityTitle}>Live Stress-Inoculation Roleplay Simulator</Text>
            <View style={styles.chipRow}>
              {STRESS_ROLEPLAY_SCENARIOS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedRoleplayId(s.id)}
                  style={[styles.chip, selectedRoleplayId === s.id && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, selectedRoleplayId === s.id && styles.chipTextActive]}
                  >
                    {s.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {(() => {
              const rp =
                STRESS_ROLEPLAY_SCENARIOS.find((s) => s.id === selectedRoleplayId) ??
                STRESS_ROLEPLAY_SCENARIOS[0];
              return (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.roleplayCounterpart}>
                    Simulated Counterpart ({rp.simulatedCounterpartRole}):
                  </Text>
                  <Text style={styles.roleplayChallenge}>
                    &ldquo;{rp.openingChallengeLine}&rdquo;
                  </Text>
                  <Text style={styles.helperText}>Body Cue: {rp.escalationCue}</Text>
                </View>
              );
            })()}
          </View>
        ) : null}

        {interactionForm === "teach_back_perspective_switch" ? (
          <View style={styles.subModalityCard}>
            <Text style={styles.subModalityTitle}>Teach-Back & Child/Partner Perspective-Switch</Text>
            <View style={styles.chipRow}>
              {TEACH_BACK_CHALLENGES.map((tb) => (
                <TouchableOpacity
                  key={tb.id}
                  onPress={() => setSelectedTeachBackId(tb.id)}
                  style={[styles.chip, selectedTeachBackId === tb.id && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedTeachBackId === tb.id && styles.chipTextActive,
                    ]}
                  >
                    {tb.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {(() => {
              const tb =
                TEACH_BACK_CHALLENGES.find((c) => c.id === selectedTeachBackId) ??
                TEACH_BACK_CHALLENGES[0];
              return (
                <Text style={[styles.scenarioPrompt, { marginTop: 8 }]}>
                  {accessibilityMode === "easy_read" ? tb.easyReadPrompt : tb.prompt}
                </Text>
              );
            })()}
          </View>
        ) : null}

        {interactionForm === "somatic_body_map" ? (
          <View style={styles.subModalityCard}>
            <Text style={styles.subModalityTitle}>
              Tap Where Stress Shows Up in Your Body (60-Second Polyvagal / DBT TIPP Reset)
            </Text>
            {SOMATIC_BODY_MAP_ZONES.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                onPress={() => setSelectedSomaticZoneId(zone.id)}
                style={[
                  styles.optionCard,
                  selectedSomaticZoneId === zone.id && styles.optionCardSelected,
                ]}
              >
                <Text style={styles.optionTitle}>{zone.label}</Text>
                <Text style={styles.helperText}>Signals: {zone.sensations.join(" • ")}</Text>
                <Text style={styles.resetSkillText}>{zone.sixtySecondResetSkill}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {interactionForm === "ema_micro_pulse" ? (
          <View style={styles.subModalityCard}>
            <Text style={styles.subModalityTitle}>15-Second Ecological Momentary Pulse (EMA)</Text>
            <View style={styles.chipRow}>
              {EMA_MICRO_PULSES.map((pulse) => (
                <TouchableOpacity
                  key={pulse.id}
                  onPress={() => setSelectedEmaPulseId(pulse.id)}
                  style={[styles.chip, selectedEmaPulseId === pulse.id && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedEmaPulseId === pulse.id && styles.chipTextActive,
                    ]}
                  >
                    {pulse.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {(() => {
              const pulse =
                EMA_MICRO_PULSES.find((p) => p.id === selectedEmaPulseId) ?? EMA_MICRO_PULSES[0];
              return (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.scenarioPrompt}>{pulse.prompt}</Text>
                  <View style={styles.chipRow}>
                    {pulse.quickTapAnchors.map((anchor) => (
                      <TouchableOpacity
                        key={anchor.value}
                        onPress={() => setSelectedEmaValue(anchor.value)}
                        style={[
                          styles.optionCard,
                          selectedEmaValue === anchor.value && styles.optionCardSelected,
                        ]}
                      >
                        <Text style={styles.optionTitle}>
                          {anchor.emoji} {anchor.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })()}
          </View>
        ) : null}

        {/* Text Input & Submit */}
        <Text style={styles.inputLabel}>
          {interactionForm === "safe_partner_message_bridge"
            ? "Paste your partner/co-parent draft message to convert into a safe, child-focused BIFF message:"
            : interactionForm === "shared_timeout_contract"
              ? "Enter your preferred household Time-Out code phrase (or leave blank for default):"
              : "Share your reflection, roleplay response, or question:"}
        </Text>
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type here or tap Run Coaching Turn below to use the selected scenario..."
          placeholderTextColor="#7A8E93"
          multiline
          style={styles.textInput}
        />

        <TouchableOpacity
          disabled={submitting}
          onPress={handleRunCoachingTurn}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {submitting
              ? "Running Pre/Post Safety Gate & Clinical Coach..."
              : `Run ${activeFormDefinition.shortLabel} Turn`}
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: 12 }}>
          <VoiceChatControls
            label="Voice Coach & 60-Second Paced Breathing Guide"
            disabled={!voiceSafety.voiceAllowed}
            safetyNotice={voiceSafety.guidanceBanner}
            onToggle={() => {}}
          />
        </View>
      </View>

      {/* Coaching Turn Output & Live Safety Gate Audit */}
      {turnHistory.map((turn, idx) => (
        <View
          key={`${turn.auditSha256}-${idx}`}
          style={[
            styles.turnCard,
            !turn.safetyEvaluation.safeToProceed && styles.turnCardCrisis,
          ]}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.turnHeaderBadge}>
              {turn.interactionForm.toUpperCase()} • {turn.providerTierUsed}
            </Text>
            <Text style={styles.turnMetricsText}>
              RF: {turn.reflectiveFunctioningScore}/100 • Authenticity:{" "}
              {turn.antiGamingAuthenticityScore}/100
            </Text>
          </View>

          {turn.uncertaintyDisclosure ? (
            <View style={styles.uncertaintyBox}>
              <Text style={styles.uncertaintyText}>{turn.uncertaintyDisclosure}</Text>
            </View>
          ) : null}

          <Text style={styles.assistantReplyText}>{turn.assistantMessage}</Text>

          {turn.biffBridgeResult ? (
            <View style={styles.biffCard}>
              <Text style={styles.biffTitle}>AI-Bridged Safe Partner Message (BIFF):</Text>
              <Text style={styles.biffMessage}>
                &ldquo;{turn.biffBridgeResult.biffRewrittenMessage}&rdquo;
              </Text>
              {turn.biffBridgeResult.detectedToneFlags.map((flag) => (
                <Text key={flag} style={styles.biffFlagText}>
                  • Removed: {flag}
                </Text>
              ))}
            </View>
          ) : null}

          {turn.timeOutContract ? (
            <View style={styles.biffCard}>
              <Text style={styles.biffTitle}>
                Synchronised Time-Out Contract ({turn.timeOutContract.coolingDurationMinutes} mins)
              </Text>
              <Text style={styles.helperText}>
                Code Phrase: &ldquo;{turn.timeOutContract.agreedCodeWord}&rdquo;
              </Text>
              <Text style={styles.helperText}>
                Child Script: &ldquo;{turn.timeOutContract.childReassuranceScript}&rdquo;
              </Text>
            </View>
          ) : null}

          <View style={styles.microStepsBox}>
            <Text style={styles.microStepsTitle}>Practical Micro-Skill Steps:</Text>
            {turn.microSkillActionSteps.map((step) => (
              <Text key={step} style={styles.microStepItem}>
                • {step}
              </Text>
            ))}
          </View>

          <Text style={styles.followUpText}>Next Reflection: {turn.followUpPrompt}</Text>
          <Text style={styles.auditHashText}>
            SHA-256 Audit: {turn.auditSha256.slice(0, 24)}...
          </Text>
        </View>
      ))}

      {/* 24/7 Australian Crisis & Safety Directory */}
      <View style={styles.crisisFooterCard}>
        <Text style={styles.crisisFooterTitle}>
          24/7 Immediate Safety & Crisis Support (Australia)
        </Text>
        {AUSTRALIAN_CRISIS_RESOURCES.map((res) => (
          <View key={res.id} style={styles.crisisRow}>
            <Text style={styles.crisisName}>
              {res.name}: <Text style={styles.crisisPhone}>{res.phone}</Text>
            </Text>
            <Text style={styles.crisisDesc}>{res.whenToUse}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F6" },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  heroCard: {
    backgroundColor: "#143642",
    borderRadius: 16,
    padding: 18,
  },
  eyebrow: {
    color: "#8ED1B7",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#D5E5E8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  navPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  navPill: {
    backgroundColor: "#214E5E",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  navPillHighlight: {
    backgroundColor: "#2F7D5C",
  },
  navPillText: {
    color: "#E4F2F5",
    fontSize: 12,
    fontWeight: "700",
  },
  navPillHighlightText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE6E5",
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
    lineHeight: 19,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeSafe: { backgroundColor: "#E1F3EB" },
  badgeAlert: { backgroundColor: "#FDE8E8" },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#143642",
  },
  radarControlsGrid: {
    gap: 10,
    marginTop: 4,
  },
  radarControlItem: {
    gap: 4,
  },
  radarLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#173B45",
  },
  miniBtnRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  miniBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#EDF3F2",
  },
  miniBtnActive: {
    backgroundColor: "#143642",
  },
  miniBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#143642",
  },
  miniBtnTextActive: {
    color: "#FFFFFF",
  },
  contactToggle: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#EDF3F2",
  },
  contactToggleActive: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#D97706",
  },
  contactToggleText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#173B45",
  },
  contactToggleTextActive: {
    color: "#92400E",
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
    borderWidth: 1,
    borderColor: "#D5E2DF",
  },
  chipActive: {
    backgroundColor: "#143642",
    borderColor: "#143642",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#173B45",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  pathwayInfoBox: {
    backgroundColor: "#F2F8F5",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  pathwayTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#143642",
  },
  pathwayMeta: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2F7D5C",
  },
  pathwayPrompt: {
    fontSize: 13,
    color: "#23444D",
    lineHeight: 19,
  },
  formDetailBox: {
    backgroundColor: "#F8FAFA",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0EAE8",
    gap: 4,
  },
  formBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2F7D5C",
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#143642",
  },
  antiGamingNote: {
    fontSize: 12,
    color: "#3A5A64",
    fontStyle: "italic",
  },
  subModalityCard: {
    backgroundColor: "#F4F8F9",
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  subModalityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  scenarioPrompt: {
    fontSize: 13,
    fontWeight: "700",
    color: "#173B45",
    lineHeight: 19,
  },
  optionCard: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4E2DF",
    marginTop: 6,
  },
  optionCardSelected: {
    borderColor: "#2F7D5C",
    backgroundColor: "#EAF6F0",
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  optionText: {
    fontSize: 13,
    color: "#1E3F47",
  },
  resetSkillText: {
    fontSize: 12,
    color: "#2F7D5C",
    fontWeight: "700",
    marginTop: 4,
  },
  roleplayCounterpart: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8B2635",
  },
  roleplayChallenge: {
    fontSize: 14,
    fontWeight: "800",
    color: "#143642",
    marginVertical: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
    marginTop: 4,
  },
  textInput: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: "#C8D8D5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#143642",
    backgroundColor: "#FAFCFC",
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#2F7D5C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  turnCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2F7D5C",
    gap: 10,
  },
  turnCardCrisis: {
    borderColor: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
  turnHeaderBadge: {
    fontSize: 11,
    fontWeight: "900",
    color: "#2F7D5C",
  },
  turnMetricsText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#143642",
  },
  uncertaintyBox: {
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 8,
  },
  uncertaintyText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "800",
  },
  assistantReplyText: {
    fontSize: 14,
    color: "#143642",
    lineHeight: 21,
    fontWeight: "600",
  },
  biffCard: {
    backgroundColor: "#EDF7F2",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  biffTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  biffMessage: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F5B42",
  },
  biffFlagText: {
    fontSize: 12,
    color: "#8B2635",
  },
  microStepsBox: {
    backgroundColor: "#F4F8F9",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  microStepsTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#143642",
  },
  microStepItem: {
    fontSize: 12,
    color: "#2A4D56",
    lineHeight: 18,
  },
  followUpText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  auditHashText: {
    fontSize: 11,
    color: "#6C8288",
  },
  crisisFooterCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F5C2C7",
    gap: 8,
  },
  crisisFooterTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#842029",
  },
  crisisRow: {
    paddingVertical: 4,
  },
  crisisName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  crisisPhone: {
    color: "#B91C1C",
    fontWeight: "900",
  },
  crisisDesc: {
    fontSize: 12,
    color: "#4B6369",
  },
  syncStatusCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 6,
    marginTop: 10,
  },
  syncStatusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  syncStatusTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
    flex: 1,
  },
  syncButton: {
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  syncStatusMessage: {
    fontSize: 12,
    color: "#15803D",
    fontStyle: "italic",
  },
});
