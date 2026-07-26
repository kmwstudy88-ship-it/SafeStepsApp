import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getProgramById, getProgramMonths } from "../../lib/data/programs";
import { getCurrentUser } from "../../lib/engines/authEngine";
import {
  fetchActiveProgramEnrollment,
  ProgramEnrollment,
  startProgramEnrollment,
} from "../../lib/engines/programEnrollmentEngine";
import { hasCompletedIntakeAssessment } from "../../lib/platformData";

const intensiveChallenges = [
  { title: "Bedtime Routine Reset", frequency: "Weekly", duration: "20 minutes" },
  { title: "Emergency Basics Review", frequency: "Monthly", duration: "20 minutes" },
  { title: "Repair After a Hard Moment", frequency: "Daily", duration: "10-15 minutes" },
  { title: "Warm Greeting Challenge", frequency: "Daily", duration: "5 minutes" },
];

function formatRiskLevel(riskLevel: string) {
  return riskLevel.replace("_", " ");
}

export default function ProgramPathwayScreen() {
  const params = useLocalSearchParams();
  const programId = String(params.programId ?? "");
  const program = getProgramById(programId);
  const selectedProgramId = program?.id ?? "";
  const programMonths = program ? getProgramMonths(program) : [];

  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [checking, setChecking] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [openMonths, setOpenMonths] = useState<Record<number, boolean>>({ 1: true });

  async function handleStartProgram() {
    if (!program) return;

    setStarting(true);
    setError("");

    try {
      const saved = await startProgramEnrollment(program.id, program.title);
      setEnrollment(saved);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not start program.");
    } finally {
      setStarting(false);
    }
  }

  function toggleMonth(monthNumber: number) {
    setOpenMonths((current) => ({ ...current, [monthNumber]: !current[monthNumber] }));
  }

  useEffect(() => {
    let active = true;

    async function loadEnrollment() {
      setChecking(true);
      setError("");

      try {
        if (!selectedProgramId) return;
        const user = await getCurrentUser();
        if (user) {
          const nextIntakeComplete = await hasCompletedIntakeAssessment(user.id);
          if (active) setIntakeComplete(nextIntakeComplete);
        }
        const activeEnrollment = await fetchActiveProgramEnrollment(selectedProgramId);
        if (active) setEnrollment(activeEnrollment);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Could not check program enrolment.");
      } finally {
        if (active) setChecking(false);
      }
    }

    loadEnrollment();

    return () => {
      active = false;
    };
  }, [selectedProgramId]);

  if (!program) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Program not found</Text>
        <Text style={styles.bodyText}>This program is not available in the current SafeSteps pathway list.</Text>
      </ScrollView>
    );
  }

  const programStarted = enrollment !== null;
  const isIntensiveReunification = program.id === "intensive-reunification";
  const programActive = programStarted && intakeComplete;
  const ctaLabel = programStarted ? "Continue Program" : "Launch Program";
  const startDate = programStarted && enrollment?.started_at
    ? new Date(enrollment.started_at).toLocaleDateString()
    : "Not started";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{program.title}</Text>
        <Text style={styles.description}>{program.description}</Text>
        {programStarted && intakeComplete ? (
          <Link href={{ pathname: "/programs/month", params: { programId: program.id, programTitle: program.title, monthNumber: "1" } }} asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
            </Pressable>
          </Link>
        ) : (
          <Pressable
            disabled={checking || starting || !intakeComplete}
            onPress={handleStartProgram}
            style={[styles.primaryButton, (!intakeComplete || starting || checking) && styles.disabledButton]}
          >
            {starting || checking ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{ctaLabel}</Text>}
          </Pressable>
        )}
      </View>

      {!intakeComplete ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Intake required first</Text>
          <Text style={styles.bodyText}>Complete the SafeSteps intake assessment before this program can be started or continued.</Text>
          <Link href="/assessments" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Open intake assessment</Text>
            </Pressable>
          </Link>
        </View>
      ) : null}

      {error.length > 0 ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Program Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>!</Text>
          <Text style={styles.summaryLabel}>Risk Level</Text>
          <Text style={styles.summaryValue}>{formatRiskLevel(program.curation.riskLevel)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>W</Text>
          <Text style={styles.summaryLabel}>Review Cadence</Text>
          <Text style={styles.summaryValue}>{program.curation.reviewCadence}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>E</Text>
          <Text style={styles.summaryLabel}>Entry Criteria</Text>
          {program.curation.entryCriteria.map((criterion) => (
            <Text key={criterion} style={styles.criteriaText}>- {criterion}</Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Program Routing & Assessments</Text>
          <Text style={styles.assessmentBadge}>Assessments assigned: {program.curation.assessmentAssignedCourses.length}</Text>
        </View>
        <View style={styles.pillRow}>
          {program.curation.requiredCourseIds.map((courseId) => (
            <Text key={courseId} style={styles.coursePill}>{courseId}</Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task-to-Progress Flow</Text>
        <View style={styles.pipeline}>
          {program.curation.taskReflectionEvidenceProgressFlow.map((step, index) => (
            <View key={step} style={styles.pipelineStep}>
              <View style={styles.pipelineCircle}>
                <Text style={styles.pipelineNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.pipelineText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      {isIntensiveReunification ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenges</Text>
          <View style={styles.challengeGrid}>
            {intensiveChallenges.map((challenge) => (
              <View key={challenge.title} style={styles.challengeCard}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.frequencyBadge}>{challenge.frequency}</Text>
                  <Text style={styles.durationBadge}>{challenge.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.statusBar}>
        <Text style={styles.statusLabel}>Program Status</Text>
        <Text style={programActive ? styles.activeTag : styles.inactiveTag}>{programActive ? "Active" : "Not started"}</Text>
        <Text style={styles.statusText}>Started: {startDate}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Month-by-Month Structure</Text>
        <Text style={styles.bodyText}>
          Each month begins with a parent reflection. There are no right or wrong answers.
        </Text>

        <View style={styles.monthList}>
          {programMonths.map((month) => {
            const open = Boolean(openMonths[month.monthNumber]);

            return (
              <View key={`${program.id}-month-${month.monthNumber}`} style={styles.monthCard}>
                <Pressable onPress={() => toggleMonth(month.monthNumber)} style={styles.monthHeader}>
                  <Text style={styles.monthTitle}>Month {month.monthNumber}: {month.topic}</Text>
                  <Text style={styles.monthToggle}>{open ? "-" : "+"}</Text>
                </Pressable>

                {open ? (
                  <View style={styles.monthBody}>
                    <Text style={styles.bodyText}>This month begins with a parent reflection. There are no right or wrong answers.</Text>
                    <Link
                      href={{
                        pathname: "/programs/month",
                        params: {
                          programId: program.id,
                          programTitle: program.title,
                          monthNumber: String(month.monthNumber),
                        },
                      }}
                      asChild
                    >
                      <Pressable style={styles.openMonthButton}>
                        <Text style={styles.openMonthButtonText}>Open Month</Text>
                      </Pressable>
                    </Link>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7FAF8" },
  content: { gap: 18, padding: 20, paddingBottom: 40 },
  header: {
    gap: 12,
    padding: 22,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderWidth: 1,
  },
  title: { color: "#12332B", fontSize: 30, fontWeight: "900", lineHeight: 38 },
  description: { color: "#43534D", fontSize: 16, lineHeight: 24, maxWidth: 900 },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 46,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#0D5C75",
    paddingHorizontal: 18,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900" },
  disabledButton: { backgroundColor: "#9AA7A2" },
  secondaryButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    justifyContent: "center",
    borderRadius: 8,
    borderColor: "#0D5C75",
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  secondaryButtonText: { color: "#0D5C75", fontWeight: "900" },
  noticeCard: {
    gap: 10,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FFF7E8",
    borderColor: "#E6C77A",
    borderWidth: 1,
  },
  noticeTitle: { color: "#4B3B16", fontSize: 17, fontWeight: "900" },
  errorCard: { gap: 8, padding: 16, borderRadius: 8, backgroundColor: "#FBE5E1", borderColor: "#E8B6AE", borderWidth: 1 },
  errorTitle: { color: "#8E2B21", fontSize: 17, fontWeight: "900" },
  errorText: { color: "#8E2B21" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryCard: {
    flexBasis: 260,
    flexGrow: 1,
    gap: 6,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderWidth: 1,
  },
  summaryIcon: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#EAF6F4",
    color: "#0D5C75",
    fontSize: 13,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  summaryLabel: { color: "#66756E", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  summaryValue: { color: "#12332B", fontSize: 17, fontWeight: "900", textTransform: "capitalize" },
  criteriaText: { color: "#43534D", fontSize: 13, lineHeight: 18 },
  section: {
    gap: 14,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderWidth: 1,
  },
  sectionHeader: { alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  sectionTitle: { color: "#12332B", fontSize: 21, fontWeight: "900" },
  assessmentBadge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#F4F0FF",
    color: "#4B3B78",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  coursePill: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#EAF6F4",
    color: "#0D5C75",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pipeline: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pipelineStep: { alignItems: "center", flexBasis: 150, flexGrow: 1, gap: 8 },
  pipelineCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D5C75",
  },
  pipelineNumber: { color: "#FFFFFF", fontWeight: "900" },
  pipelineText: { color: "#43534D", fontSize: 13, lineHeight: 18, textAlign: "center" },
  challengeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  challengeCard: {
    flexBasis: 230,
    flexGrow: 1,
    gap: 12,
    padding: 15,
    borderRadius: 8,
    borderColor: "#DDE8E2",
    borderWidth: 1,
    backgroundColor: "#F8FBF9",
  },
  challengeTitle: { color: "#12332B", fontSize: 16, fontWeight: "900" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  frequencyBadge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#FFF4DB",
    color: "#6A4A00",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  durationBadge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#EAF6F4",
    color: "#0D5C75",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBar: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#EAF8F1",
    borderColor: "#B8D9CA",
    borderWidth: 1,
  },
  statusLabel: { color: "#225F47", fontWeight: "900" },
  activeTag: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#2F7D5C",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inactiveTag: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#6F7A75",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { color: "#225F47", fontWeight: "800" },
  monthList: { gap: 10 },
  monthCard: { borderRadius: 8, borderColor: "#DDE8E2", borderWidth: 1, overflow: "hidden" },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    backgroundColor: "#F8FBF9",
  },
  monthTitle: { color: "#12332B", flex: 1, fontSize: 16, fontWeight: "900" },
  monthToggle: { color: "#0D5C75", fontSize: 22, fontWeight: "900" },
  monthBody: { gap: 12, padding: 14, backgroundColor: "#FFFFFF" },
  openMonthButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#DCEFE8",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  openMonthButtonText: { color: "#0D5C75", fontWeight: "900" },
  bodyText: { color: "#43534D", fontSize: 14, lineHeight: 21 },
});
