import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  assessmentTypes,
  caseGoals,
  programStreams,
} from "../../lib/data/assessmentSystem";
import {
  fetchLatestAssessmentCaseSetup,
  saveAssessmentCaseSetup,
  type AssessmentCaseSetup,
} from "../../lib/engines/assessmentCaseEngine";

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value: string[] | null | undefined) {
  return value?.join(", ") ?? "";
}

function normalizeDate(value: string) {
  const nextValue = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(nextValue) ? nextValue : null;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

function SelectableChips({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: readonly string[];
  selected: string[];
  onSelect: (value: string[]) => void;
  multi?: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const active = selected.includes(option);

        return (
          <Pressable
            key={option}
            onPress={() => {
              if (!multi) {
                onSelect([option]);
                return;
              }

              onSelect(
                active
                  ? selected.filter((item) => item !== option)
                  : [...selected, option],
              );
            }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={active ? styles.chipTextActive : styles.chipText}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CaseSetupScreen() {
  const [caseRecord, setCaseRecord] = useState<AssessmentCaseSetup | null>(null);
  const [caseName, setCaseName] = useState("");
  const [parentName, setParentName] = useState("");
  const [childNames, setChildNames] = useState("");
  const [programStream, setProgramStream] = useState("");
  const [assessmentType, setAssessmentType] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [caseStartDate, setCaseStartDate] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [reviewDueDate, setReviewDueDate] = useState("");
  const [courtDate, setCourtDate] = useState("");
  const [supportWorkerName, setSupportWorkerName] = useState("");
  const [caseworkerName, setCaseworkerName] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [legalContactName, setLegalContactName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCaseSetup() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const record = await fetchLatestAssessmentCaseSetup();
      setCaseRecord(record);

      if (record) {
        setCaseName(record.family_label ?? "");
        setParentName(record.parent_carer_name ?? "");
        setChildNames(joinList(record.child_names));
        setProgramStream(record.program_stream ?? "");
        setAssessmentType(record.assessment_type ?? "");
        setSelectedGoals(record.case_goals ?? []);
        setCaseStartDate(record.case_start_date ?? "");
        setAssessmentDate(record.assessment_date ?? "");
        setReviewDueDate(record.review_due_date ?? "");
        setCourtDate(record.court_date ?? "");
        setSupportWorkerName(record.support_worker_name ?? "");
        setCaseworkerName(record.caseworker_name ?? "");
        setSupervisorName(record.supervisor_name ?? "");
        setLegalContactName(record.legal_contact_name ?? "");
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load case setup.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (saving) return;

    if (caseName.trim().length === 0) {
      setError("Enter a case name before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const savedRecord = await saveAssessmentCaseSetup({
        id: caseRecord?.id,
        caseName,
        parentCarerName: parentName,
        childNames: splitList(childNames),
        programStream,
        assessmentType,
        caseGoals: selectedGoals,
        caseStartDate: normalizeDate(caseStartDate),
        assessmentDate: normalizeDate(assessmentDate),
        reviewDueDate: normalizeDate(reviewDueDate),
        courtDate: normalizeDate(courtDate),
        supportWorkerName,
        caseworkerName,
        supervisorName,
        legalContactName,
      });

      setCaseRecord(savedRecord);
      setMessage("Case setup saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save case setup.",
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadCaseSetup();
  }, []);

  return (
    <AssessmentScreenShell
      title="Case Setup"
      subtitle="Set up the family case before completing assessments, scoring, evidence review, and reports."
    >
      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>Recording standard</Text>
        <Text style={styles.warningText}>
          Assessment records should be factual, respectful, and evidence-based. Do not include
          assumptions, blame, or unsupported claims.
        </Text>
      </View>

      {loading ? <ActivityIndicator /> : null}

      {error.length > 0 ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {message.length > 0 ? (
        <View style={styles.successCard}>
          <Text style={styles.successText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Family and case details</Text>

        <Field
          label="Case name"
          value={caseName}
          onChangeText={setCaseName}
          placeholder="Example: Watts family reunification case"
        />

        <Field
          label="Parent or carer name"
          value={parentName}
          onChangeText={setParentName}
          placeholder="Enter parent or carer name"
        />

        <Field
          label="Child / children names"
          value={childNames}
          onChangeText={setChildNames}
          placeholder="Names or initials, separated by commas"
          multiline
        />

        <Text style={styles.label}>Program stream</Text>
        <SelectableChips
          options={programStreams}
          selected={programStream ? [programStream] : []}
          onSelect={(value) => setProgramStream(value[0] ?? "")}
        />

        <Text style={styles.label}>Assessment type</Text>
        <SelectableChips
          options={assessmentTypes}
          selected={assessmentType ? [assessmentType] : []}
          onSelect={(value) => setAssessmentType(value[0] ?? "")}
        />

        <Text style={styles.label}>Case goals</Text>
        <SelectableChips
          options={caseGoals}
          selected={selectedGoals}
          onSelect={setSelectedGoals}
          multi
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Important dates</Text>
        <Field
          label="Case start date"
          value={caseStartDate}
          onChangeText={setCaseStartDate}
          placeholder="YYYY-MM-DD"
        />
        <Field
          label="Assessment date"
          value={assessmentDate}
          onChangeText={setAssessmentDate}
          placeholder="YYYY-MM-DD"
        />
        <Field
          label="Review due date"
          value={reviewDueDate}
          onChangeText={setReviewDueDate}
          placeholder="YYYY-MM-DD"
        />
        <Field
          label="Court date, if applicable"
          value={courtDate}
          onChangeText={setCourtDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assigned people</Text>
        <Field
          label="Support worker"
          value={supportWorkerName}
          onChangeText={setSupportWorkerName}
          placeholder="Support worker name"
        />
        <Field
          label="Caseworker"
          value={caseworkerName}
          onChangeText={setCaseworkerName}
          placeholder="Caseworker name"
        />
        <Field
          label="Supervisor"
          value={supervisorName}
          onChangeText={setSupervisorName}
          placeholder="Supervisor name"
        />
        <Field
          label="Court/legal contact"
          value={legalContactName}
          onChangeText={setLegalContactName}
          placeholder="Legal contact name"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Setup summary</Text>
        <Text style={styles.summaryText}>Case: {caseName || "Not entered yet"}</Text>
        <Text style={styles.summaryText}>Parent or carer: {parentName || "Not entered yet"}</Text>
        <Text style={styles.summaryText}>Children: {childNames || "Not entered yet"}</Text>
        <Text style={styles.summaryText}>Program: {programStream || "Not selected yet"}</Text>
        <Text style={styles.summaryText}>Assessment: {assessmentType || "Not selected yet"}</Text>
        <Text style={styles.summaryText}>Goals: {selectedGoals.join(", ") || "Not selected yet"}</Text>
        <Pressable
          disabled={saving}
          onPress={handleSave}
          style={[styles.primaryButton, saving && styles.buttonDisabled]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Case Setup</Text>
          )}
        </Pressable>
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  warningCard: {
    gap: 6,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5C879",
    backgroundColor: "#F7E7C2",
  },
  warningTitle: {
    color: "#7A4E00",
    fontWeight: "900",
  },
  warningText: {
    color: "#654200",
    lineHeight: 21,
  },
  errorCard: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#FBE5E1",
  },
  errorText: {
    color: "#8E2B21",
    fontWeight: "800",
  },
  successCard: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#E4F3EF",
  },
  successText: {
    color: assessmentColors.tealDark,
    fontWeight: "800",
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  field: {
    gap: 6,
  },
  label: {
    color: assessmentColors.charcoal,
    fontWeight: "800",
  },
  input: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 88,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: "#E8F2EF",
  },
  chipActive: {
    backgroundColor: assessmentColors.teal,
  },
  chipText: {
    color: assessmentColors.tealDark,
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  summaryText: {
    color: assessmentColors.charcoal,
    lineHeight: 20,
  },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: assessmentColors.teal,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});
