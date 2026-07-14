import type React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  australianFamilySupportNetworks,
  capacityAssessmentDomains,
  capacityReportingFields,
  childDevelopmentCapacityScenarios,
  contactObservationGuide,
  parentPreparationGuideSections,
} from "../../lib/data/childDevelopmentCapacityAssessment";
import {
  buildEvidenceBasedCaseNote,
  summarizeCapacityAssessment,
} from "../../lib/engines/childDevelopmentCapacityEngine";

const sampleSummary = summarizeCapacityAssessment([
  {
    scenarioId: "CAP-01-INFANT-COLIC",
    responseLevel: 3,
    rawParentQuote: "I would put the baby safely in the cot, step away, breathe, and call for support.",
  },
  {
    scenarioId: "CAP-02-TODDLER-MELTDOWN",
    responseLevel: 2,
    rawParentQuote: "I would stay calm, but I might give them the sweets if everyone was staring.",
  },
  {
    scenarioId: "CAP-09-ONLINE-GROOMING",
    responseLevel: 3,
    rawParentQuote: "I would stop the contact, reassure my child, report the account, and supervise gaming.",
  },
]);

const sampleCaseNote = buildEvidenceBasedCaseNote({
  scenario: childDevelopmentCapacityScenarios[0],
  response: {
    scenarioId: "CAP-01-INFANT-COLIC",
    responseLevel: 3,
    rawParentQuote: "I would put the baby safely in the cot, step away, breathe, and call for support.",
    workerNotes: "Response named safe sleep, emotional regulation, and help-seeking.",
  },
});

export default function ChildDevelopmentCapacityAssessmentScreen() {
  return (
    <AssessmentScreenShell
      title="Child Development & Protective Capacity"
      subtitle="Scenario-based assessment for child development awareness, risk recognition, parent regulation, and protective action. Outputs support worker review and should be checked against observation, evidence, and professional judgement."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroGrid}>
          <Metric label="Scenario library" value={`${childDevelopmentCapacityScenarios.length}`} />
          <Metric label="Risk domains" value={`${capacityAssessmentDomains.length}`} />
          <Metric label="Observation weeks" value={`${contactObservationGuide.length}`} />
          <Metric label="Sample score" value={`${sampleSummary.scorePercentage}%`} />
        </View>

        <Section title="Assessment Domains">
          {capacityAssessmentDomains.map((domain) => (
            <View key={domain.id} style={styles.card}>
              <Text style={styles.cardTitle}>{domain.title}</Text>
              <Text style={styles.cardText}>{domain.assessorFocus}</Text>
            </View>
          ))}
        </Section>

        <Section title="Scenario Bank">
          {childDevelopmentCapacityScenarios.map((scenario) => (
            <View key={scenario.id} style={styles.card}>
              <Text style={styles.badge}>{scenario.ageBand.replace(/_/g, " ")}</Text>
              <Text style={styles.cardTitle}>{scenario.title}</Text>
              <Text style={styles.cardText}>{scenario.scenario}</Text>
              <Text style={styles.subheading}>Critical safety markers</Text>
              {scenario.criticalSafetyMarkers.map((marker) => (
                <Text key={marker} style={styles.bullet}>- {marker}</Text>
              ))}
              <Text style={styles.subheading}>Development learning focus</Text>
              <Text style={styles.cardText}>{scenario.developmentalLearningFocus.join(", ")}</Text>
            </View>
          ))}
        </Section>

        <Section title="Scoring Preview">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Worker review summary</Text>
            <Text style={styles.cardText}>{sampleSummary.reportLanguage}</Text>
            {sampleSummary.domainSummaries.map((domain) => (
              <Text key={domain.domain} style={styles.bullet}>
                - {domain.domain.replace(/_/g, " ")}: {domain.scorePercentage}% across {domain.tested} tested scenario(s)
              </Text>
            ))}
            <Text style={styles.subheading}>Evidence-based case note example</Text>
            <Text style={styles.cardText}>{sampleCaseNote}</Text>
          </View>
        </Section>

        <Section title="4-Week Supervised Contact Observation Guide">
          {contactObservationGuide.map((week) => (
            <View key={week.week} style={styles.card}>
              <Text style={styles.badge}>Week {week.week}</Text>
              <Text style={styles.cardTitle}>{week.focus}</Text>
              <Text style={styles.cardText}>{week.goal}</Text>
              {week.observableBehaviors.map((behavior) => (
                <Text key={behavior} style={styles.bullet}>- {behavior}</Text>
              ))}
              <Text style={styles.cardText}>Protective example: {week.protectiveExample}</Text>
            </View>
          ))}
        </Section>

        <Section title="Parent Preparation Guide">
          {parentPreparationGuideSections.map((section) => (
            <View key={section.title} style={styles.card}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardText}>{section.body}</Text>
            </View>
          ))}
        </Section>

        <Section title="Australian Support Networks">
          {australianFamilySupportNetworks.map((network) => (
            <View key={network.name} style={styles.row}>
              <Text style={styles.rowTitle}>{network.name}</Text>
              <Text style={styles.rowValue}>{network.contact}</Text>
              <Text style={styles.cardText}>{network.useWhen}</Text>
            </View>
          ))}
        </Section>

        <Section title="Reporting Fields">
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Use these fields when exporting to a case management system or report-ready assessment record.
            </Text>
            <Text style={styles.mono}>{capacityReportingFields.join(", ")}</Text>
          </View>
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
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 150,
    padding: 16,
    borderRadius: 12,
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
    borderRadius: 12,
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
    borderRadius: 999,
    overflow: "hidden",
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  row: {
    gap: 4,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  rowTitle: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  rowValue: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  mono: {
    color: assessmentColors.charcoal,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
});
