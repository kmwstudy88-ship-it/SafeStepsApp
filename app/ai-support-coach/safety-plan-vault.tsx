import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  hashSafetyPin,
  runTechAbuseSafetyAudit,
  saveEncryptedDfvSafetyPlan,
  triggerInstantStealthCloak,
  verifyStealthOrDuressPin,
} from "../../lib/aiSupportApi";
import type {
  BenignCloakScreenPayload,
  LivingDfvSafetyPlanVaultRecord,
  PinVerificationResult,
  TechAbuseAuditResult,
  TechAbuseRiskCategory,
} from "../../lib/security/stealthSafetyAndEscapeVaultEngine";

const TECH_AUDIT_ITEMS: { category: TechAbuseRiskCategory; label: string }[] = [
  {
    category: "shared_cloud_or_apple_google_id",
    label: "Shared iCloud, Google Photos, or synced browser history",
  },
  {
    category: "location_airtag_or_find_my_tracking",
    label: "Find My Friends, Life360, AirTag, or vehicle GPS tracking",
  },
  {
    category: "spyware_unknown_configuration_profiles",
    label: "Suspected stalkerware, unknown MDM profile, or phone monitoring",
  },
  {
    category: "smart_home_lock_camera_coercion",
    label: "Smart-home locks, doorbell cameras, or indoor cameras controlled by partner",
  },
  {
    category: "banking_payment_reference_harassment",
    label: "1-cent bank transfers with abusive messages in payment description",
  },
  {
    category: "children_device_or_game_chat_monitoring",
    label: "Children's tablet/smartwatch location or chat monitored during contact",
  },
];

export default function SafetyPlanAndStealthVaultScreen() {
  const router = useRouter();

  // Instant Quick-Exit Cloak (<100ms)
  const [cloakActive, setCloakActive] = useState<BenignCloakScreenPayload | null>(null);

  // Primary & Duress PIN state
  const [primaryPin] = useState("2468");
  const [duressPin] = useState("9999");
  const [enteredPin, setEnteredPin] = useState("2468");
  const [pinResult, setPinResult] = useState<PinVerificationResult | null>(null);

  // Tech-Abuse Audit state
  const [endorsedCategories, setEndorsedCategories] = useState<TechAbuseRiskCategory[]>([
    "shared_cloud_or_apple_google_id",
  ]);
  const [techAuditResult, setTechAuditResult] = useState<TechAbuseAuditResult | null>(null);

  // Living Safety Plan Vault state
  const [safePlacesText, setSafePlacesText] = useState(
    "Sister's house in Box Hill; 24/7 local Police Station",
  );
  const [trustedAdultsText, setTrustedAdultsText] = useState(
    "Aunty Sarah; School Wellbeing Coordinator; Neighbour Mrs. Chen",
  );
  const [codeWord, setCodeWord] = useState("Can we pick up the blue library folder?");
  const [childPetPlan, setChildPetPlan] = useState(
    "School notified of authorized pickup list; vet boarding arranged with cousin.",
  );
  const [vaultRecord, setVaultRecord] = useState<LivingDfvSafetyPlanVaultRecord | null>(null);

  if (cloakActive) {
    return (
      <ScrollView style={styles.cloakContainer} contentContainerStyle={styles.content}>
        <View style={styles.cloakCard}>
          <Text style={styles.cloakTitle}>{cloakActive.headerTitle}</Text>
          <Text style={styles.cloakSubtitle}>{cloakActive.subtitle}</Text>
          {cloakActive.benignItems.map((item, idx) => (
            <View key={idx} style={styles.cloakRow}>
              <Text style={styles.cloakCheck}>☐</Text>
              <Text style={styles.cloakItemText}>{item}</Text>
            </View>
          ))}
          <Pressable
            style={styles.uncloakSubtleButton}
            onPress={() => setCloakActive(null)}
          >
            <Text style={styles.uncloakSubtleText}>Refresh Pantry List</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const handleCheckPin = async () => {
    const res = await verifyStealthOrDuressPin({
      enteredPin,
      primaryPinHash: hashSafetyPin(primaryPin),
      duressPinHash: hashSafetyPin(duressPin),
    });
    setPinResult(res);
  };

  const toggleCategory = (cat: TechAbuseRiskCategory) => {
    setEndorsedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleRunTechAudit = async () => {
    const items = TECH_AUDIT_ITEMS.map((item) => ({
      category: item.category,
      endorsed: endorsedCategories.includes(item.category),
    }));
    const res = await runTechAbuseSafetyAudit(items);
    setTechAuditResult(res);
  };

  const handleSaveSafetyPlan = async () => {
    const record = await saveEncryptedDfvSafetyPlan({
      ownerUserId: "survivor-local",
      safePlacesToGo: safePlacesText
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      trustedAdultsAndNeighbours: trustedAdultsText
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      codeWordWithChildrenOrFriends: codeWord,
      essentialDocumentsChecklist: [
        { item: "Birth Certificates & Passports", packedOrPhotographedInVault: true },
        { item: "Medicare & Centrelink CRN Card", packedOrPhotographedInVault: true },
        { item: "DVO / AVO / Family Court Orders", packedOrPhotographedInVault: true },
        { item: "Children's Medical & School Records", packedOrPhotographedInVault: false },
      ],
      childAndPetSafetyArrangements: childPetPlan,
      financialIndependenceSteps: [
        "Confidential bank account opened with DFV Specialist Banking Team",
      ],
      dvoAvoConditions: [
        {
          conditionSummary: "No contact except via child-focused court-ordered app",
          breachReportingNote: "Log timestamp and screenshot immediately in Evidence Vault",
        },
      ],
    });
    setVaultRecord(record);
  };

  const isDuressDecoy = pinResult?.mode === "duress_sanitized_decoy";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Instant Quick-Exit Cloak Banner */}
      <View style={styles.quickExitBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.quickExitTitle}>Stealth & Survivor Safety Protection Active</Text>
          <Text style={styles.quickExitSub}>
            Tap Quick-Exit at any time to swap in &lt;100ms to a harmless grocery checklist.
          </Text>
        </View>
        <Pressable
          style={styles.quickExitButton}
          onPress={() =>
            setCloakActive(triggerInstantStealthCloak("household_shopping_checklist"))
          }
        >
          <Text style={styles.quickExitButtonText}>QUICK EXIT CLOAK</Text>
        </Pressable>
      </View>

      {/* Module 1A: Primary vs. Duress Decoy PIN Verification */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          1. Duress / Decoy PIN & Silent Caseworker Alert Gate
        </Text>
        <Text style={styles.helperText}>
          Demo Primary PIN: {primaryPin} | Demo Duress Decoy PIN: {duressPin} (hides DFV vault &amp; silently alerts caseworker)
        </Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={enteredPin}
            onChangeText={setEnteredPin}
            placeholder="Enter PIN (try 2468 or 9999)"
            keyboardType="numeric"
          />
          <Pressable style={styles.primaryBtn} onPress={handleCheckPin}>
            <Text style={styles.primaryBtnText}>Verify PIN Mode</Text>
          </Pressable>
        </View>

        {pinResult ? (
          <View
            style={[
              styles.resultBox,
              isDuressDecoy ? styles.duressResultBox : styles.safeResultBox,
            ]}
          >
            <Text style={styles.resultTitle}>
              Active View: {pinResult.displayViewTitle} ({pinResult.mode})
            </Text>
            <Text style={styles.resultBody}>
              DFV Vault Hidden: {pinResult.hideDfvCheckInsAndSafetyVault ? "YES (Decoy Active)" : "NO"} | Silent Caseworker Alert Dispatched:{" "}
              {pinResult.silentCaseworkerAlertDispatched ? "YES (" + pinResult.silentAlertAuditId + ")" : "No"}
            </Text>
          </View>
        ) : null}
      </View>

      {isDuressDecoy ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>General Parenting & School Lunch Routines</Text>
          <Text style={styles.helperText}>
            All standard household checklists are up to date for this week.
          </Text>
        </View>
      ) : (
        <>
          {/* Module 1B: Tech-Facilitated Abuse & Stalkerware Safety Audit */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              2. Technology-Facilitated Abuse & Stalkerware Safety Audit
            </Text>
            <Text style={styles.helperText}>
              Select any digital surveillance or coercive tech concerns to receive non-escalating remediation steps:
            </Text>
            {TECH_AUDIT_ITEMS.map((item) => {
              const selected = endorsedCategories.includes(item.category);
              return (
                <Pressable
                  key={item.category}
                  style={[styles.checkRow, selected && styles.checkRowSelected]}
                  onPress={() => toggleCategory(item.category)}
                >
                  <Text style={styles.checkIcon}>{selected ? "☑" : "☐"}</Text>
                  <Text style={styles.checkLabel}>{item.label}</Text>
                </Pressable>
              );
            })}
            <Pressable style={styles.primaryBtn} onPress={handleRunTechAudit}>
              <Text style={styles.primaryBtnText}>Run Non-Escalating Tech Safety Audit</Text>
            </Pressable>

            {techAuditResult ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>
                  Tech Risk Band: {techAuditResult.overallTechRiskBand.toUpperCase()} (
                  {techAuditResult.endorsedCount} item(s))
                </Text>
                <Text style={styles.resultBody}>{techAuditResult.escalationGuidance}</Text>
                {techAuditResult.safeRemediationSteps.map((step) => (
                  <View key={step.category} style={styles.stepItem}>
                    <Text style={styles.stepWarning}>• Warning: {step.riskWarning}</Text>
                    <Text style={styles.stepSafe}>
                      ✓ Safe Action: {step.safeActionWithoutAlertingPartner}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Module 2: Encrypted Living DFV Safety Plan & Escape Vault */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              3. Encrypted Living DFV Safety Plan & Escape Vault (MARAM / SafeLives)
            </Text>
            <Text style={styles.label}>Safe Places I Can Go at Short Notice (; separated)</Text>
            <TextInput
              style={styles.input}
              value={safePlacesText}
              onChangeText={setSafePlacesText}
            />
            <Text style={styles.label}>Trusted Adults, Family & Neighbours</Text>
            <TextInput
              style={styles.input}
              value={trustedAdultsText}
              onChangeText={setTrustedAdultsText}
            />
            <Text style={styles.label}>Neutral Family Code Word (Shared with Children/Friends)</Text>
            <TextInput style={styles.input} value={codeWord} onChangeText={setCodeWord} />
            <Text style={styles.label}>Child Handover & Pet Safety Arrangements</Text>
            <TextInput
              style={styles.input}
              value={childPetPlan}
              onChangeText={setChildPetPlan}
            />

            <Pressable style={styles.primaryBtn} onPress={handleSaveSafetyPlan}>
              <Text style={styles.primaryBtnText}>Encrypt & Save Living Safety Plan</Text>
            </Pressable>

            {vaultRecord ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>
                  Encrypted Safety Plan Saved — Readiness:{" "}
                  {vaultRecord.redactedSummary.readinessPercentage}%
                </Text>
                <Text style={styles.resultBody}>
                  Ciphertext Envelope: {vaultRecord.encryptedCiphertext.slice(0, 44)}...
                </Text>
                <Text style={styles.resultBody}>
                  SHA-256 Audit: {vaultRecord.auditSha256.slice(0, 24)}...
                </Text>
                {vaultRecord.safetyChecklistRecommendations.map((rec, idx) => (
                  <Text key={idx} style={styles.stepSafe}>
                    • {rec}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </>
      )}

      <View style={styles.navRow}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/ai-support-coach")}
        >
          <Text style={styles.secondaryBtnText}>Back to AI Support Coach</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/ai-support-coach/couples-family-dfv")}
        >
          <Text style={styles.secondaryBtnText}>Couples & DFV Restoration Hub</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  cloakContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 18, paddingBottom: 48, gap: 16 },
  cloakCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    gap: 10,
  },
  cloakTitle: { fontSize: 20, fontWeight: "700", color: "#1E293B" },
  cloakSubtitle: { fontSize: 14, color: "#64748B", marginBottom: 8 },
  cloakRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  cloakCheck: { fontSize: 16, color: "#475569" },
  cloakItemText: { fontSize: 15, color: "#334155" },
  uncloakSubtleButton: {
    marginTop: 18,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
  },
  uncloakSubtleText: { fontSize: 12, color: "#64748B" },
  quickExitBanner: {
    backgroundColor: "#7F1D1D",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  quickExitTitle: { color: "#FECACA", fontWeight: "800", fontSize: 15 },
  quickExitSub: { color: "#FCA5A5", fontSize: 12, marginTop: 2 },
  quickExitButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  quickExitButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 17, fontWeight: "700" },
  helperText: { color: "#94A3B8", fontSize: 13 },
  label: { color: "#CBD5E1", fontSize: 13, fontWeight: "600", marginTop: 4 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
  },
  checkRowSelected: { borderColor: "#38BDF8", backgroundColor: "#0C4A6E" },
  checkIcon: { color: "#38BDF8", fontSize: 16, fontWeight: "700" },
  checkLabel: { color: "#E2E8F0", fontSize: 13, flex: 1 },
  primaryBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  resultBox: {
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0284C7",
    gap: 6,
  },
  duressResultBox: { borderColor: "#F59E0B" },
  safeResultBox: { borderColor: "#10B981" },
  resultTitle: { color: "#38BDF8", fontWeight: "700", fontSize: 14 },
  resultBody: { color: "#E2E8F0", fontSize: 13 },
  stepItem: { marginTop: 6, gap: 2 },
  stepWarning: { color: "#FCD34D", fontSize: 12 },
  stepSafe: { color: "#6EE7B7", fontSize: 12 },
  navRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  secondaryBtn: {
    backgroundColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
});
