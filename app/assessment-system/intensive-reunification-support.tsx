import type React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  graduatedContactStages,
  highIntensityReunificationTasks,
  intensiveReunificationPrograms,
  preReturnSafetyVerifications,
  reunificationChallengeModels,
} from "../../lib/data/intensiveReunificationSupport";
import {
  buildIntensiveReunificationPlanSummary,
  evaluateContactProgression,
} from "../../lib/engines/intensiveReunificationEngine";
import {
  evaluateQuestProgress,
  unlockAchievements,
} from "../../lib/engines/reunificationQuestAchievementEngine";

const sampleSummary = buildIntensiveReunificationPlanSummary({
  appointmentLoad: {
    weeklyAppointments: 8,
    missedAppointments: 1,
    hasSingleCoordinator: false,
    transportBarrier: true,
  },
  contactProgression: {
    currentStage: "supervised",
    stableContacts: 3,
    unresolvedIncidents: 0,
    supervisorReviewed: true,
  },
  safetyVerifications: [
    {
      id: "functional_safety_plan",
      completedChecks: ["Support network named", "Monitoring duties assigned", "Emergency contacts current"],
    },
    {
      id: "boundary_management",
      completedChecks: ["Goodbye transition observed", "Distress response observed"],
    },
  ],
  relapseWarningSignals: 1,
});

const stageGatePreview = evaluateContactProgression({
  parentProfileId: "calibration-parent",
  caseId: "calibration-case",
  currentStage: "supervised",
  requiredLessonIds: ["reflective-listening", "co-regulation"],
  contactSessions: [
    {
      id: "contact-1",
      stage: "supervised",
      occurredAt: "2026-07-01T10:00:00.000Z",
      durationMinutes: 60,
      childDistressScore: 2,
      childComfortScore: 3,
      emotionalRegulationScore: 3,
      facilitatorInterventionCount: 3,
      skillEvidence: { boundary_respect: true },
    },
    {
      id: "contact-2",
      stage: "supervised",
      occurredAt: "2026-07-08T10:00:00.000Z",
      durationMinutes: 60,
      childDistressScore: 2,
      childComfortScore: 4,
      emotionalRegulationScore: 4,
      facilitatorInterventionCount: 2,
      skillEvidence: { co_regulation: true, repair_attempts: true },
    },
    {
      id: "contact-3",
      stage: "supervised",
      occurredAt: "2026-07-15T10:00:00.000Z",
      durationMinutes: 60,
      childDistressScore: 1,
      childComfortScore: 5,
      emotionalRegulationScore: 5,
      facilitatorInterventionCount: 1,
      skillEvidence: { reflective_listening: true },
    },
  ],
  assessmentRecords: [
    {
      id: "assessment-1",
      lessonId: "reflective-listening",
      createdAt: "2026-07-10T10:00:00.000Z",
      validatedBy: "facilitator-1",
      skillEvidence: { reflective_listening: true },
    },
    {
      id: "assessment-2",
      lessonId: "co-regulation",
      createdAt: "2026-07-11T10:00:00.000Z",
      validatedBy: "facilitator-1",
      skillEvidence: { co_regulation: true },
    },
  ],
});

const questPreview = evaluateQuestProgress(
  {
    id: "quest-reflective-listening",
    code: "REFLECTIVE_LISTENING_SUPERVISED_01",
    title: "Reflective listening in supervised contact",
    requiredEvidence: {
      evidenceTypes: ["contact_log", "text"],
      lessonIds: ["reflective-listening"],
      minCount: 2,
      minScore: 4,
      requiresValidation: true,
      disallowAmberOrRedRisk: true,
    },
  },
  [
    {
      id: "evidence-1",
      lessonId: "reflective-listening",
      evidenceType: "contact_log",
      score: 4,
      validatedBy: "facilitator-1",
      evidencePayload: { reflective_listening: true },
    },
    {
      id: "evidence-2",
      lessonId: "reflective-listening",
      evidenceType: "text",
      score: 5,
      validatedBy: "facilitator-1",
      evidencePayload: { reflective_listening: true },
    },
  ],
);

const achievementPreview = unlockAchievements({
  achievements: [
    {
      id: "achievement-consistent-co-regulator",
      code: "CONSISTENT_CO_REGULATOR",
      title: "Consistent Co-Regulator",
      criteria: {
        minCompletedQuests: 1,
        completedQuestCodes: ["REFLECTIVE_LISTENING_SUPERVISED_01"],
        requiredSkillEvidence: ["reflective_listening"],
        riskFreeEvidenceWindow: 2,
      },
    },
  ],
  questDefinitions: [
    {
      id: "quest-reflective-listening",
      code: "REFLECTIVE_LISTENING_SUPERVISED_01",
      title: "Reflective listening in supervised contact",
      requiredEvidence: {},
    },
  ],
  questEvaluations: [questPreview],
  evidenceRecords: [
    {
      id: "evidence-1",
      lessonId: "reflective-listening",
      evidenceType: "contact_log",
      validatedBy: "facilitator-1",
      evidencePayload: { reflective_listening: true },
    },
    {
      id: "evidence-2",
      lessonId: "reflective-listening",
      evidenceType: "text",
      validatedBy: "facilitator-1",
      evidencePayload: { reflective_listening: true },
    },
  ],
})[0];

export default function IntensiveReunificationSupportScreen() {
  return (
    <AssessmentScreenShell
      title="Intensive Reunification Support"
      subtitle="A worker-review module for high-intensity parenting supports, mandated reunification tasks, contact progression, systemic challenge tracking, and pre-return safety verification."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metricGrid}>
          <Metric label="Program models" value={`${intensiveReunificationPrograms.length}`} />
          <Metric label="Task engines" value={`${highIntensityReunificationTasks.length}`} />
          <Metric label="Challenge models" value={`${reunificationChallengeModels.length}`} />
          <Metric label="Calibration verification" value={`${sampleSummary.verificationCompletion}%`} />
          <Metric label="Stage recommendation" value={stageGatePreview.recommendedStage.replace(/_/g, " ")} />
          <Metric label="Quest preview" value={questPreview.status} />
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Calibration preview only</Text>
          <Text style={styles.cardText}>
            The verification percentage and summary language below come from a built-in calibration payload. Use this
            screen as a planning framework until it is connected to saved case tasks, contact records, and safety
            verifications.
          </Text>
        </View>

        <Section title="Planning Summary Template">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Calibration review snapshot</Text>
            <Text style={styles.cardText}>{sampleSummary.reportLanguage}</Text>
            {sampleSummary.missingVerificationWarnings.map((warning) => (
              <Text key={warning} style={styles.warningText}>- {warning}</Text>
            ))}
          </View>
        </Section>

        <Section title="Stage-Gated Contact Progression">
          <View style={styles.card}>
            <Text style={styles.badge}>{stageGatePreview.riskLevel} risk</Text>
            <Text style={styles.cardTitle}>
              {stageGatePreview.currentStage.replace(/_/g, " ")} to {stageGatePreview.recommendedStage.replace(/_/g, " ")}
            </Text>
            <Text style={styles.cardText}>
              Can escalate: {stageGatePreview.canEscalate ? "Yes, caseworker review still required" : "No"}
            </Text>
            <Text style={styles.cardText}>
              Must regress: {stageGatePreview.mustRegress ? "Yes" : "No"}
            </Text>
            <Text style={styles.subheading}>Reasons</Text>
            {stageGatePreview.reasons.map((reason) => (
              <Text key={reason} style={styles.bullet}>- {reason}</Text>
            ))}
            <Text style={styles.subheading}>Hard blocks</Text>
            {stageGatePreview.hardBlocks.length === 0 ? (
              <Text style={styles.bullet}>- None in calibration window</Text>
            ) : (
              stageGatePreview.hardBlocks.map((block) => (
                <Text key={block} style={styles.warningText}>- {block}</Text>
              ))
            )}
          </View>
        </Section>

        <Section title="Mini-Quests and Achievements">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quest: Reflective listening in supervised contact</Text>
            <Text style={styles.cardText}>Status: {questPreview.status}</Text>
            <Text style={styles.cardText}>Matched evidence: {questPreview.matchedEvidenceIds.join(", ")}</Text>
            {questPreview.reasons.map((reason) => (
              <Text key={reason} style={styles.bullet}>- {reason}</Text>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Achievement: Consistent Co-Regulator</Text>
            <Text style={styles.cardText}>
              {achievementPreview?.unlocked
                ? "Unlocked from validated, risk-free evidence."
                : "Locked until therapeutic progress criteria are met."}
            </Text>
            {achievementPreview?.reasons.map((reason) => (
              <Text key={reason} style={styles.bullet}>- {reason}</Text>
            ))}
          </View>
        </Section>

        <Section title="Evidence-Informed Program Models">
          {intensiveReunificationPrograms.map((program) => (
            <View key={program.id} style={styles.card}>
              <Text style={styles.badge}>{program.duration}</Text>
              <Text style={styles.cardTitle}>{program.name}</Text>
              <Text style={styles.cardText}>{program.deliveryModel}</Text>
              <Text style={styles.cardText}>{program.safeStepsUse}</Text>
              <Text style={styles.subheading}>Core components</Text>
              {program.coreComponents.map((component) => (
                <Text key={component} style={styles.bullet}>- {component}</Text>
              ))}
              <Text style={styles.subheading}>Evidence prompts</Text>
              {program.evidencePrompts.map((prompt) => (
                <Text key={prompt} style={styles.bullet}>- {prompt}</Text>
              ))}
            </View>
          ))}
        </Section>

        <Section title="High-Intensity Reunification Tasks">
          {highIntensityReunificationTasks.map((task) => (
            <View key={task.id} style={styles.card}>
              <Text style={styles.cardTitle}>{task.title}</Text>
              <Text style={styles.cardText}>{task.purpose}</Text>
              <Text style={styles.subheading}>Required evidence</Text>
              {task.requiredEvidence.map((item) => (
                <Text key={item} style={styles.bullet}>- {item}</Text>
              ))}
            </View>
          ))}
        </Section>

        <Section title="Graduated Contact Progression">
          {graduatedContactStages.map((stage) => (
            <View key={stage.stage} style={styles.card}>
              <Text style={styles.badge}>{stage.stage.replace(/_/g, " ")}</Text>
              <Text style={styles.cardTitle}>{stage.title}</Text>
              {stage.minimumEvidence.map((item) => (
                <Text key={item} style={styles.bullet}>- {item}</Text>
              ))}
              <Text style={styles.cardText}>Gate: {stage.nextStageGate}</Text>
            </View>
          ))}
        </Section>

        <Section title="Challenge Models">
          {reunificationChallengeModels.map((challenge) => (
            <View key={challenge.id} style={styles.card}>
              <Text style={styles.cardTitle}>{challenge.title}</Text>
              <Text style={styles.cardText}>{challenge.riskImpact}</Text>
              <Text style={styles.subheading}>Mitigation</Text>
              {challenge.mitigationStrategies.map((strategy) => (
                <Text key={strategy} style={styles.bullet}>- {strategy}</Text>
              ))}
            </View>
          ))}
        </Section>

        <Section title="Pre-Return Safety Verification">
          {preReturnSafetyVerifications.map((verification) => (
            <View key={verification.id} style={styles.card}>
              <Text style={styles.cardTitle}>{verification.title}</Text>
              <Text style={styles.cardText}>{verification.purpose}</Text>
              {verification.requiredChecks.map((check) => (
                <Text key={check} style={styles.bullet}>- {check}</Text>
              ))}
              <Text style={styles.warningText}>{verification.missingEvidenceWarning}</Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 22,
    paddingBottom: 30,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 150,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  metricValue: {
    color: assessmentColors.tealDark,
    fontSize: 26,
    fontWeight: "900",
  },
  metricLabel: {
    color: assessmentColors.muted,
    fontWeight: "800",
  },
  section: {
    gap: 12,
  },
  notice: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B45309",
    backgroundColor: "#FFFBEB",
  },
  noticeTitle: {
    color: "#92400E",
    fontSize: 16,
    fontWeight: "900",
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 22,
    fontWeight: "900",
  },
  card: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    color: assessmentColors.charcoal,
    fontSize: 17,
    fontWeight: "900",
  },
  cardText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  subheading: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
    marginTop: 4,
  },
  bullet: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  warningText: {
    color: assessmentColors.amberText,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
  },
});
