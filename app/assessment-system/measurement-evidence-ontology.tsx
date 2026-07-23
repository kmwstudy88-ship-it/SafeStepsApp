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
  evaluateClaim,
  smeoObjectModel,
  type SmeoClaim,
  type SmeoEvidence,
} from "../../lib/engines/measurementEvidenceOntology";

const competencyExamples = [
  "Communication",
  "Safety",
  "Emotional Regulation",
  "Attachment",
  "Child Development",
  "Protective Parenting",
  "Problem Solving",
  "Reflective Capacity",
  "Co-Regulation",
  "Executive Function",
];

const sharedMetadata = [
  "Unique ID",
  "Created date",
  "Last updated",
  "Source",
  "Reviewer",
  "Confidence",
  "Context",
  "Linked competencies",
  "Audit history",
];

const sampleClaim: SmeoClaim = {
  id: "claim-emotion-validation",
  objectType: "claim",
  createdAt: "2026-07-21",
  source: "assessment_system",
  competencyId: "communication",
  linkedCompetencyIds: ["communication"],
  findingIds: ["finding-emotion-validation"],
  statement:
    "Evidence supports that the parent can use emotional validation during structured interactions.",
  threshold: {
    minimumSupportingEvidence: 3,
    minimumIndependentSources: 2,
    requiredEvidenceTypes: ["scenario_result", "home_activity", "worker_note"],
  },
};

const sampleEvidence: SmeoEvidence[] = [
  {
    id: "evidence-scenario",
    objectType: "evidence",
    createdAt: "2026-07-01",
    source: "scenario_assessment",
    evidenceType: "scenario_result",
    personId: "person-parent-1",
    behaviourIds: ["behaviour-validates-feelings"],
    direction: "supporting",
    reliability: 84,
    independence: 72,
    verifiability: 78,
    linkedCompetencyIds: ["communication"],
  },
  {
    id: "evidence-home",
    objectType: "evidence",
    createdAt: "2026-07-08",
    source: "home_activity",
    evidenceType: "home_activity",
    personId: "person-parent-1",
    behaviourIds: ["behaviour-validates-feelings"],
    direction: "supporting",
    reliability: 82,
    independence: 68,
    verifiability: 74,
    linkedCompetencyIds: ["communication"],
  },
  {
    id: "evidence-worker",
    objectType: "evidence",
    createdAt: "2026-07-14",
    source: "worker_observation",
    evidenceType: "worker_note",
    personId: "person-parent-1",
    behaviourIds: ["behaviour-validates-feelings"],
    direction: "supporting",
    reliability: 88,
    independence: 86,
    verifiability: 82,
    linkedCompetencyIds: ["communication"],
  },
  {
    id: "evidence-routine-gap",
    objectType: "evidence",
    createdAt: "2026-07-16",
    source: "routine_log",
    evidenceType: "daily_log",
    personId: "person-parent-1",
    behaviourIds: ["behaviour-validates-feelings"],
    direction: "mixed",
    reliability: 70,
    independence: 54,
    verifiability: 64,
    linkedCompetencyIds: ["communication"],
  },
];

const claimEvaluation = evaluateClaim({ claim: sampleClaim, evidence: sampleEvidence });

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function MeasurementEvidenceOntologyScreen() {
  return (
    <AssessmentScreenShell
      title="Measurement & Evidence Ontology"
      subtitle="A common language for lessons, assessments, evidence, reports, dashboards, AI, and reviewers to interpret information consistently."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>SMEO Object Chain</Text>
          <Text style={assessmentStyles.cardText}>
            The ontology keeps raw evidence, observations, findings, claims, conclusions,
            recommendations, and reviews separate so conclusions remain explainable and auditable.
          </Text>
          <View style={styles.chain}>
            {smeoObjectModel.map((layer, index) => (
              <View key={layer.objectType} style={styles.chainItem}>
                <Text style={styles.chainIndex}>{index + 1}</Text>
                <Text style={styles.chainTitle}>{formatLabel(layer.objectType)}</Text>
                <Text style={assessmentStyles.cardText}>{layer.purpose}</Text>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Stable Competencies</Text>
            <Text style={assessmentStyles.cardText}>
              Competencies stay stable across modules. Capabilities and observable behaviours define
              what can be taught, assessed, observed, and reviewed.
            </Text>
            <ChipList items={competencyExamples} />
          </AssessmentCard>

          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Shared Metadata</Text>
            <Text style={assessmentStyles.cardText}>
              Every object carries traceability metadata so reviewers can see source, context,
              confidence, links, and audit history.
            </Text>
            <ChipList items={sharedMetadata} />
          </AssessmentCard>
        </View>

        <AssessmentCard tone="warning">
          <View style={styles.headerRow}>
            <View style={styles.flex}>
              <Text style={assessmentStyles.metaLabel}>Reviewable claim</Text>
              <Text style={assessmentStyles.cardTitle}>{sampleClaim.statement}</Text>
            </View>
            <StatusPill label={formatLabel(claimEvaluation.confidenceBand)} tone="warning" />
          </View>

          <View style={assessmentStyles.row}>
            <SmallMetric label="Sufficiency" value={formatLabel(claimEvaluation.sufficiency)} />
            <SmallMetric label="Supporting evidence" value={String(claimEvaluation.supportingEvidenceIds.length)} />
            <SmallMetric label="Challenging evidence" value={String(claimEvaluation.challengingEvidenceIds.length)} />
            <SmallMetric label="Evidence diversity" value={String(claimEvaluation.evidenceDiversity)} />
            <SmallMetric label="Independent sources" value={String(claimEvaluation.independentSources)} />
          </View>

          <Text style={assessmentStyles.metaLabel}>Threshold requirements</Text>
          <ChipList
            items={[
              `${sampleClaim.threshold.minimumSupportingEvidence} supporting evidence items`,
              `${sampleClaim.threshold.minimumIndependentSources} independent sources`,
              ...sampleClaim.threshold.requiredEvidenceTypes.map(formatLabel),
            ]}
          />

          <Text style={assessmentStyles.metaLabel}>Reasoning safeguards</Text>
          <Text style={assessmentStyles.cardText}>{claimEvaluation.explanation}</Text>
          <Text style={assessmentStyles.cardText}>
            Mixed or contradictory evidence is preserved for human review rather than being averaged
            away or converted into a character judgement.
          </Text>
        </AssessmentCard>
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
  chain: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chainItem: {
    flexGrow: 1,
    flexBasis: 220,
    gap: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  chainIndex: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 12,
    fontWeight: "900",
  },
  chainTitle: {
    color: assessmentColors.charcoal,
    fontSize: 17,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  grid: {
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
  flex: {
    flex: 1,
    minWidth: 240,
  },
});
