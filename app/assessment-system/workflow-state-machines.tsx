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
  automaticAssessmentSubmittedWorkflow,
  databaseWorkflowConstraints,
  evidenceQualityDimensions,
  recommendedNextMigrationScope,
  rolePermissionSets,
  workflowEventCatalogue,
  workflowStateMachines,
} from "../../lib/engines/assessmentWorkflowStateMachines";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function WorkflowStateMachinesScreen() {
  return (
    <AssessmentScreenShell
      title="Assessment Workflow & State Machines"
      subtitle="Controlled workflows define how assessments, responses, evidence, reviews, claims, competencies, contradictions, disagreements, and reports move safely through SafeSteps."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>State Machines</Text>
          <Text style={assessmentStyles.cardText}>
            Workflow states prevent inconsistent records, such as completing an assessment before
            required answers are submitted or using evidence before review.
          </Text>
          <View style={styles.machineGrid}>
            {workflowStateMachines.map((machine) => (
              <View key={machine.id} style={styles.machineCard}>
                <View style={styles.headerRow}>
                  <Text style={styles.machineTitle}>{machine.label}</Text>
                  <StatusPill label={`${machine.states.length} states`} />
                </View>
                <ChipList items={machine.states.map(formatLabel)} />
                <Text style={assessmentStyles.metaLabel}>Safeguards</Text>
                {machine.safeguards.slice(0, 2).map((item) => (
                  <Text key={item} style={assessmentStyles.cardText}>{item}</Text>
                ))}
              </View>
            ))}
          </View>
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Evidence Quality Review</Text>
            <Text style={assessmentStyles.cardText}>
              Evidence quality dimensions stay separate rather than disappearing into one opaque score.
            </Text>
            {evidenceQualityDimensions.map((dimension) => (
              <View key={dimension.key} style={styles.row}>
                <Text style={assessmentStyles.metaValue}>{formatLabel(dimension.key)}</Text>
                <Text style={assessmentStyles.cardText}>{dimension.scale}</Text>
              </View>
            ))}
          </AssessmentCard>

          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Role Permissions</Text>
            {rolePermissionSets.map((role) => (
              <View key={role.role} style={styles.roleBlock}>
                <Text style={styles.machineTitle}>{formatLabel(role.role)}</Text>
                <Text style={assessmentStyles.metaLabel}>Can</Text>
                <ChipList items={role.can.slice(0, 4)} />
                <Text style={assessmentStyles.metaLabel}>Cannot</Text>
                <ChipList items={role.cannot.slice(0, 3)} />
              </View>
            ))}
          </AssessmentCard>
        </View>

        <AssessmentCard tone="warning">
          <Text style={assessmentStyles.cardTitle}>Automatic Workflow: Assessment Submitted</Text>
          <View style={styles.stepGrid}>
            {automaticAssessmentSubmittedWorkflow.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <Text style={styles.index}>{index + 1}</Text>
                <Text style={assessmentStyles.cardText}>{step}</Text>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Event Catalogue</Text>
          <Text style={assessmentStyles.cardText}>
            Every important action publishes a consistent event envelope with event ID, type,
            version, actor, entity, correlation, causation, source, and metadata.
          </Text>
          <View style={styles.eventGrid}>
            {workflowEventCatalogue.map((group) => (
              <View key={group.category} style={styles.eventCard}>
                <Text style={styles.machineTitle}>{formatLabel(group.category)}</Text>
                <ChipList items={group.events.map(formatLabel)} />
              </View>
            ))}
          </View>
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard tone="risk">
            <Text style={assessmentStyles.cardTitle}>Database Constraints</Text>
            {databaseWorkflowConstraints.map((constraint) => (
              <Text key={constraint} style={assessmentStyles.cardText}>{constraint}</Text>
            ))}
          </AssessmentCard>

          <AssessmentCard tone="success">
            <Text style={assessmentStyles.cardTitle}>Next Migration Scope</Text>
            <Text style={assessmentStyles.cardText}>
              The next build artifact should be a production Supabase migration with enums,
              workflow tables, outbox events, audit records, indexes, constraints, and RLS foundations.
            </Text>
            <ChipList items={recommendedNextMigrationScope} />
          </AssessmentCard>
        </View>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  machineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  machineCard: {
    flexGrow: 1,
    flexBasis: 280,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  machineTitle: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  row: {
    gap: 3,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: assessmentColors.border,
  },
  roleBlock: {
    gap: 7,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: assessmentColors.border,
  },
  stepGrid: {
    gap: 7,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  index: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 12,
    fontWeight: "900",
  },
  eventGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  eventCard: {
    flexGrow: 1,
    flexBasis: 260,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
});
