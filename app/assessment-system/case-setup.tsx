import { ScrollView, Text } from "react-native";

import {
  AssessmentButton,
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  Field,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  assignedPeople,
  assessmentTypes,
  caseGoals,
  programStreams,
} from "../../lib/data/assessmentSystem";

export default function CaseSetupScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <AssessmentScreenShell
        title="Case Setup"
        subtitle="Create the foundation for the family assessment record."
      >
        <AssessmentCard tone="warning">
          <Text style={assessmentStyles.cardTitle}>Recording standard</Text>
          <Text style={assessmentStyles.cardText}>
            Assessment records should be factual, respectful, and evidence-based. Do not include
            assumptions, blame, or unsupported claims.
          </Text>
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Family Case</Text>
          <Field label="Case Name" placeholder="Katrina Watts Family Case" />
          <Field label="Parent / Carer Name" placeholder="Parent or carer full name" />
          <Field label="Child / Children Names" placeholder="Names or initials approved for records" />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Program Stream</Text>
          <ChipList items={programStreams} />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Assessment Type</Text>
          <ChipList items={assessmentTypes} />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Case Goals</Text>
          <ChipList items={caseGoals} />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Important Dates</Text>
          <Field label="Case start date" placeholder="2 July 2026" />
          <Field label="Assessment date" placeholder="2 July 2026" />
          <Field label="Review due date" placeholder="23 July 2026" />
          <Field label="Court date, if applicable" placeholder="Optional" />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Assigned People</Text>
          <ChipList items={assignedPeople} />
          <Field label="Worker notes" placeholder="Assigned contacts, role details, or handover notes" multiline />
        </AssessmentCard>

        <AssessmentButton label="Save Case Setup" tone="success" />
      </AssessmentScreenShell>
    </ScrollView>
  );
}
