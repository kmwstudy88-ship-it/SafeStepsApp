import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  StatusPill,
  assessmentColors,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  assessmentSystemLayers,
  buildPhases,
  exampleAssessmentFlow,
  exampleGeneratedResult,
  getTablesForPhase,
  validateBlueprintCoverage,
} from "../../lib/engines/implementationBlueprint";

const coverage = validateBlueprintCoverage();

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function ImplementationBlueprintScreen() {
  return (
    <AssessmentScreenShell
      title="Implementation Blueprint"
      subtitle="A buildable database and workflow foundation for assessments, scoring, competencies, evidence, observations, claims, reviews, quality, audit, and reports."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <View style={styles.headerRow}>
            <View>
              <Text style={assessmentStyles.cardTitle}>Core Data Architecture</Text>
              <Text style={assessmentStyles.cardText}>
                The assessment system is split into design, delivery, evidence generation, and
                competency evaluation so reusable templates stay separate from attempts and evidence.
              </Text>
            </View>
            <StatusPill label={`${coverage.tableCount} tables`} tone={coverage.complete ? "success" : "warning"} />
          </View>
          <View style={styles.layerGrid}>
            {assessmentSystemLayers.map((layer, index) => (
              <View key={layer.id} style={styles.layerCard}>
                <Text style={styles.index}>{index + 1}</Text>
                <Text style={styles.layerTitle}>{layer.label}</Text>
                <Text style={assessmentStyles.cardText}>{layer.purpose}</Text>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Recommended Build Order</Text>
          <Text style={assessmentStyles.cardText}>
            These phases keep the app useful early while preserving the structure needed for
            evidence-based competency assessment later.
          </Text>
          <View style={styles.phaseGrid}>
            {buildPhases.map((phase, index) => (
              <View key={phase.id} style={styles.phaseCard}>
                <Text style={styles.index}>Phase {index + 1}</Text>
                <Text style={styles.layerTitle}>{phase.title}</Text>
                <Text style={assessmentStyles.metaLabel}>Tables</Text>
                <ChipList items={getTablesForPhase(phase.id).map((table) => formatLabel(table.name))} />
                <Text style={assessmentStyles.metaLabel}>Builds</Text>
                <ChipList items={phase.builds} />
              </View>
            ))}
          </View>
        </AssessmentCard>

        <AssessmentCard tone="warning">
          <Text style={assessmentStyles.cardTitle}>Example Assessment Flow</Text>
          <Text style={assessmentStyles.cardText}>
            A single topic can produce multiple evidence types across knowledge, understanding,
            application, demonstration, reflection, home practice, and retention.
          </Text>
          <View style={styles.flowList}>
            {exampleAssessmentFlow.map((step) => (
              <View key={step.step} style={styles.flowRow}>
                <Text style={styles.index}>{step.step}</Text>
                <View style={styles.flex}>
                  <Text style={styles.layerTitle}>{step.level}</Text>
                  <Text style={assessmentStyles.cardText}>{step.prompt}</Text>
                  <Text style={assessmentStyles.metaLabel}>{formatLabel(step.generatedEvidenceType)}</Text>
                </View>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Generated Result</Text>
            <View style={assessmentStyles.row}>
              <SmallMetric label="Knowledge" value={exampleGeneratedResult.knowledge} />
              <SmallMetric label="Understanding" value={exampleGeneratedResult.understanding} />
              <SmallMetric label="Scenario application" value={exampleGeneratedResult.scenarioApplication} />
              <SmallMetric label="Demonstration" value={exampleGeneratedResult.practicalDemonstration} />
              <SmallMetric label="Real-life application" value={exampleGeneratedResult.realLifeApplication} />
              <SmallMetric label="Retention" value={exampleGeneratedResult.retention} />
              <SmallMetric label="Overall competency" value={exampleGeneratedResult.overallCompetency} />
              <SmallMetric label="Confidence" value={exampleGeneratedResult.confidence} />
            </View>
          </AssessmentCard>

          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Additional Evidence Recommended</Text>
            <Text style={assessmentStyles.cardText}>
              The output is not just a percentage. It identifies where demonstrated competency still
              needs stronger evidence.
            </Text>
            <ChipList items={exampleGeneratedResult.additionalEvidenceRecommended} />
          </AssessmentCard>
        </View>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={assessmentStyles.splitItem}>
      <Text style={assessmentStyles.metaLabel}>{label}</Text>
      <Text style={assessmentStyles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  layerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  layerCard: {
    flexGrow: 1,
    flexBasis: 250,
    gap: 7,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  index: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 12,
    fontWeight: "900",
  },
  layerTitle: {
    color: assessmentColors.charcoal,
    fontSize: 17,
    fontWeight: "900",
  },
  phaseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  phaseCard: {
    flexGrow: 1,
    flexBasis: 290,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  flowList: {
    gap: 8,
  },
  flowRow: {
    flexDirection: "row",
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
    gap: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
});
