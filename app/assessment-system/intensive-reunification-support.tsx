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
import { buildIntensiveReunificationPlanSummary } from "../../lib/engines/intensiveReunificationEngine";

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
          <Metric label="Verification" value={`${sampleSummary.verificationCompletion}%`} />
        </View>

        <Section title="Planning Summary">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current review snapshot</Text>
            <Text style={styles.cardText}>{sampleSummary.reportLanguage}</Text>
            {sampleSummary.missingVerificationWarnings.map((warning) => (
              <Text key={warning} style={styles.warningText}>- {warning}</Text>
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
