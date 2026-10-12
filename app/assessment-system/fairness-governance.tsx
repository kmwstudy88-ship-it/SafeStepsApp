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
  adjustmentCategories,
  appealLevels,
  biasCategories,
  coreFairnessRules,
  fairnessDomains,
  fairnessWorkflow,
  prohibitedAiFinalisations,
} from "../../lib/engines/fairnessGovernanceFramework";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function FairnessGovernanceScreen() {
  return (
    <AssessmentScreenShell
      title="Fairness, Bias & Assessor Governance"
      subtitle="Controls how evidence is interpreted, who may interpret it, and how unfair or inconsistent decisions are detected and corrected."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Fairness Workflow</Text>
          <Text style={assessmentStyles.cardText}>
            Fairness operates throughout the workflow, from evidence collection through appeal and reassessment.
          </Text>
          <ChipList items={fairnessWorkflow} />
        </AssessmentCard>

        <View style={styles.grid}>
          {fairnessDomains.map((domain) => (
            <AssessmentCard key={domain.id}>
              <Text style={assessmentStyles.metaLabel}>{formatLabel(domain.id)}</Text>
              <Text style={assessmentStyles.cardText}>{domain.question}</Text>
            </AssessmentCard>
          ))}
        </View>

        <AssessmentCard tone="warning">
          <Text style={assessmentStyles.cardTitle}>Fair Treatment Is Not Always Identical Treatment</Text>
          <Text style={assessmentStyles.cardText}>
            The competency standard can remain the same while the demonstration method changes.
            Adjustments create meaningful opportunity to participate without lowering the standard.
          </Text>
          <ChipList items={adjustmentCategories} />
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Bias Categories</Text>
            <ChipList items={biasCategories} />
          </AssessmentCard>
          <AssessmentCard tone="risk">
            <Text style={assessmentStyles.cardTitle}>AI Must Not Finalise</Text>
            <Text style={assessmentStyles.cardText}>
              AI assistance remains identifiable, reviewable, and unable to independently finalise high-impact outcomes.
            </Text>
            <ChipList items={prohibitedAiFinalisations} />
          </AssessmentCard>
        </View>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Appeal Levels</Text>
          <View style={styles.levelGrid}>
            {appealLevels.map((appeal) => (
              <View key={appeal.level} style={styles.levelCard}>
                <StatusPill label={`Level ${appeal.level}`} />
                <Text style={assessmentStyles.metaValue}>{appeal.name}</Text>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <AssessmentCard tone="success">
          <Text style={assessmentStyles.cardTitle}>Core Fairness Rules</Text>
          {coreFairnessRules.map((rule) => (
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
  levelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  levelCard: {
    flexGrow: 1,
    flexBasis: 220,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
});
