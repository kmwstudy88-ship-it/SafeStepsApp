import { ScrollView, Text, View } from "react-native";

import {
  AssessmentButton,
  AssessmentCard,
  AssessmentScreenShell,
  StatusPill,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  activeCase,
  assessmentRoutes,
  progressItems,
  recentAssessments,
} from "../../lib/data/assessmentSystem";

export default function AssessmentSystemHome() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <AssessmentScreenShell
        title="Assessment System"
        subtitle="A structured way to document safety, progress, evidence, and family change over time."
      >
        <AssessmentCard>
          <View style={assessmentStyles.row}>
            <View style={[assessmentStyles.splitItem, { flexBasis: 260 }]}>
              <Text style={assessmentStyles.cardTitle}>{activeCase.caseName}</Text>
              <Text style={assessmentStyles.cardText}>Program: {activeCase.program}</Text>
              <Text style={assessmentStyles.cardText}>Current Phase: {activeCase.phase}</Text>
            </View>
            <View style={assessmentStyles.splitItem}>
              <StatusPill label={`Risk Level: ${activeCase.riskLevel}`} tone="risk" />
              <Text style={assessmentStyles.cardText}>
                Next Review Due: {activeCase.nextReviewDue}
              </Text>
            </View>
          </View>
          <View style={assessmentStyles.buttonRow}>
            <AssessmentButton label="Start New Assessment" href="/assessment-system/case-setup" />
            <AssessmentButton
              label="Continue Current Assessment"
              href="/assessment-system/rubric-scoring"
              tone="secondary"
            />
            <AssessmentButton label="View Reports" href="/assessment-system/report-output" tone="secondary" />
          </View>
        </AssessmentCard>

        <Text style={assessmentStyles.sectionTitle}>Assessment Progress</Text>
        <AssessmentCard>
          {progressItems.map((item) => (
            <View key={item.label} style={assessmentStyles.row}>
              <Text style={[assessmentStyles.cardText, { flex: 1 }]}>{item.label}</Text>
              <Text style={assessmentStyles.metaValue}>{item.value}</Text>
            </View>
          ))}
        </AssessmentCard>

        <Text style={assessmentStyles.sectionTitle}>Recent Assessments</Text>
        <AssessmentCard>
          {recentAssessments.map((assessment) => (
            <Text key={assessment} style={assessmentStyles.cardText}>
              - {assessment}
            </Text>
          ))}
        </AssessmentCard>

        {assessmentRoutes.map((route) => (
          <AssessmentCard key={route.href}>
            <Text style={assessmentStyles.cardTitle}>{route.title}</Text>
            <Text style={assessmentStyles.cardText}>{route.description}</Text>
            <AssessmentButton label={route.title} href={route.href} tone="secondary" />
          </AssessmentCard>
        ))}
      </AssessmentScreenShell>
    </ScrollView>
  );
}
