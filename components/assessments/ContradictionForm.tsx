import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { globalStyles } from "../../lib/styles";
import { supabase } from "../../lib/supabase";

type ContradictionType =
  | "self_report_vs_observed"
  | "self_report_vs_collateral"
  | "observed_vs_collateral"
  | "score_regression"
  | "inconsistency_over_time"
  | "other";

type Severity = "minor" | "moderate" | "significant";

const CONTRADICTION_TYPE_LABELS: Record<ContradictionType, string> = {
  self_report_vs_observed: "Self-report vs observed behaviour",
  self_report_vs_collateral: "Self-report vs collateral information",
  observed_vs_collateral: "Observed behaviour vs collateral information",
  score_regression: "Score regression requiring review",
  inconsistency_over_time: "Inconsistency across time",
  other: "Other inconsistency",
};

const SEVERITY_LABELS: Record<Severity, string> = {
  minor: "Minor – note only",
  moderate: "Moderate – discuss with parent",
  significant: "Significant – escalate to supervisor",
};

type ContradictionFormProps = {
  caseId: string;
  workerUserId: string;
  phase?: string;
  onSaved?: () => void;
};

export function ContradictionForm({
  caseId,
  workerUserId,
  phase,
  onSaved,
}: ContradictionFormProps) {
  const [contradictionType, setContradictionType] =
    useState<ContradictionType>("self_report_vs_observed");
  const [severity, setSeverity] = useState<Severity>("minor");
  const [description, setDescription] = useState("");
  const [sourceA, setSourceA] = useState("");
  const [sourceB, setSourceB] = useState("");
  const [workerNotes, setWorkerNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!description.trim()) {
      setMessage("Describe the inconsistency before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase.from("assessment_contradictions").insert({
        case_id: caseId,
        worker_user_id: workerUserId,
        phase: phase ?? null,
        contradiction_type: contradictionType,
        severity,
        description: description.trim(),
        source_a: sourceA.trim() || null,
        source_b: sourceB.trim() || null,
        worker_notes: workerNotes.trim() || null,
        include_in_report: severity !== "minor",
        supervisor_notified: severity === "significant",
      });

      if (error) throw error;

      setMessage("Inconsistency recorded.");
      setDescription("");
      setSourceA("");
      setSourceB("");
      setWorkerNotes("");
      onSaved?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save contradiction.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={globalStyles.cardTitle}>Record inconsistency</Text>
      <Text style={styles.note}>
        Use neutral language. Do not label the parent as deceptive. Record what
        was observed or reported and where the inconsistency appears.
      </Text>

      <Text style={styles.fieldLabel}>Inconsistency type</Text>
      <View style={styles.chipRow}>
        {(Object.keys(CONTRADICTION_TYPE_LABELS) as ContradictionType[]).map((type) => (
          <Pressable
            key={type}
            onPress={() => setContradictionType(type)}
            style={[styles.chip, contradictionType === type && styles.chipSelected]}
          >
            <Text
              style={[
                styles.chipText,
                contradictionType === type && styles.chipTextSelected,
              ]}
            >
              {CONTRADICTION_TYPE_LABELS[type]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Severity</Text>
      <View style={styles.chipRow}>
        {(Object.keys(SEVERITY_LABELS) as Severity[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSeverity(s)}
            style={[styles.chip, severity === s && styles.chipSelected]}
          >
            <Text style={[styles.chipText, severity === s && styles.chipTextSelected]}>
              {SEVERITY_LABELS[s]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Description *</Text>
      <TextInput
        multiline
        onChangeText={setDescription}
        placeholder="Describe the inconsistency factually and in neutral language."
        placeholderTextColor="#a0aec0"
        style={[globalStyles.input, globalStyles.textArea]}
        value={description}
      />

      <Text style={styles.fieldLabel}>Source A (optional)</Text>
      <TextInput
        onChangeText={setSourceA}
        placeholder="e.g. Parent self-report at session 4"
        placeholderTextColor="#a0aec0"
        style={globalStyles.input}
        value={sourceA}
      />

      <Text style={styles.fieldLabel}>Source B (optional)</Text>
      <TextInput
        onChangeText={setSourceB}
        placeholder="e.g. School report dated 2026-07-01"
        placeholderTextColor="#a0aec0"
        style={globalStyles.input}
        value={sourceB}
      />

      <Text style={styles.fieldLabel}>Worker notes (optional)</Text>
      <TextInput
        multiline
        onChangeText={setWorkerNotes}
        placeholder="Context or follow-up actions."
        placeholderTextColor="#a0aec0"
        style={[globalStyles.input, globalStyles.textArea]}
        value={workerNotes}
      />

      {severity === "significant" && (
        <View style={styles.escalationNotice}>
          <Text style={styles.escalationText}>
            Significant inconsistencies will be flagged for supervisor review and included
            in the report.
          </Text>
        </View>
      )}

      {message ? (
        <Text style={message.startsWith("Inconsistency") ? globalStyles.notice : globalStyles.error}>
          {message}
        </Text>
      ) : null}

      <Pressable
        disabled={saving}
        onPress={handleSave}
        style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={globalStyles.buttonText}>Save inconsistency</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  note: {
    fontSize: 13,
    color: "#718096",
    fontStyle: "italic",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4a5568",
    marginTop: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e0",
    backgroundColor: "#f7fafc",
  },
  chipSelected: {
    backgroundColor: "#2d6a4f",
    borderColor: "#2d6a4f",
  },
  chipText: {
    fontSize: 12,
    color: "#4a5568",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  escalationNotice: {
    backgroundColor: "#fff5f5",
    borderLeftWidth: 3,
    borderLeftColor: "#e53e3e",
    padding: 12,
    borderRadius: 4,
  },
  escalationText: {
    fontSize: 13,
    color: "#c53030",
  },
});
