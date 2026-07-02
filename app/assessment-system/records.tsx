import { ScrollView, Text, View } from "react-native";

import {
  AssessmentButton,
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  ProgressBar,
  StatusPill,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import { assessmentRecords } from "../../lib/data/assessmentSystem";

const filters = ["All", "Draft", "Complete", "Due Soon", "Requires Evidence"];

function statusTone(status: string) {
  if (status === "Complete") return "success";
  if (status === "Requires Evidence") return "warning";
  return "default";
}

function riskTone(risk: string) {
  if (risk === "High") return "risk";
  if (risk === "Medium") return "warning";
  return "success";
}

export default function AssessmentRecordsScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <AssessmentScreenShell
        title="Assessment Records"
        subtitle="Completed and active assessments connected to the current case."
      >
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Filter</Text>
          <ChipList items={filters} />
        </AssessmentCard>

        {assessmentRecords.map((record) => (
          <AssessmentCard key={record.name}>
            <View style={assessmentStyles.row}>
              <View style={[assessmentStyles.splitItem, { flexBasis: 260 }]}>
                <Text style={assessmentStyles.cardTitle}>{record.name}</Text>
                <Text style={assessmentStyles.cardText}>Type: {record.type}</Text>
                <Text style={assessmentStyles.cardText}>Date Started: {record.dateStarted}</Text>
                <Text style={assessmentStyles.cardText}>Date Completed: {record.dateCompleted}</Text>
              </View>
              <View style={assessmentStyles.splitItem}>
                <StatusPill label={record.status} tone={statusTone(record.status)} />
                <StatusPill label={`Risk: ${record.riskLevel}`} tone={riskTone(record.riskLevel)} />
                <Text style={assessmentStyles.cardText}>Due: {record.due}</Text>
              </View>
            </View>

            <ProgressBar value={record.completion} />
            <Text style={assessmentStyles.cardText}>Completion: {record.completion}%</Text>

            <View style={assessmentStyles.row}>
              <Text style={assessmentStyles.cardText}>Overall score: {record.overallScore}</Text>
              <Text style={assessmentStyles.cardText}>Linked evidence: {record.evidenceCount}</Text>
              <Text style={assessmentStyles.cardText}>Worker notes: {record.notesCount}</Text>
              <Text style={assessmentStyles.cardText}>Child voice included: {record.childVoiceIncluded}</Text>
              <Text style={assessmentStyles.cardText}>Report generated: {record.reportGenerated}</Text>
            </View>

            <Text style={assessmentStyles.metaLabel}>Domains included</Text>
            <ChipList items={record.domains} />

            <View style={assessmentStyles.buttonRow}>
              <AssessmentButton label="Continue Assessment" href="/assessment-system/rubric-scoring" />
              <AssessmentButton label="View Linked Evidence" href="/assessment-system/evidence-uploads" tone="secondary" />
              <AssessmentButton label="Generate Draft Report" href="/assessment-system/report-output" tone="secondary" />
            </View>
          </AssessmentCard>
        ))}
      </AssessmentScreenShell>
    </ScrollView>
  );
}
