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
  rubricDomains,
  rubricScale,
  suggestedDomains,
} from "../../lib/data/assessmentSystem";

export default function RubricScoringScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <AssessmentScreenShell
        title="Rubric Scoring"
        subtitle="Score each domain using a 0-4 scale with reasons, strengths, concerns, evidence, and next actions."
      >
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>0-4 Scoring Scale</Text>
          {rubricScale.map((item) => (
            <View key={item.score} style={assessmentStyles.row}>
              <StatusPill label={`Score ${item.score}`} tone={item.score <= 1 ? "risk" : item.score === 2 ? "warning" : "success"} />
              <Text style={[assessmentStyles.cardText, { flex: 1 }]}>{item.description}</Text>
            </View>
          ))}
        </AssessmentCard>

        {rubricDomains.map((domain) => (
          <AssessmentCard key={domain.domain}>
            <View style={assessmentStyles.row}>
              <View style={[assessmentStyles.splitItem, { flexBasis: 250 }]}>
                <Text style={assessmentStyles.cardTitle}>{domain.domain}</Text>
                <Text style={assessmentStyles.metaLabel}>Current Score</Text>
                <Text style={assessmentStyles.metaValue}>{domain.score} / 4</Text>
              </View>
              <StatusPill
                label={domain.score >= 3 ? "Good progress" : "Requires Review"}
                tone={domain.score >= 3 ? "success" : "warning"}
              />
            </View>

            <Text style={assessmentStyles.metaLabel}>Strengths</Text>
            <Text style={assessmentStyles.cardText}>{domain.strengths}</Text>

            <Text style={assessmentStyles.metaLabel}>Concerns</Text>
            <Text style={assessmentStyles.cardText}>{domain.concerns}</Text>

            <Text style={assessmentStyles.metaLabel}>Linked Evidence</Text>
            <ChipList items={domain.evidence} />

            <Text style={assessmentStyles.metaLabel}>Next Action</Text>
            <Text style={assessmentStyles.cardText}>{domain.nextAction}</Text>

            <Text style={assessmentStyles.metaLabel}>Reviewer Notes</Text>
            <Text style={assessmentStyles.cardText}>{domain.reviewerNotes}</Text>

            <View style={assessmentStyles.buttonRow}>
              <AssessmentButton label="Change Score" tone="secondary" />
              <AssessmentButton label="Add Evidence" href="/assessment-system/evidence-uploads" tone="secondary" />
              <AssessmentButton label="Add Notes" tone="secondary" />
            </View>
          </AssessmentCard>
        ))}

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Suggested Domains</Text>
          <ChipList items={suggestedDomains} />
        </AssessmentCard>
      </AssessmentScreenShell>
    </ScrollView>
  );
}

