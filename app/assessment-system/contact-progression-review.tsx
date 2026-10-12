import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  AssessmentButton,
  AssessmentCard,
  AssessmentScreenShell,
  StatusPill,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  fetchLatestReunificationRecommendation,
  saveReunificationOverride,
  type ReunificationOverrideType,
  type ReunificationRecommendationRecord,
} from "../../lib/engines/reunificationSupabaseEngine";

const overrideOptions: {
  label: string;
  type: ReunificationOverrideType;
  tone: "warning" | "success";
}[] = [
  { label: "Hold Stage", type: "hold", tone: "warning" },
  { label: "Approve Escalation", type: "force_escalation", tone: "success" },
  { label: "Force Regression", type: "force_regression", tone: "warning" },
];

function toParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatStage(value: string | null | undefined) {
  return value ? value.replace(/_/g, " ") : "Not recorded";
}

function recommendationTone(record: ReunificationRecommendationRecord | null) {
  if (!record) return "warning" as const;
  if ((record.hard_blocks ?? []).length > 0) return "risk" as const;
  if (record.risk_level === "low") return "success" as const;
  return "warning" as const;
}

export default function ContactProgressionReviewScreen() {
  const params = useLocalSearchParams();
  const caseId = toParam(params.caseId);
  const parentProfileId = toParam(params.parentProfileId);
  const caseworkerProfileId = toParam(params.caseworkerProfileId);

  const [record, setRecord] = useState<ReunificationRecommendationRecord | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "missing" | "error" | "saved">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewReason, setReviewReason] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendation() {
      if (!caseId || !parentProfileId) {
        setStatus("missing");
        return;
      }

      setStatus("loading");
      try {
        const latest = await fetchLatestReunificationRecommendation({ caseId, parentProfileId });
        if (!isMounted) return;
        setRecord(latest);
        setStatus(latest ? "ready" : "missing");
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : "Unable to load recommendation.");
        setStatus("error");
      }
    }

    loadRecommendation();

    return () => {
      isMounted = false;
    };
  }, [caseId, parentProfileId]);

  const canSaveOverride = Boolean(caseId && parentProfileId && caseworkerProfileId && reviewReason.trim().length > 0);
  const orderedBlocks = useMemo(() => record?.hard_blocks ?? [], [record]);
  const orderedInterventions = useMemo(() => record?.required_interventions ?? [], [record]);

  async function handleOverride(type: ReunificationOverrideType) {
    if (!caseId || !parentProfileId || !caseworkerProfileId || !reviewReason.trim()) return;

    setStatus("loading");
    try {
      await saveReunificationOverride({
        caseId,
        parentProfileId,
        caseworkerProfileId,
        overrideType: type,
        targetStage: type === "force_escalation" ? record?.recommended_stage ?? null : record?.current_stage ?? null,
        reason: reviewReason.trim(),
      });
      setStatus("saved");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save override.");
      setStatus("error");
    }
  }

  return (
    <AssessmentScreenShell
      title="Contact Progression Review"
      subtitle="Review generated reunification stage recommendations, hard blocks, and required interventions before any caseworker decision is recorded."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard tone={recommendationTone(record)}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Latest recommendation</Text>
            <StatusPill
              label={status === "loading" ? "Loading" : record ? `${record.risk_level ?? "unknown"} risk` : "No live record"}
              tone={recommendationTone(record)}
            />
          </View>

          {status === "error" ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {status === "missing" ? (
            <Text style={styles.body}>
              Provide `caseId` and `parentProfileId` route parameters after a facilitator has generated a recommendation.
              This screen will not change contact stage without a separate caseworker override record.
            </Text>
          ) : null}

          {record ? (
            <>
              <View style={styles.grid}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Current stage</Text>
                  <Text style={styles.metricValue}>{formatStage(record.current_stage)}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Recommended stage</Text>
                  <Text style={styles.metricValue}>{formatStage(record.recommended_stage)}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Created</Text>
                  <Text style={styles.metricValue}>{new Date(record.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
              <Text style={styles.listTitle}>Reasons</Text>
              {record.reasons.map((reason) => (
                <Text key={reason} style={styles.listItem}>
                  - {reason}
                </Text>
              ))}
            </>
          ) : null}
        </AssessmentCard>

        <AssessmentCard tone={orderedBlocks.length > 0 ? "risk" : "success"}>
          <Text style={styles.sectionTitle}>Hard blocks and interventions</Text>
          {orderedBlocks.length > 0 ? (
            orderedBlocks.map((block) => (
              <Text key={block} style={styles.blockText}>
                - {block}
              </Text>
            ))
          ) : (
            <Text style={styles.body}>No hard blocks recorded on the latest recommendation.</Text>
          )}
          {orderedInterventions.length > 0 ? (
            <>
              <Text style={styles.listTitle}>Required interventions</Text>
              {orderedInterventions.map((intervention) => (
                <Text key={intervention} style={styles.listItem}>
                  - {intervention.replace(/_/g, " ")}
                </Text>
              ))}
            </>
          ) : null}
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.sectionTitle}>Caseworker decision record</Text>
          <Text style={styles.body}>
            Save a separate override only after reviewing contact logs, assessment evidence, child comfort, facilitator
            notes, court constraints, and any safety flags.
          </Text>
          <TextInput
            value={reviewReason}
            onChangeText={setReviewReason}
            placeholder="Reason for hold, escalation approval, or regression decision"
            multiline
            style={styles.input}
          />
          {!caseworkerProfileId ? (
            <Text style={styles.warningText}>Add `caseworkerProfileId` to the route before saving a decision record.</Text>
          ) : null}
          <View style={styles.actions}>
            {overrideOptions.map((option) => (
              <AssessmentButton
                key={option.type}
                label={canSaveOverride ? option.label : `${option.label} Requires Reason`}
                tone={option.tone}
                onPress={canSaveOverride ? () => handleOverride(option.type) : undefined}
              />
            ))}
          </View>
          {status === "saved" ? <Text style={styles.savedText}>Decision record saved separately from the generated recommendation.</Text> : null}
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "800",
  },
  body: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 170,
    gap: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: assessmentColors.sage,
  },
  metricLabel: {
    color: assessmentColors.sageDark,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  listTitle: {
    color: assessmentColors.charcoal,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  listItem: {
    color: assessmentColors.charcoal,
    fontSize: 14,
    lineHeight: 21,
  },
  blockText: {
    color: assessmentColors.redText,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    color: assessmentColors.charcoal,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  warningText: {
    color: assessmentColors.amberText,
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    color: assessmentColors.redText,
    fontSize: 14,
    fontWeight: "800",
  },
  savedText: {
    color: assessmentColors.teal,
    fontSize: 14,
    fontWeight: "800",
  },
});
