import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";

const domains = [
  "Parenting capacity",
  "Child safety",
  "Home stability",
  "Engagement with services",
  "Evidence consistency",
];

export default function RubricScoringScreen() {
  const [scores, setScores] = useState<Record<string, number>>({
    "Parenting capacity": 3,
    "Child safety": 3,
    "Home stability": 3,
    "Engagement with services": 3,
    "Evidence consistency": 3,
  });

  const total = useMemo(
    () => Object.values(scores).reduce((sum, score) => sum + score, 0),
    [scores],
  );

  const average = Math.round((total / domains.length) * 10) / 10;

  function updateScore(domain: string, score: number) {
    setScores((current) => ({
      ...current,
      [domain]: score,
    }));
  }

  return (
    <AssessmentScreenShell
      title="Rubric Scoring"
      subtitle="Score each assessment domain from 1 to 5 so progress can be clearly tracked over time."
    >
      <View style={styles.scoreSummary}>
        <Text style={styles.summaryLabel}>Average score</Text>
        <Text style={styles.summaryValue}>{average}</Text>
        <Text style={styles.summaryText}>Scores are placeholders until connected to the live Supabase record.</Text>
      </View>

      <View style={styles.list}>
        {domains.map((domain) => (
          <View key={domain} style={styles.domainCard}>
            <Text style={styles.domainTitle}>{domain}</Text>
            <View style={styles.scoreRow}>
              {[1, 2, 3, 4, 5].map((score) => {
                const active = scores[domain] === score;
                return (
                  <Pressable
                    key={score}
                    onPress={() => updateScore(domain, score)}
                    style={[styles.scoreButton, active && styles.scoreButtonActive]}
                  >
                    <Text style={active ? styles.scoreTextActive : styles.scoreText}>{score}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  scoreSummary: {
    gap: 6,
    padding: 18,
    borderRadius: 14,
    backgroundColor: assessmentColors.sage,
  },
  summaryLabel: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  summaryValue: {
    color: assessmentColors.charcoal,
    fontSize: 34,
    fontWeight: "900",
  },
  summaryText: {
    color: assessmentColors.muted,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  domainCard: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  domainTitle: {
    color: assessmentColors.charcoal,
    fontSize: 17,
    fontWeight: "900",
  },
  scoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scoreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  scoreButtonActive: {
    backgroundColor: assessmentColors.teal,
    borderColor: assessmentColors.teal,
  },
  scoreText: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  scoreTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});

