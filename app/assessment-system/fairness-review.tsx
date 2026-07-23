import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";

const fairnessPrinciples = [
  "Disagreement is not lack of insight.",
  "Poverty is not neglect.",
  "Disability is not incapacity.",
  "Historical risk is not automatically current risk.",
  "Missing information is not negative evidence.",
  "Serious conclusions require reliable, corroborated evidence.",
  "Intervention must be the least restrictive response capable of protecting the child.",
];

const evidenceLevels = [
  ["A", "Verified", "Original document, recording, direct observation, or reliable independent record."],
  ["B", "Corroborated", "Supported by two or more sufficiently independent sources."],
  ["C", "Unverified", "Single account that has not been independently confirmed."],
  ["D", "Opinion", "Professional interpretation rather than an observed fact."],
  ["E", "Disputed", "Conflicting accounts or contradictory evidence."],
  ["F", "Incorrect/outdated", "Demonstrably wrong, superseded, or no longer current."],
] as const;

const reviewTriggers = [
  "Removal, reduced contact, or delayed reunification is proposed.",
  "A material fact is disputed.",
  "Evidence is mostly hearsay or professional opinion.",
  "Subjective labels are used instead of behaviour-specific findings.",
  "Positive evidence is excluded or not weighed.",
  "Cultural, disability, family-violence, poverty, or service-access factors materially affect the assessment.",
  "The same historical allegation remains active without current evidence.",
  "The recommendation changes substantially without new evidence.",
];

const decisionPackageItems = [
  "Concern and proposed decision.",
  "Evidence supporting and contradicting the concern.",
  "Parent response and protected disagreement status.",
  "Child account and preferences where safe.",
  "Context, controllability, constrained-choice, and service-access assessment.",
  "Cultural, disability, hardship, and family-violence considerations.",
  "Protective factors and progress.",
  "Less restrictive alternatives considered.",
  "AI involvement, source references, confidence warnings, and human reviewer.",
  "Reviewer approval, final reasons, corrections, appeals, and review outcomes.",
];

export default function AssessmentFairnessReviewScreen() {
  return (
    <AssessmentScreenShell
      title="Fairness & Reviewability"
      subtitle="Decision-support safeguards for evidence reliability, procedural fairness, proportionality, worker/service accountability, and authorised review."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={styles.cardTitle}>Non-negotiable principles</Text>
          {fairnessPrinciples.map((item) => (
            <Text key={item} style={styles.bullet}>• {item}</Text>
          ))}
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.cardTitle}>Evidence reliability</Text>
          {evidenceLevels.map(([level, label, description]) => (
            <View key={level} style={styles.evidenceRow}>
              <Text style={styles.level}>{level}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{label}</Text>
                <Text style={styles.rowText}>{description}</Text>
              </View>
            </View>
          ))}
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.cardTitle}>Facts before findings</Text>
          <Text style={styles.bodyText}>
            Record the event, source, observations, parent and child accounts, supporting and contrary evidence,
            context, control, service access, and alternative explanations before making a finding.
          </Text>
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.cardTitle}>Independent review triggers</Text>
          {reviewTriggers.map((item) => (
            <Text key={item} style={styles.bullet}>• {item}</Text>
          ))}
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.cardTitle}>Complete decision package</Text>
          {decisionPackageItems.map((item) => (
            <Text key={item} style={styles.bullet}>• {item}</Text>
          ))}
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.cardTitle}>Access rule</Text>
          <Text style={styles.bodyText}>
            Records remain accessible to appropriately authorised people for transparent review, while child safety,
            family privacy, legal restrictions, and confidential third-party information remain protected. Corrections
            must preserve restricted audit history and must not keep influencing current scores once superseded.
          </Text>
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  cardTitle: {
    color: assessmentColors.charcoal,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  bodyText: {
    color: assessmentColors.charcoal,
    fontSize: 14,
    lineHeight: 21,
  },
  bullet: {
    color: assessmentColors.charcoal,
    fontSize: 14,
    lineHeight: 22,
  },
  evidenceRow: {
    borderColor: assessmentColors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    padding: 12,
  },
  level: {
    backgroundColor: assessmentColors.sage,
    borderRadius: 999,
    color: assessmentColors.tealDark,
    fontWeight: "900",
    height: 34,
    lineHeight: 34,
    overflow: "hidden",
    textAlign: "center",
    width: 34,
  },
  rowTitle: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  rowText: {
    color: assessmentColors.muted,
    lineHeight: 20,
    marginTop: 3,
  },
});
