import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { blockerMessage } from "../../lib/engines/programStartGatePolicy";
import { startProgramEnrollment } from "../../lib/engines/programEnrollmentEngine";
import {
  confirmMyProgramRecommendation,
  fetchMyProgramRecommendation,
  type ProgramRecommendationJourney,
} from "../../lib/engines/programRecommendationEngine";
import {
  programCanAcceptNewEnrollments,
} from "../../lib/engines/programRecommendationPolicy";

function formatRisk(value: string) {
  return value.replaceAll("_", " ");
}

export default function ProgramRecommendationScreen() {
  const [journey, setJourney] = useState<ProgramRecommendationJourney | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadRecommendation() {
    setLoading(true);
    setError("");

    try {
      setJourney(await fetchMyProgramRecommendation());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load the program recommendation.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecommendation();
  }, []);

  async function handleConfirm() {
    if (!journey) return;
    setSaving(true);
    setError("");

    try {
      await confirmMyProgramRecommendation(
        journey.caseId,
        journey.recommendation.program.id,
      );
      await loadRecommendation();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not confirm the program recommendation.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStart() {
    if (!journey) return;
    setSaving(true);
    setError("");

    try {
      await startProgramEnrollment(
        journey.recommendation.program.id,
        journey.recommendation.program.title,
      );
      await loadRecommendation();
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Could not start the confirmed program.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading && !journey) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#008A84" />
        <Text style={styles.body}>Loading your saved pathway...</Text>
      </View>
    );
  }

  if (!journey) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Program recommendation</Text>
        <View style={styles.errorCard}>
          <Text style={styles.cardTitle}>Recommendation not ready</Text>
          <Text style={styles.body}>{error}</Text>
          <Link href="/intake" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Open parent intake</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    );
  }

  const { recommendation, confirmation, intakeProgress } = journey;
  const program = recommendation.program;
  const launchable = programCanAcceptNewEnrollments(program);
  const intakeReady =
    intakeProgress.intakeComplete &&
    intakeProgress.completedSections >= intakeProgress.totalSections;
  const blockers = intakeProgress.decision.blockers.map(blockerMessage);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Your saved starting pathway</Text>
      <Text style={styles.title}>Review your program recommendation</Text>
      <Text style={styles.lead}>
        SafeSteps shows the basis, limits, and approval state before anything is
        enrolled.
      </Text>

      <View style={styles.recommendationCard}>
        <View style={styles.tagRow}>
          <Text style={styles.tag}>{program.launchLabel}</Text>
          <Text style={styles.tag}>
            {formatRisk(program.curation.riskLevel)} pathway
          </Text>
        </View>
        <Text style={styles.programTitle}>{program.title}</Text>
        <Text style={styles.body}>{program.description}</Text>
        <Text style={styles.detail}>
          {program.durationMonths > 0
            ? `${program.durationMonths} months`
            : "Worker-defined duration"}
          {" · "}
          {program.curation.reviewCadence}
        </Text>
      </View>

      <View style={styles.explanationCard}>
        <Text style={styles.cardTitle}>Why this is shown</Text>
        <Text style={styles.body}>{recommendation.rationale}</Text>
        <Text style={styles.limitation}>{recommendation.limitation}</Text>
      </View>

      <View style={styles.explanationCard}>
        <Text style={styles.cardTitle}>What happens next</Text>
        {!intakeReady ? (
          <>
            <Text style={styles.body}>
              Finish all intake sections before confirming this pathway.
            </Text>
            <Link href="/intake" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Continue intake</Text>
              </Pressable>
            </Link>
          </>
        ) : !confirmation ? (
          <>
            <Text style={styles.body}>
              Confirming records your choice. It does not bypass worker review
              or turn self-reported intake answers into assessment findings.
            </Text>
            <Pressable
              disabled={saving}
              onPress={handleConfirm}
              style={[styles.primaryButton, saving && styles.disabledButton]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Confirm this recommendation
                </Text>
              )}
            </Pressable>
          </>
        ) : journey.activeEnrollmentId ? (
          <>
            <Text style={styles.success}>
              Confirmed and active. Your program record is ready.
            </Text>
            <Link href="/programs/my-programs" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Open my program</Text>
              </Pressable>
            </Link>
          </>
        ) : !launchable ? (
          <Text style={styles.notice}>
            Your confirmation is saved. This pathway is still in structured
            governance review, so SafeSteps will not create an enrolment yet.
          </Text>
        ) : !intakeProgress.decision.allowed ? (
          <>
            <Text style={styles.notice}>
              Your confirmation is saved. The program cannot start until these
              safeguards are complete:
            </Text>
            {blockers.map((blocker) => (
              <Text key={blocker} style={styles.blocker}>
                • {blocker}
              </Text>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.success}>
              Your confirmation and required safeguards are complete.
            </Text>
            <Pressable
              disabled={saving}
              onPress={handleStart}
              style={[styles.primaryButton, saving && styles.disabledButton]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Start confirmed program
                </Text>
              )}
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.choiceCard}>
        <Text style={styles.cardTitle}>Want to review the choice?</Text>
        <Text style={styles.body}>
          You can compare pathways or update the starting-pathway selection in
          intake. SafeSteps will not infer a different program from narrative
          answers.
        </Text>
        <View style={styles.buttonRow}>
          <Link href="/programs/main" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Compare pathways</Text>
            </Pressable>
          </Link>
          <Link href="/intake" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Review intake</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#F8F5EE",
  },
  content: {
    flexGrow: 1,
    gap: 16,
    padding: 24,
    paddingBottom: 48,
    backgroundColor: "#F8F5EE",
  },
  eyebrow: {
    color: "#006A66",
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: { color: "#0B2742", fontSize: 30, fontWeight: "900" },
  lead: { color: "#546A76", fontSize: 16, lineHeight: 24, maxWidth: 760 },
  recommendationCard: {
    gap: 12,
    padding: 22,
    borderRadius: 12,
    backgroundColor: "#DCEFE8",
  },
  explanationCard: {
    gap: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D9E5E2",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  choiceCard: {
    gap: 12,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#EEF5F3",
  },
  errorCard: {
    gap: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#B42318",
    borderRadius: 12,
    backgroundColor: "#FFF4F2",
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    color: "#0B2742",
    backgroundColor: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  programTitle: { color: "#0B2742", fontSize: 24, fontWeight: "900" },
  cardTitle: { color: "#0B2742", fontSize: 19, fontWeight: "900" },
  body: { color: "#43534D", fontSize: 15, lineHeight: 22 },
  detail: { color: "#0B2742", fontWeight: "800" },
  limitation: {
    color: "#5E4A17",
    lineHeight: 22,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FFF5D8",
  },
  notice: { color: "#5E4A17", fontSize: 15, lineHeight: 22 },
  success: { color: "#246B45", fontSize: 15, fontWeight: "800" },
  blocker: { color: "#5E4A17", lineHeight: 21 },
  errorText: { color: "#B42318", fontWeight: "800" },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#008A84",
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900" },
  secondaryButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#008A84",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: { color: "#006A66", fontWeight: "900" },
  disabledButton: { opacity: 0.58 },
});
