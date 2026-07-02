import { ScrollView, Text, View } from "react-native";

import {
  AssessmentButton,
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  StatusPill,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  activeCase,
  reportSections,
  reportTypes,
} from "../../lib/data/assessmentSystem";

export default function ReportOutputScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <AssessmentScreenShell
        title="Report Output"
        subtitle="Build a structured assessment report for workers, court, programs, and parent records."
      >
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Report Type</Text>
          <ChipList items={reportTypes} />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Report Sections</Text>
          {reportSections.map((section, index) => (
            <Text key={section} style={assessmentStyles.cardText}>
              {index + 1}. {section}
            </Text>
          ))}
        </AssessmentCard>

        <AssessmentCard>
          <View style={assessmentStyles.row}>
            <View style={[assessmentStyles.splitItem, { flexBasis: 260 }]}>
              <Text style={assessmentStyles.cardTitle}>Assessment Report Draft</Text>
              <Text style={assessmentStyles.cardText}>Case: {activeCase.caseName}</Text>
              <Text style={assessmentStyles.cardText}>Assessment: {activeCase.assessment}</Text>
              <Text style={assessmentStyles.cardText}>Program: {activeCase.program}</Text>
            </View>
            <View style={assessmentStyles.splitItem}>
              <StatusPill label="Draft" tone="warning" />
              <Text style={assessmentStyles.cardText}>
                Overall Progress: {activeCase.overallProgress}
              </Text>
              <Text style={assessmentStyles.cardText}>Evidence Items Included: 14</Text>
              <Text style={assessmentStyles.cardText}>Child Voice Included: Yes</Text>
            </View>
          </View>
          <View style={assessmentStyles.buttonRow}>
            <AssessmentButton label="Preview Report" tone="secondary" />
            <AssessmentButton label="Export PDF" tone="secondary" />
            <AssessmentButton label="Send to Worker" />
            <AssessmentButton label="Save Draft" tone="secondary" />
          </View>
        </AssessmentCard>
      </AssessmentScreenShell>
    </ScrollView>
  );
}
