import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  StatusPill,
  assessmentColors,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  buildParentingProgramRecommendations,
  buildProgramRecommendationReferralDrafts,
  parentNeedCategories,
} from "../../lib/engines/programServiceRecommendationEngine";

export default function ProgramServiceRecommendationsScreen() {
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>(["tantrums", "child_cues", "sleep"]);
  const recommendations = useMemo(
    () => buildParentingProgramRecommendations({ selectedSignalIds, maxPrograms: 8 }),
    [selectedSignalIds],
  );
  const referralDrafts = useMemo(() => buildProgramRecommendationReferralDrafts(recommendations), [recommendations]);

  function toggleSignal(signalId: string) {
    setSelectedSignalIds((current) =>
      current.includes(signalId) ? current.filter((id) => id !== signalId) : [...current, signalId],
    );
  }

  return (
    <AssessmentScreenShell
      title="Program and Service Recommendations"
      subtitle="Select parent-reported needs to generate reviewable parenting program and service recommendations. These are support-planning prompts, not automatic decisions."
    >
      <View style={styles.layout}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Parent need signals</Text>
          <Text style={assessmentStyles.cardText}>
            Capture reported concerns and goals from intake, assessment, or review conversations.
          </Text>
          {parentNeedCategories.map((category) => (
            <View key={category.id} style={styles.categoryBlock}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <StatusPill
                  label={recommendations.parentNeeds.includes(category.id) ? "Matched" : "No signal"}
                  tone={recommendations.parentNeeds.includes(category.id) ? "success" : "default"}
                />
              </View>
              <Text style={assessmentStyles.cardText}>{category.summary}</Text>
              <View style={styles.signalRow}>
                {category.signals.map((signal) => {
                  const isSelected = selectedSignalIds.includes(signal.id);
                  return (
                    <Pressable
                      key={signal.id}
                      onPress={() => toggleSignal(signal.id)}
                      style={[styles.signalButton, isSelected && styles.signalButtonSelected]}
                    >
                      <Text style={[styles.signalText, isSelected && styles.signalTextSelected]}>{signal.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </AssessmentCard>

        <View style={styles.resultsColumn}>
          <AssessmentCard tone={recommendations.recommendedPrograms.length > 0 ? "success" : "warning"}>
            <Text style={assessmentStyles.cardTitle}>App card recommendations</Text>
            {recommendations.appCards.length > 0 ? (
              recommendations.appCards.map((card) => (
                <View key={card.programName} style={styles.recommendationCard}>
                  <Text style={styles.recommendationTitle}>Recommended Program: {card.programName}</Text>
                  <Text style={assessmentStyles.cardText}>Why: {card.why}</Text>
                  <Text style={assessmentStyles.cardText}>Next Step: {card.nextStep}</Text>
                </View>
              ))
            ) : (
              <Text style={assessmentStyles.cardText}>Select one or more need signals to generate recommendations.</Text>
            )}
          </AssessmentCard>

          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Parent report wording</Text>
            <Text style={assessmentStyles.cardText}>{recommendations.parentReportText}</Text>
            <Text style={styles.summaryText}>{recommendations.multiProgramSummary}</Text>
          </AssessmentCard>

          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Referral drafts</Text>
            {referralDrafts.length > 0 ? (
              referralDrafts.map((draft) => (
                <View key={draft.serviceType} style={styles.draftRow}>
                  <Text style={styles.draftTitle}>{draft.serviceType}</Text>
                  <Text style={assessmentStyles.cardText}>{draft.notes}</Text>
                </View>
              ))
            ) : (
              <Text style={assessmentStyles.cardText}>No referral drafts yet.</Text>
            )}
          </AssessmentCard>

          <AssessmentCard tone="warning">
            <Text style={assessmentStyles.cardTitle}>Worker review safeguards</Text>
            {recommendations.workerReviewNotes.map((note) => (
              <Text key={note} style={assessmentStyles.cardText}>
                - {note}
              </Text>
            ))}
          </AssessmentCard>
        </View>
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  resultsColumn: {
    flexGrow: 1,
    flexBasis: 340,
    gap: 14,
  },
  categoryBlock: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: assessmentColors.border,
  },
  categoryHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  categoryTitle: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "900",
  },
  signalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  signalButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  signalButtonSelected: {
    borderColor: assessmentColors.teal,
    backgroundColor: assessmentColors.sage,
  },
  signalText: {
    color: assessmentColors.charcoal,
    fontSize: 13,
    fontWeight: "800",
  },
  signalTextSelected: {
    color: assessmentColors.tealDark,
  },
  recommendationCard: {
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  recommendationTitle: {
    color: assessmentColors.charcoal,
    fontSize: 15,
    fontWeight: "900",
  },
  summaryText: {
    color: assessmentColors.tealDark,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
  },
  draftRow: {
    gap: 4,
    borderRadius: 8,
    backgroundColor: "#F7FAF8",
    padding: 10,
  },
  draftTitle: {
    color: assessmentColors.charcoal,
    fontSize: 14,
    fontWeight: "900",
  },
});
