import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  ProgressBar,
  StatusPill,
  assessmentColors,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  buildCompetencyGenome,
  shdmCompetenceLevels,
  shdmGrowthSpiral,
  type ShdmCompetencyEvidenceRecord,
  type ShdmLearningProgressRecord,
} from "../../lib/engines/humanDevelopmentModel";

const learningProgress: ShdmLearningProgressRecord[] = [
  {
    personId: "parent-demo",
    topicId: "co-regulation",
    lessonsCompleted: 6,
    quizScores: [92, 88],
    timeSpentMinutes: 260,
    activitiesCompleted: 5,
    reflectionsCompleted: 4,
    certificatesEarned: 1,
  },
];

const competencyEvidence: ShdmCompetencyEvidenceRecord[] = [
  {
    id: "comm-scenario",
    personId: "parent-demo",
    competencyIds: ["communication", "co_regulation"],
    evidenceType: "scenario",
    demonstratedLevel: "application",
    score: 78,
    confidence: 74,
    context: "home",
    source: "scenario_assessment",
    observedAt: "2026-06-12",
  },
  {
    id: "comm-worker",
    personId: "parent-demo",
    competencyIds: ["communication"],
    evidenceType: "worker_observation",
    demonstratedLevel: "behaviour",
    score: 82,
    confidence: 78,
    context: "supervised_contact",
    source: "worker_observation",
    observedAt: "2026-07-02",
  },
  {
    id: "safety-pattern",
    personId: "parent-demo",
    competencyIds: ["safety"],
    evidenceType: "multi_week_pattern",
    demonstratedLevel: "consistency",
    score: 86,
    confidence: 84,
    context: "months_later",
    source: "routine_tracking",
    observedAt: "2026-07-15",
  },
  {
    id: "regulation-quiz",
    personId: "parent-demo",
    competencyIds: ["emotional_regulation"],
    evidenceType: "quiz",
    demonstratedLevel: "knowledge",
    score: 90,
    confidence: 82,
    context: "home",
    source: "quiz",
    observedAt: "2026-07-18",
  },
];

const genome = buildCompetencyGenome({
  personId: "parent-demo",
  competencies: ["communication", "emotional_regulation", "safety", "reflective_capacity", "attachment"],
  learningProgress,
  evidence: competencyEvidence,
});

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function HumanDevelopmentModelScreen() {
  return (
    <AssessmentScreenShell
      title="Human Development Model"
      subtitle="A developmental foundation for measuring what someone knows, can do, consistently does, and can transfer across time and context."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Seven Levels of Human Competence</Text>
          <Text style={assessmentStyles.cardText}>
            SafeSteps tracks movement from exposure through mastery. Strong knowledge does not
            automatically imply behaviour, consistency, or transfer to new situations.
          </Text>
          <View style={styles.levelGrid}>
            {shdmCompetenceLevels.map((level) => (
              <View key={level.id} style={styles.levelCard}>
                <Text style={styles.rank}>Level {level.rank}</Text>
                <Text style={styles.levelTitle}>{level.label}</Text>
                <Text style={assessmentStyles.cardText}>{level.question}</Text>
                <ChipList items={level.examples.map(formatLabel)} />
              </View>
            ))}
          </View>
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Evidence Pyramid</Text>
            <Text style={assessmentStyles.cardText}>
              Higher levels generally provide more direct evidence of competence, while lower
              levels still matter as learning foundations.
            </Text>
            <View style={styles.pyramid}>
              {["Mastery", "Consistency", "Real Behaviour", "Practical Demonstration", "Simulation", "Reflection", "Understanding", "Knowledge Recall"].map(
                (item, index) => (
                  <Text key={item} style={[styles.pyramidRow, { width: `${52 + index * 6}%` }]}>
                    {item}
                  </Text>
                ),
              )}
            </View>
          </AssessmentCard>

          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Growth Spiral</Text>
            <Text style={assessmentStyles.cardText}>
              Learning is cyclical. Lessons should help parents learn, practise, reflect, improve,
              repeat, maintain, and eventually teach or adapt skills.
            </Text>
            <ChipList items={shdmGrowthSpiral.map(formatLabel)} />
          </AssessmentCard>
        </View>

        <AssessmentCard tone="warning">
          <Text style={assessmentStyles.cardTitle}>Learning Progress and Competency Evidence Are Separate</Text>
          <Text style={assessmentStyles.cardText}>
            Lesson completion, quiz scores, time spent, reflections, and certificates are learning
            progress. Practical demonstrations, observations, behaviour trends, multi-source
            evidence, and confidence are competency evidence.
          </Text>
        </AssessmentCard>

        <View style={styles.genomeGrid}>
          {genome.map((entry) => (
            <AssessmentCard key={entry.competencyId}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={assessmentStyles.metaLabel}>Competency genome</Text>
                  <Text style={assessmentStyles.cardTitle}>{formatLabel(entry.competencyId)}</Text>
                </View>
                <StatusPill label={formatLabel(entry.confidence)} tone={entry.confidence === "high" || entry.confidence === "very_high" ? "success" : "warning"} />
              </View>
              <Metric label="Learning progress" value={entry.learningProgressScore} />
              <Metric label="Competency evidence" value={entry.competencyEvidenceScore} />
              <View style={assessmentStyles.row}>
                <SmallMetric label="Current level" value={formatLabel(entry.currentLevel)} />
                <SmallMetric label="Strongest evidence" value={formatLabel(entry.strongestEvidenceLevel)} />
                <SmallMetric label="Evidence count" value={String(entry.evidenceCount)} />
                <SmallMetric label="Contexts" value={String(entry.contextCoverage)} />
              </View>
              <Text style={assessmentStyles.cardText}>{entry.gapSummary}</Text>
              <Text style={assessmentStyles.metaLabel}>Next development step</Text>
              <Text style={assessmentStyles.cardText}>{entry.nextDevelopmentStep}</Text>
            </AssessmentCard>
          ))}
        </View>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricLine}>
        <Text style={assessmentStyles.metaLabel}>{label}</Text>
        <Text style={assessmentStyles.metaValue}>{value}%</Text>
      </View>
      <ProgressBar value={value} />
    </View>
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
  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  levelCard: {
    flexGrow: 1,
    flexBasis: 230,
    gap: 7,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  rank: {
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
  levelTitle: {
    color: assessmentColors.charcoal,
    fontSize: 18,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  pyramid: {
    alignItems: "center",
    gap: 6,
  },
  pyramidRow: {
    minHeight: 30,
    borderRadius: 8,
    overflow: "hidden",
    paddingVertical: 7,
    textAlign: "center",
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 13,
    fontWeight: "900",
  },
  genomeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  metric: {
    gap: 6,
  },
  metricLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
});
