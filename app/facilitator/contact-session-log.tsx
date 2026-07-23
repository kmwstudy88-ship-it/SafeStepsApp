import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  saveContactSessionLog,
  type ContactSessionLogInput,
} from "../../lib/engines/reunificationSupabaseEngine";
import type { StageGatedContactStage } from "../../lib/engines/intensiveReunificationEngine";
import { globalStyles } from "../../lib/styles";

const stages: StageGatedContactStage[] = [
  "no_contact",
  "supervised",
  "semi_supervised",
  "unsupervised",
  "overnight",
  "return_home_trial",
];

const skills = [
  { key: "co_regulation", label: "Co-regulation" },
  { key: "reflective_listening", label: "Reflective listening" },
  { key: "boundary_respect", label: "Boundary respect" },
  { key: "repair_attempts", label: "Repair attempts" },
] as const;

function parseScore(value: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(1, Math.min(5, Math.round(numeric)));
}

function parseCount(value: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric));
}

export default function FacilitatorContactSessionLogScreen() {
  const [caseId, setCaseId] = useState("");
  const [parentProfileId, setParentProfileId] = useState("");
  const [facilitatorProfileId, setFacilitatorProfileId] = useState("");
  const [stage, setStage] = useState<StageGatedContactStage>("supervised");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [comfortScore, setComfortScore] = useState("3");
  const [distressScore, setDistressScore] = useState("2");
  const [regulationScore, setRegulationScore] = useState("3");
  const [interventionCount, setInterventionCount] = useState("0");
  const [riskSeverity, setRiskSeverity] = useState<"green" | "amber" | "red">("green");
  const [unsafeToEscalate, setUnsafeToEscalate] = useState(false);
  const [notes, setNotes] = useState("");
  const [skillEvidence, setSkillEvidence] = useState<ContactSessionLogInput["skillEvidence"]>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const canSave = caseId.trim().length > 0 && parentProfileId.trim().length > 0 && Number(durationMinutes) > 0;

  function toggleSkill(key: keyof NonNullable<ContactSessionLogInput["skillEvidence"]>) {
    setSkillEvidence((current) => ({ ...current, [key]: !current?.[key] }));
  }

  async function handleSave() {
    if (!canSave) {
      setStatus("error");
      setMessage("Enter a case ID, parent profile ID, and duration before saving.");
      return;
    }

    setStatus("saving");
    setMessage("");
    try {
      await saveContactSessionLog({
        caseId: caseId.trim(),
        parentProfileId: parentProfileId.trim(),
        facilitatorProfileId: facilitatorProfileId.trim() || null,
        stage,
        sessionDate: new Date().toISOString(),
        durationMinutes: parseCount(durationMinutes),
        childComfortScore: parseScore(comfortScore),
        childDistressScore: parseScore(distressScore),
        parentRegulationScore: parseScore(regulationScore),
        facilitatorInterventionCount: parseCount(interventionCount),
        facilitatorUnsafeToEscalate: unsafeToEscalate,
        notes: notes.trim() || null,
        riskFlags: riskSeverity === "green" ? [] : [{ code: "facilitator_contact_review", severity: riskSeverity }],
        skillEvidence,
      });
      setStatus("saved");
      setMessage("Contact session saved for caseworker review and progression analysis.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save contact session.");
    }
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Contact Session Log</Text>
      <Text style={globalStyles.subtitle}>
        Record observed regulation, child comfort, facilitator interventions, risk signals, and demonstrated skills.
        These records support review; they do not change contact stage automatically.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Case links</Text>
        <Input value={caseId} onChangeText={setCaseId} placeholder="Case ID" />
        <Input value={parentProfileId} onChangeText={setParentProfileId} placeholder="Parent profile ID" />
        <Input value={facilitatorProfileId} onChangeText={setFacilitatorProfileId} placeholder="Facilitator profile ID" />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Current contact stage</Text>
        <View style={globalStyles.inlineRow}>
          {stages.map((item) => (
            <Pressable
              key={item}
              style={[styles.option, stage === item && styles.selectedOption]}
              onPress={() => setStage(item)}
            >
              <Text style={[styles.optionText, stage === item && styles.selectedOptionText]}>
                {item.replace(/_/g, " ")}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Session scores</Text>
        <View style={styles.grid}>
          <Input value={durationMinutes} onChangeText={setDurationMinutes} placeholder="Duration minutes" />
          <Input value={comfortScore} onChangeText={setComfortScore} placeholder="Child comfort 1-5" />
          <Input value={distressScore} onChangeText={setDistressScore} placeholder="Child distress 1-5" />
          <Input value={regulationScore} onChangeText={setRegulationScore} placeholder="Parent regulation 1-5" />
          <Input value={interventionCount} onChangeText={setInterventionCount} placeholder="Intervention count" />
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Risk and skill evidence</Text>
        <View style={globalStyles.inlineRow}>
          {(["green", "amber", "red"] as const).map((severity) => (
            <Pressable
              key={severity}
              style={[styles.option, riskSeverity === severity && styles.selectedOption]}
              onPress={() => setRiskSeverity(severity)}
            >
              <Text style={[styles.optionText, riskSeverity === severity && styles.selectedOptionText]}>
                {severity}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.option, unsafeToEscalate && styles.warningOption]}
            onPress={() => setUnsafeToEscalate((current) => !current)}
          >
            <Text style={[styles.optionText, unsafeToEscalate && styles.selectedOptionText]}>
              Unsafe to escalate
            </Text>
          </Pressable>
        </View>
        <View style={globalStyles.inlineRow}>
          {skills.map((skill) => (
            <Pressable
              key={skill.key}
              style={[styles.option, skillEvidence?.[skill.key] && styles.selectedOption]}
              onPress={() => toggleSkill(skill.key)}
            >
              <Text style={[styles.optionText, skillEvidence?.[skill.key] && styles.selectedOptionText]}>
                {skill.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Observed facts, facilitator interventions, repair attempts, or child comfort notes"
          multiline
          style={styles.notes}
        />
      </View>

      <Pressable style={[styles.saveButton, !canSave && styles.disabledButton]} onPress={handleSave}>
        <Text style={styles.saveText}>{status === "saving" ? "Saving..." : "Save Contact Session"}</Text>
      </Pressable>
      {message ? <Text style={status === "error" ? styles.errorText : styles.savedText}>{message}</Text> : null}
    </ScrollView>
  );
}

function Input({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} style={styles.input} />;
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#D8E5DD",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  option: {
    minHeight: 40,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8E5DD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  selectedOption: {
    borderColor: "#0D655F",
    backgroundColor: "#0D655F",
  },
  warningOption: {
    borderColor: "#9E2F25",
    backgroundColor: "#9E2F25",
  },
  optionText: {
    color: "#263238",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  notes: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#D8E5DD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
  },
  saveButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#0D655F",
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  savedText: {
    color: "#0D655F",
    fontSize: 14,
    fontWeight: "800",
  },
  errorText: {
    color: "#9E2F25",
    fontSize: 14,
    fontWeight: "800",
  },
});
