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

type CollateralRole =
  | "school_teacher"
  | "school_counsellor"
  | "gp"
  | "mental_health_clinician"
  | "family_support_worker"
  | "domestic_violence_service"
  | "housing_service"
  | "legal_representative"
  | "extended_family"
  | "police"
  | "other";

type AlignmentRating = "supportive" | "mixed" | "contradictory" | "unknown";

const COLLATERAL_ROLE_LABELS: Record<CollateralRole, string> = {
  school_teacher: "School teacher",
  school_counsellor: "School counsellor",
  gp: "GP / medical",
  mental_health_clinician: "Mental health clinician",
  family_support_worker: "Family support worker",
  domestic_violence_service: "Domestic violence service",
  housing_service: "Housing / financial support service",
  legal_representative: "Legal representative",
  extended_family: "Extended family member",
  police: "Police",
  other: "Other",
};

const ALIGNMENT_LABELS: Record<AlignmentRating, string> = {
  supportive: "Supportive of parent self-report",
  mixed: "Partially consistent",
  contradictory: "Contradicts parent self-report",
  unknown: "Alignment unknown",
};

type CollateralFormProps = {
  caseId: string;
  workerUserId: string;
  onSaved?: () => void;
};

export function CollateralForm({ caseId, workerUserId, onSaved }: CollateralFormProps) {
  const [sourceName, setSourceName] = useState("");
  const [role, setRole] = useState<CollateralRole>("school_teacher");
  const [dateReceived, setDateReceived] = useState("");
  const [consentBasis, setConsentBasis] = useState("");
  const [summary, setSummary] = useState("");
  const [alignmentWithParent, setAlignmentWithParent] = useState<AlignmentRating>("unknown");
  const [riskNotes, setRiskNotes] = useState("");
  const [protectiveNotes, setProtectiveNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!sourceName.trim()) {
      setMessage("Source name is required.");
      return;
    }
    if (!summary.trim()) {
      setMessage("Summary is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase.from("assessment_collaterals").insert({
        case_id: caseId,
        worker_user_id: workerUserId,
        source_name: sourceName.trim(),
        role,
        date_received: dateReceived.trim() || null,
        consent_legal_basis: consentBasis.trim() || null,
        summary: summary.trim(),
        alignment_with_parent_self_report: alignmentWithParent,
        risk_protective_notes: riskNotes.trim() || null,
        protective_factors_noted: protectiveNotes.trim() || null,
      });

      if (error) throw error;

      setMessage("Collateral record saved.");
      setSourceName("");
      setDateReceived("");
      setConsentBasis("");
      setSummary("");
      setRiskNotes("");
      setProtectiveNotes("");
      onSaved?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save collateral record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={globalStyles.cardTitle}>Add collateral contact</Text>
      <Text style={styles.note}>
        Record professional or service contacts that provide independent information
        about this family. Obtain consent or record the legal basis before documenting.
      </Text>

      <Text style={styles.fieldLabel}>Source name *</Text>
      <TextInput
        onChangeText={setSourceName}
        placeholder="e.g. Ms. [School Name] Class Teacher"
        placeholderTextColor="#a0aec0"
        style={globalStyles.input}
        value={sourceName}
      />

      <Text style={styles.fieldLabel}>Role</Text>
      <View style={styles.chipRow}>
        {(Object.keys(COLLATERAL_ROLE_LABELS) as CollateralRole[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={[styles.chip, role === r && styles.chipSelected]}
          >
            <Text style={[styles.chipText, role === r && styles.chipTextSelected]}>
              {COLLATERAL_ROLE_LABELS[r]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Date received (optional)</Text>
      <TextInput
        onChangeText={setDateReceived}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#a0aec0"
        style={globalStyles.input}
        value={dateReceived}
      />

      <Text style={styles.fieldLabel}>Consent or legal basis (optional)</Text>
      <TextInput
        onChangeText={setConsentBasis}
        placeholder="e.g. Parent signed consent, or statutory authority under [Act]"
        placeholderTextColor="#a0aec0"
        style={globalStyles.input}
        value={consentBasis}
      />

      <Text style={styles.fieldLabel}>Summary *</Text>
      <TextInput
        multiline
        onChangeText={setSummary}
        placeholder="Summarise what the contact reported. Do not record their exact notes unless you have permission."
        placeholderTextColor="#a0aec0"
        style={[globalStyles.input, globalStyles.textArea]}
        value={summary}
      />

      <Text style={styles.fieldLabel}>Alignment with parent self-report</Text>
      <View style={styles.chipRow}>
        {(Object.keys(ALIGNMENT_LABELS) as AlignmentRating[]).map((a) => (
          <Pressable
            key={a}
            onPress={() => setAlignmentWithParent(a)}
            style={[styles.chip, alignmentWithParent === a && styles.chipSelected]}
          >
            <Text
              style={[styles.chipText, alignmentWithParent === a && styles.chipTextSelected]}
            >
              {ALIGNMENT_LABELS[a]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Risk notes (optional)</Text>
      <TextInput
        multiline
        onChangeText={setRiskNotes}
        placeholder="Any risk indicators raised by this contact."
        placeholderTextColor="#a0aec0"
        style={[globalStyles.input, globalStyles.textArea]}
        value={riskNotes}
      />

      <Text style={styles.fieldLabel}>Protective factors noted (optional)</Text>
      <TextInput
        multiline
        onChangeText={setProtectiveNotes}
        placeholder="Any protective factors or positive observations noted."
        placeholderTextColor="#a0aec0"
        style={[globalStyles.input, globalStyles.textArea]}
        value={protectiveNotes}
      />

      {message ? (
        <Text
          style={message.startsWith("Collateral") ? globalStyles.notice : globalStyles.error}
        >
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
          <Text style={globalStyles.buttonText}>Save collateral record</Text>
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
});
