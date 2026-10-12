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
  buildPsychometricAssessmentProfile,
  type PsychometricEvidenceSource,
} from "../../lib/engines/psychometricAssessmentEngine";

const layers = [
  "Competency measurement",
  "Evidence quality",
  "Reliability",
  "Validity",
  "Difficulty calibration",
  "Discrimination",
  "Guess detection",
  "Adaptive testing",
  "Competency confidence",
  "Evidence triangulation",
  "Contradiction review",
  "Growth trajectory",
  "Evidence sufficiency",
];

const sampleEvidence: PsychometricEvidenceSource[] = [
  {
    id: "quiz-001",
    competencyIds: ["knowledge", "emotional_regulation"],
    score: 88,
    evidenceType: "quiz",
    assessedAt: "2026-01-10",
    confidenceRating: 90,
    difficulty: "moderate",
    validityScore: 78,
    discriminationScore: 72,
    quality: {
      reliability: 82,
      objectivity: 86,
      recency: 55,
      completeness: 82,
      repeatability: 90,
      independence: 40,
      verifiability: 74,
      authenticity: 84,
      relevance: 78,
      strength: 76,
    },
  },
  {
    id: "reflection-001",
    competencyIds: ["insight", "reflective_capacity", "emotional_regulation"],
    score: 84,
    evidenceType: "reflection",
    assessedAt: "2026-03-15",
    confidenceRating: 85,
    validityScore: 82,
    discriminationScore: 70,
    quality: {
      reliability: 70,
      objectivity: 58,
      recency: 70,
      completeness: 82,
      repeatability: 62,
      independence: 35,
      verifiability: 55,
      authenticity: 84,
      relevance: 84,
      strength: 72,
    },
  },
  {
    id: "scenario-001",
    competencyIds: ["application", "emotional_regulation", "parenting"],
    score: 58,
    evidenceType: "scenario",
    assessedAt: "2026-05-20",
    confidenceRating: 65,
    difficulty: "hard",
    validityScore: 88,
    discriminationScore: 86,
    quality: {
      reliability: 76,
      objectivity: 72,
      recency: 84,
      completeness: 72,
      repeatability: 78,
      independence: 68,
      verifiability: 70,
      authenticity: 76,
      relevance: 92,
      strength: 74,
    },
  },
  {
    id: "home-001",
    competencyIds: ["application", "emotional_regulation", "protective_capacity"],
    score: 61,
    evidenceType: "home_challenge",
    assessedAt: "2026-07-01",
    validityScore: 88,
    discriminationScore: 82,
    quality: {
      reliability: 72,
      objectivity: 66,
      recency: 95,
      completeness: 78,
      repeatability: 72,
      independence: 62,
      verifiability: 76,
      authenticity: 82,
      relevance: 94,
      strength: 78,
    },
  },
  {
    id: "follow-up-001",
    competencyIds: ["knowledge", "emotional_regulation"],
    score: 81,
    evidenceType: "retention_check",
    assessedAt: "2026-07-15",
    confidenceRating: 80,
    difficulty: "moderate",
    validityScore: 80,
    discriminationScore: 78,
    quality: {
      reliability: 84,
      objectivity: 84,
      recency: 100,
      completeness: 80,
      repeatability: 86,
      independence: 54,
      verifiability: 78,
      authenticity: 84,
      relevance: 82,
      strength: 80,
    },
  },
];

const profiles = buildPsychometricAssessmentProfile({
  evidenceSources: sampleEvidence,
  competencyIds: ["knowledge", "emotional_regulation", "application", "protective_capacity"],
});

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function PsychometricEngineScreen() {
  return (
    <AssessmentScreenShell
      title="Psychometric Assessment Engine"
      subtitle="Decision-support scoring that separates demonstrated competency from confidence, quality, sufficiency, trend, and conflicting evidence."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Measurement Model</Text>
          <Text style={assessmentStyles.cardText}>
            SafeSteps asks how confidently a person has demonstrated a competency. Scores are not reduced
            to a single quiz result; each profile records evidence quality, diversity, reliability,
            validity, contradictions, and the next evidence that would strengthen the estimate.
          </Text>
          <ChipList items={layers} />
        </AssessmentCard>

        <View style={styles.profileGrid}>
          {profiles.map((profile) => (
            <AssessmentCard key={profile.competencyId} tone={profile.conflictingEvidence.length > 0 ? "warning" : "default"}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={assessmentStyles.metaLabel}>Competency</Text>
                  <Text style={assessmentStyles.cardTitle}>{formatLabel(profile.competencyId)}</Text>
                </View>
                <StatusPill
                  label={formatLabel(profile.evidenceSufficiency)}
                  tone={profile.evidenceSufficiency === "strong" ? "success" : profile.evidenceSufficiency === "low" ? "risk" : "warning"}
                />
              </View>

              <Metric label="Competency level" value={`${profile.competencyLevel}%`} progress={profile.competencyLevel} />
              <Metric label="Confidence in estimate" value={`${profile.confidence}%`} progress={profile.confidence} />
              <Metric label="Evidence quality" value={`${profile.evidenceQuality}%`} progress={profile.evidenceQuality} />

              <View style={assessmentStyles.row}>
                <SmallMetric label="Sources" value={String(profile.evidenceSources)} />
                <SmallMetric label="Diversity" value={`${profile.evidenceDiversity} types`} />
                <SmallMetric label="Consistency" value={formatLabel(profile.consistency)} />
                <SmallMetric label="Trend" value={formatLabel(profile.recentTrend)} />
                <SmallMetric label="Retention" value={formatLabel(profile.retention)} />
                <SmallMetric label="Application" value={formatLabel(profile.application)} />
              </View>

              {profile.conflictingEvidence.length > 0 ? (
                <View style={styles.notice}>
                  <Text style={styles.noticeTitle}>Conflicting evidence</Text>
                  {profile.conflictingEvidence.map((item) => (
                    <Text key={item} style={styles.noticeText}>{item}</Text>
                  ))}
                </View>
              ) : null}

              <Text style={assessmentStyles.metaLabel}>Recommended next evidence</Text>
              {profile.recommendedNextEvidence.map((item) => (
                <Text key={item} style={assessmentStyles.cardText}>{item}</Text>
              ))}
            </AssessmentCard>
          ))}
        </View>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

function Metric({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricLine}>
        <Text style={assessmentStyles.metaLabel}>{label}</Text>
        <Text style={assessmentStyles.metaValue}>{value}</Text>
      </View>
      <ProgressBar value={progress} />
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
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  cardHeader: {
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
  notice: {
    gap: 5,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#E5C879",
  },
  noticeTitle: {
    color: assessmentColors.amberText,
    fontSize: 13,
    fontWeight: "900",
  },
  noticeText: {
    color: assessmentColors.charcoal,
    fontSize: 14,
    lineHeight: 20,
  },
});
