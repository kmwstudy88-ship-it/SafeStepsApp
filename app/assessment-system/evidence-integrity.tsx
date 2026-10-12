import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  StatusPill,
  assessmentColors,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  authenticityDimensions,
  coreIntegrityRules,
  integrityAlertTypes,
  integrityPrinciples,
  integrityWorkflow,
  recommendedIntegrityBuildOrder,
  storageBuckets,
} from "../../lib/engines/evidenceIntegrityFramework";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function EvidenceIntegrityScreen() {
  return (
    <AssessmentScreenShell
      title="Evidence Integrity & Chain of Custody"
      subtitle="Determines whether SafeSteps evidence can be trusted, traced, reviewed, corrected, and exported without losing history."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Integrity Workflow</Text>
          <Text style={assessmentStyles.cardText}>
            Original evidence remains separate from interpretation. Interpretations may change;
            original evidence must remain preserved and verifiable.
          </Text>
          <ChipList items={integrityWorkflow.map(formatLabel)} />
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Storage Buckets</Text>
            <Text style={assessmentStyles.cardText}>
              Storage paths should use organisation, case, person, evidence, role, and file IDs,
              never family names or sensitive descriptions.
            </Text>
            <ChipList items={storageBuckets} />
          </AssessmentCard>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Authenticity Dimensions</Text>
            <ChipList items={authenticityDimensions} />
          </AssessmentCard>
        </View>

        <AssessmentCard tone="warning">
          <Text style={assessmentStyles.cardTitle}>Integrity Principles</Text>
          {integrityPrinciples.map((principle) => (
            <Text key={principle} style={assessmentStyles.cardText}>{principle}</Text>
          ))}
        </AssessmentCard>

        <AssessmentCard tone="risk">
          <View style={styles.headerRow}>
            <Text style={assessmentStyles.cardTitle}>Integrity Alerts</Text>
            <StatusPill label={`${integrityAlertTypes.length} alert types`} tone="risk" />
          </View>
          <ChipList items={integrityAlertTypes} />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Recommended Build Order</Text>
          <View style={styles.phaseGrid}>
            {recommendedIntegrityBuildOrder.map((phase, index) => (
              <View key={phase.phase} style={styles.phaseCard}>
                <StatusPill label={`Phase ${index + 1}`} />
                <Text style={assessmentStyles.metaValue}>{phase.phase}</Text>
                <ChipList items={phase.builds} />
              </View>
            ))}
          </View>
        </AssessmentCard>

        <AssessmentCard tone="success">
          <Text style={assessmentStyles.cardTitle}>Core Integrity Rules</Text>
          {coreIntegrityRules.map((rule) => (
            <Text key={rule} style={assessmentStyles.cardText}>{rule}</Text>
          ))}
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  phaseGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  phaseCard: {
    flexGrow: 1,
    flexBasis: 250,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
});
