import { ScrollView, Text, View } from "react-native";

import {
  AssessmentButton,
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  Field,
  StatusPill,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  evidenceCards,
  evidenceStatuses,
  evidenceTypes,
  linkedDomains,
  privacyLevels,
} from "../../lib/data/assessmentSystem";

function evidenceStatusTone(status: string) {
  if (status === "Accepted" || status === "Reviewed") return "success";
  if (status === "Needs Clarification") return "warning";
  if (status === "Excluded From Report" || status === "Not Relevant") return "risk";
  return "default";
}

export default function EvidenceUploadsScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <AssessmentScreenShell
        title="Evidence Uploads"
        subtitle="Attach real-life proof to a specific assessment and domain so evidence can support rubric scoring and reports."
      >
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Upload Evidence</Text>
          <Text style={assessmentStyles.metaLabel}>Evidence Type</Text>
          <ChipList items={evidenceTypes} />
          <Text style={assessmentStyles.metaLabel}>Linked Domain</Text>
          <ChipList items={linkedDomains} />
          <Field label="Evidence Description" placeholder="What does this evidence show?" multiline />
          <Field label="Date Evidence Was Created" placeholder="2 July 2026" />
          <Field label="Who uploaded it?" placeholder="Parent, support worker, caseworker, or supervisor" />
          <Text style={assessmentStyles.metaLabel}>Privacy Level</Text>
          <ChipList items={privacyLevels} />
          <AssessmentButton label="Upload Evidence" />
        </AssessmentCard>

        {evidenceCards.map((item) => (
          <AssessmentCard key={item.title}>
            <View style={assessmentStyles.row}>
              <View style={[assessmentStyles.splitItem, { flexBasis: 250 }]}>
                <Text style={assessmentStyles.cardTitle}>{item.title}</Text>
                <Text style={assessmentStyles.cardText}>Uploaded: {item.uploaded}</Text>
                <Text style={assessmentStyles.cardText}>Linked to: {item.linkedTo}</Text>
                <Text style={assessmentStyles.cardText}>Used in: {item.usedIn}</Text>
              </View>
              <StatusPill label={item.status} tone={evidenceStatusTone(item.status)} />
            </View>
            <Text style={assessmentStyles.metaLabel}>Description</Text>
            <Text style={assessmentStyles.cardText}>{item.description}</Text>
            <View style={assessmentStyles.buttonRow}>
              <AssessmentButton label="View" tone="secondary" />
              <AssessmentButton label="Link to Rubric" href="/assessment-system/rubric-scoring" tone="secondary" />
              <AssessmentButton label="Add to Report" href="/assessment-system/report-output" tone="secondary" />
            </View>
          </AssessmentCard>
        ))}

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Evidence Status Options</Text>
          <ChipList items={evidenceStatuses} />
        </AssessmentCard>
      </AssessmentScreenShell>
    </ScrollView>
  );
}
