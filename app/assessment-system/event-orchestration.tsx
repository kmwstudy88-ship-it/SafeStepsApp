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
  assessmentSubmissionWorkflow,
  coreOrchestrationRules,
  eventCategories,
  orchestrationDomainEvents,
  recommendedOrchestrationMigrations,
} from "../../lib/engines/eventSourcingWorkflowOrchestration";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function EventOrchestrationScreen() {
  return (
    <AssessmentScreenShell
      title="Event Sourcing & Workflow Orchestration"
      subtitle="Coordinates assessment submission, evidence processing, reviews, competency recalculation, notifications, appeals, reports, retries, and recovery through traceable workflows."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Event Categories</Text>
          <View style={styles.grid}>
            {eventCategories.map((item) => (
              <View key={item.category} style={styles.cardlet}>
                <StatusPill label={formatLabel(item.category)} />
                <Text style={assessmentStyles.cardText}>{item.purpose}</Text>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <AssessmentCard tone="warning">
          <Text style={assessmentStyles.cardTitle}>Assessment Submission Workflow</Text>
          <Text style={assessmentStyles.cardText}>
            Business record changes and outbox event creation happen in the same transaction; scoring,
            review, evidence generation, competency recalculation, and notifications happen afterward.
          </Text>
          <ChipList items={assessmentSubmissionWorkflow.map(formatLabel)} />
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Domain Events</Text>
            <ChipList items={orchestrationDomainEvents.map(formatLabel)} />
          </AssessmentCard>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Migration Sequence</Text>
            <ChipList items={recommendedOrchestrationMigrations} />
          </AssessmentCard>
        </View>

        <AssessmentCard tone="success">
          <Text style={assessmentStyles.cardTitle}>Core Workflow Rules</Text>
          {coreOrchestrationRules.map((rule) => (
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
  cardlet: {
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
