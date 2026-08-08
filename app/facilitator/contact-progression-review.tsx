import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useSensitiveAccess } from "../../components/security/SensitiveRouteBoundary";
import {
  evaluateAndSaveReunificationRecommendation,
  fetchLatestReunificationOverride,
  fetchLatestReunificationRecommendation,
  saveReunificationOverride,
  type ReunificationEvaluationSnapshot,
  type ReunificationOverrideRecord,
  type ReunificationOverrideType,
  type ReunificationRecommendationRecord,
} from "../../lib/engines/reunificationSupabaseEngine";
import type { StageGatedContactStage } from "../../lib/engines/intensiveReunificationEngine";
import { globalStyles } from "../../lib/styles";
import {
  loadContactProgressionReviewContext,
  type ContactProgressionReviewContext,
} from "../../lib/workerCaseReview";

const stages: StageGatedContactStage[] = [
  "no_contact",
  "supervised",
  "semi_supervised",
  "unsupervised",
  "overnight",
  "return_home_trial",
];

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function labelStage(stage: StageGatedContactStage | null | undefined) {
  return stage ? stage.replace(/_/g, " ") : "Not set";
}

function asList(items: string[] | null | undefined) {
  return items && items.length > 0 ? items : ["No items recorded."];
}

export default function ContactProgressionReviewScreen() {
  const access = useSensitiveAccess();
  const caseId = access?.caseId ?? null;
  const role = access?.role ?? null;
  const [context, setContext] = useState<ContactProgressionReviewContext | null>(null);
  const [recommendation, setRecommendation] = useState<ReunificationRecommendationRecord | null>(null);
  const [latestOverride, setLatestOverride] = useState<ReunificationOverrideRecord | null>(null);
  const [snapshot, setSnapshot] = useState<ReunificationEvaluationSnapshot | null>(null);
  const [targetStage, setTargetStage] = useState<StageGatedContactStage>("supervised");
  const [overrideReason, setOverrideReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");
  const [message, setMessage] = useState("");

  const canGenerateRecommendation = role === "facilitator" || role === "admin";
  const canCreateOverride = role === "caseworker" || role === "admin";

  async function reloadProgression(nextContext = context) {
    if (!nextContext) return;
    const [nextRecommendation, nextOverride] = await Promise.all([
      fetchLatestReunificationRecommendation({
        caseId: nextContext.caseId,
        parentProfileId: nextContext.parentProfileId,
      }),
      fetchLatestReunificationOverride({
        caseId: nextContext.caseId,
        parentProfileId: nextContext.parentProfileId,
      }),
    ]);
    setRecommendation(nextRecommendation);
    setLatestOverride(nextOverride);
    if (nextRecommendation?.recommended_stage) setTargetStage(nextRecommendation.recommended_stage);
  }

  useEffect(() => {
    if (!caseId) return;
    let active = true;
    setLoading(true);
    setMessage("");

    async function load() {
      try {
        const nextContext = await loadContactProgressionReviewContext(caseId);
        if (!active) return;
        setContext(nextContext);
        await reloadProgression(nextContext);
      } catch (error) {
        if (active) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Unable to load contact progression review.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [caseId]);

  async function handleGenerateRecommendation() {
    if (!context) return;
    setStatus("saving");
    setMessage("");
    try {
      const nextSnapshot = await evaluateAndSaveReunificationRecommendation({
        caseId: context.caseId,
        parentProfileId: context.parentProfileId,
        facilitatorProfileId: context.actorProfileId,
      });
      setSnapshot(nextSnapshot);
      await reloadProgression(context);
      setStatus("saved");
      setMessage("Recommendation saved for caseworker review. It does not change contact stage automatically.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save recommendation.");
    }
  }

  async function handleOverride(overrideType: ReunificationOverrideType) {
    if (!context) return;
    if (!overrideReason.trim()) {
      setStatus("error");
      setMessage("Enter a reason before recording a caseworker decision.");
      return;
    }

    const needsTarget = overrideType !== "hold";
    setStatus("saving");
    setMessage("");
    try {
      await saveReunificationOverride({
        caseId: context.caseId,
        parentProfileId: context.parentProfileId,
        caseworkerProfileId: context.actorProfileId,
        overrideType,
        targetStage: needsTarget ? targetStage : null,
        reason: overrideReason.trim(),
      });
      await reloadProgression(context);
      setStatus("saved");
      setMessage("Caseworker decision recorded. The next evaluation will use this override before any session-derived stage.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to record caseworker decision.");
    }
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Contact Progression Review</Text>
      <Text style={globalStyles.subtitle}>
        Review contact-session evidence, facilitator recommendations, and caseworker decisions for the selected SafeSteps case.
      </Text>

      {loading ? <ActivityIndicator /> : null}

      {context ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Selected case</Text>
          <Text style={globalStyles.cardText}>{context.familyLabel || context.parentCarerName || "SafeSteps family case"}</Text>
          <Text style={globalStyles.mutedText}>{context.caseNumber ? `Case ${context.caseNumber}` : "Selected authorised case"}</Text>
          <Text style={globalStyles.mutedText}>Signed-in role: {role || "Not available"}</Text>
        </View>
      ) : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Latest recommendation</Text>
        {recommendation ? (
          <>
            <Text style={globalStyles.cardText}>Current stage: {labelStage(recommendation.current_stage)}</Text>
            <Text style={globalStyles.cardText}>Recommended stage: {labelStage(recommendation.recommended_stage)}</Text>
            <Text style={globalStyles.cardText}>Risk level: {recommendation.risk_level || "Not recorded"}</Text>
            <Text style={globalStyles.mutedText}>Saved: {formatDate(recommendation.created_at)}</Text>
            <Text style={styles.sectionLabel}>Reasons</Text>
            {asList(recommendation.reasons).map((item) => <Text key={item} style={globalStyles.cardText}>• {item}</Text>)}
            <Text style={styles.sectionLabel}>Hard blocks</Text>
            {asList(recommendation.hard_blocks ?? []).map((item) => <Text key={item} style={globalStyles.cardText}>• {item}</Text>)}
            <Text style={styles.sectionLabel}>Required interventions</Text>
            {asList(recommendation.required_interventions ?? []).map((item) => <Text key={item} style={globalStyles.cardText}>• {item.replace(/_/g, " ")}</Text>)}
          </>
        ) : (
          <Text style={globalStyles.cardText}>No recommendation has been saved for this case yet.</Text>
        )}
      </View>

      {snapshot ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Latest evaluation snapshot</Text>
          <Text style={globalStyles.cardText}>Sessions assessed: {snapshot.input.contactSessions.length}</Text>
          <Text style={globalStyles.cardText}>Assessments assessed: {snapshot.input.assessmentRecords.length}</Text>
          <Text style={globalStyles.cardText}>Can escalate: {snapshot.result.canEscalate ? "Yes" : "No"}</Text>
          <Text style={globalStyles.cardText}>Must regress: {snapshot.result.mustRegress ? "Yes" : "No"}</Text>
        </View>
      ) : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Facilitator recommendation action</Text>
        <Text style={globalStyles.cardText}>
          A facilitator can calculate and save an evidence-based recommendation. This is advisory only and remains subject to caseworker review.
        </Text>
        <Pressable
          disabled={!canGenerateRecommendation || status === "saving" || !context}
          style={[styles.button, (!canGenerateRecommendation || status === "saving" || !context) && styles.disabledButton]}
          onPress={handleGenerateRecommendation}
        >
          <Text style={styles.buttonText}>{status === "saving" ? "Saving…" : "Generate recommendation"}</Text>
        </Pressable>
        {!canGenerateRecommendation ? <Text style={globalStyles.mutedText}>This action is limited to facilitators/admins.</Text> : null}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Caseworker decision / override</Text>
        <Text style={globalStyles.cardText}>
          A caseworker can hold, force escalation, or force regression with a recorded reason. This does not remove the evidence trail.
        </Text>
        <Text style={styles.sectionLabel}>Target stage for forced decisions</Text>
        <View style={globalStyles.inlineRow}>
          {stages.map((stage) => (
            <Pressable
              key={stage}
              style={[styles.option, targetStage === stage && styles.selectedOption]}
              onPress={() => setTargetStage(stage)}
            >
              <Text style={[styles.optionText, targetStage === stage && styles.selectedOptionText]}>{labelStage(stage)}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={overrideReason}
          onChangeText={setOverrideReason}
          placeholder="Reason for caseworker decision"
          multiline
          style={styles.notes}
        />
        <View style={globalStyles.inlineRow}>
          <Pressable
            disabled={!canCreateOverride || status === "saving" || !context}
            style={[styles.button, (!canCreateOverride || status === "saving" || !context) && styles.disabledButton]}
            onPress={() => handleOverride("hold")}
          >
            <Text style={styles.buttonText}>Hold stage</Text>
          </Pressable>
          <Pressable
            disabled={!canCreateOverride || status === "saving" || !context}
            style={[styles.button, (!canCreateOverride || status === "saving" || !context) && styles.disabledButton]}
            onPress={() => handleOverride("force_escalation")}
          >
            <Text style={styles.buttonText}>Force escalation</Text>
          </Pressable>
          <Pressable
            disabled={!canCreateOverride || status === "saving" || !context}
            style={[styles.button, (!canCreateOverride || status === "saving" || !context) && styles.disabledButton]}
            onPress={() => handleOverride("force_regression")}
          >
            <Text style={styles.buttonText}>Force regression</Text>
          </Pressable>
        </View>
        {!canCreateOverride ? <Text style={globalStyles.mutedText}>This action is limited to caseworkers/admins.</Text> : null}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Latest caseworker decision</Text>
        {latestOverride ? (
          <>
            <Text style={globalStyles.cardText}>Decision: {latestOverride.override_type.replace(/_/g, " ")}</Text>
            <Text style={globalStyles.cardText}>Target stage: {labelStage(latestOverride.target_stage)}</Text>
            <Text style={globalStyles.cardText}>Reason: {latestOverride.reason}</Text>
            <Text style={globalStyles.mutedText}>Saved: {formatDate(latestOverride.created_at)}</Text>
          </>
        ) : (
          <Text style={globalStyles.cardText}>No caseworker decision has been recorded yet.</Text>
        )}
      </View>

      {message ? <Text style={status === "error" ? styles.errorText : styles.savedText}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#0D655F",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  sectionLabel: {
    color: "#263238",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 10,
  },
  option: {
    minHeight: 38,
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
  optionText: {
    color: "#263238",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  notes: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: "#D8E5DD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
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
