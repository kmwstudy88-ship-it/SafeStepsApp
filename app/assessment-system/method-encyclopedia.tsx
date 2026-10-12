import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  StatusPill,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  assessmentMethodCompetencyProfileFields,
  assessmentMethodDomains,
  assessmentMethodEncyclopediaSourceClaim,
  assessmentMethodEncyclopediaTitle,
  assessmentMethodTaxonomy,
  getAssessmentMethodCount,
} from "../../lib/data/assessmentMethodEncyclopedia";

export default function AssessmentMethodEncyclopediaScreen() {
  const methodCount = getAssessmentMethodCount();

  return (
    <AssessmentScreenShell
      title="Assessment Method Encyclopedia"
      subtitle="A worker-facing reference for varying assessment formats so SafeSteps measures knowledge, understanding, insight, behaviour, evidence, and progress over time."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.cardTitle}>{assessmentMethodEncyclopediaTitle}</Text>
              <Text style={styles.bodyText}>
                Source wording: {assessmentMethodEncyclopediaSourceClaim}. The attached source enumerates {methodCount} concrete method labels across {assessmentMethodDomains.length} described domains and a broader {assessmentMethodTaxonomy.length}-area taxonomy.
              </Text>
            </View>
            <StatusPill label={`${methodCount} listed methods`} tone="success" />
          </View>
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.cardTitle}>Competency profile output</Text>
          <Text style={styles.bodyText}>
            The purpose is not a single pass/fail score. SafeSteps should combine method types into a transparent competency profile.
          </Text>
          <ChipList items={assessmentMethodCompetencyProfileFields} />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.cardTitle}>Broader taxonomy</Text>
          <ChipList items={assessmentMethodTaxonomy} />
        </AssessmentCard>

        {assessmentMethodDomains.map((domain) => (
          <AssessmentCard key={domain.id}>
            <View style={styles.domainHeader}>
              <View style={styles.headerText}>
                <Text style={styles.cardTitle}>{domain.name}</Text>
                <Text style={styles.bodyText}>{domain.measures}</Text>
              </View>
              <StatusPill label={`${domain.methods.length} methods`} />
            </View>
            <ChipList items={domain.methods} />
          </AssessmentCard>
        ))}
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  domainHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    minWidth: 240,
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
});
