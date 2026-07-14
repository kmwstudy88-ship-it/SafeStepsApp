import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  safeStepsCriticalOverrides,
  safeStepsDefaultResponses,
  safeStepsProtectiveCapacityDomains,
  safeStepsProtectiveCapacityItems,
  safeStepsScoringBands,
  sampleMilestones,
  sampleServiceReferrals,
  sampleVisitations,
} from "../../lib/data/safeStepsAssessmentInstrument";
import {
  calculateMilestoneProgressScore,
  calculateServiceCompletionScore,
  calculateVisitationQualityTrend,
  computeCompositeReunificationReadinessRisk,
  scoreAssessment,
  scoreTrend,
} from "../../lib/engines/assessmentScoringEngine";
import { buildCourtReportDraft } from "../../lib/engines/courtReportBuilderEngine";

export default function ReportOutputScreen() {
  const report = useMemo(() => {
    const assessment = scoreAssessment({
      domains: safeStepsProtectiveCapacityDomains,
      items: safeStepsProtectiveCapacityItems,
      responses: safeStepsDefaultResponses,
      overrides: safeStepsCriticalOverrides,
      bands: safeStepsScoringBands,
    });
    const readiness = computeCompositeReunificationReadinessRisk({
      assessmentScore: assessment.overallScore,
      serviceCompletionScore: calculateServiceCompletionScore(sampleServiceReferrals),
      visitationQualityScore: calculateVisitationQualityTrend(sampleVisitations),
      milestoneProgressScore: calculateMilestoneProgressScore(sampleMilestones),
      activeCriticalOverride: assessment.overrideTriggered,
      previousCompositeScore: 62,
    });
    const trends = scoreTrend(
      assessment.domainScores.map((score) => ({
        ...score,
        rawScore: Math.max(0, score.rawScore - 1),
        normalizedScore: Math.max(0, score.normalizedScore - 8),
      })),
      assessment.domainScores,
    );

    return buildCourtReportDraft({
      caseSummary: {
        caseName: "Example SafeSteps case",
        program: "24 Month Reunification Program",
        phase: "Example foundation review",
        assessmentPurpose: "Example structured progress review for testing court-aware documentation output.",
        preparedBy: "Example SafeSteps worker",
        supervisor: "Supervisor review required",
        generatedAt: new Date().toISOString(),
      },
      assessment,
      readiness,
      evidence: [
        {
          id: "evidence-home-routine",
          title: "Weekly home routine evidence",
          type: "document",
          createdAt: "2026-07-01T00:00:00.000Z",
          status: "reviewed",
          linkedDomains: ["Environmental Safety and Stability", "Parenting Routines"],
          integrityHash: "sha256:sample",
        },
        {
          id: "evidence-reflection",
          title: "Accountability reflection",
          type: "reflection",
          createdAt: "2026-07-03T00:00:00.000Z",
          status: "accepted",
          linkedDomains: ["Insight and Accountability"],
          integrityHash: "sha256:sample-2",
        },
      ],
      contradictions: [
        {
          id: "contradiction-generalisation",
          severity: "medium",
          summary: "Skills appear stronger in session than in contact observations.",
          sourceA: "Parent reflection",
          sourceB: "Contact observation",
          resolved: false,
        },
      ],
      collaterals: [
        {
          id: "collateral-service",
          source: "Service attendance confirmation",
          date: "2026-07-04",
          summary: "Parent attended scheduled support service.",
          alignment: "aligned",
        },
      ],
      workerNarrative: {
        strengths: "Parent is engaging with routine evidence and has completed structured reflections.",
        concerns: "Generalisation outside sessions still needs further evidence and supervisor discussion.",
        nextSteps: "Continue contact observations, request updated collateral, and review readiness after the next scoring period.",
      },
      supervisorReview: {
        approved: false,
        notes: "Draft preview only.",
      },
      trends,
    });
  }, []);

  return (
    <AssessmentScreenShell
      title="Court Report Builder"
      subtitle="Structured court-aware report draft compiled from scoring, readiness, evidence, contradictions, collateral, and supervisor review state."
    >
      <View style={styles.exampleNotice}>
        <Text style={styles.exampleTitle}>Example report only</Text>
        <Text style={styles.reportText}>
          This report is generated from sample assessment, evidence, collateral, and worker narrative data. It is not a live case report and cannot be used as a court-ready output until connected to reviewed records.
        </Text>
      </View>

      <View style={report.supervisorReviewRequired ? styles.reviewCard : styles.reportCard}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <Text style={styles.reportMeta}>Status: {report.status.replace(/_/g, " ")}</Text>
        <Text style={styles.reportMeta}>Version: {report.versionLabel}</Text>
        <Text style={styles.reportMeta}>Generated: {new Date(report.generatedAt).toLocaleString()}</Text>
        <Text style={styles.reportText}>{report.tamperEvidenceSummary}</Text>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.sectionHeading}>Report sections</Text>
        {report.sections.map((section, index) => (
          <View key={section.id} style={styles.sectionRow}>
            <Text style={styles.sectionNumber}>{index + 1}</Text>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionText}>{section.body}</Text>
              {section.reviewRequired ? <Text style={styles.reviewText}>Review required</Text> : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.sectionHeading}>Evidence list</Text>
        {report.evidenceList.map((item) => (
          <View key={item.id} style={styles.evidenceRow}>
            <Text style={styles.evidenceTitle}>{item.title}</Text>
            <Text style={styles.sectionText}>
              {item.type} - {item.status} - {item.linkedDomains.join(", ")}
            </Text>
            {item.integrityHash ? <Text style={styles.hashText}>{item.integrityHash}</Text> : null}
          </View>
        ))}
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  exampleNotice: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B45309",
    backgroundColor: "#FFFBEB",
  },
  exampleTitle: {
    color: "#92400E",
    fontSize: 16,
    fontWeight: "900",
  },
  reportCard: {
    gap: 14,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  reviewCard: {
    gap: 10,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D56A4D",
    backgroundColor: "#FFF2ED",
  },
  reportTitle: {
    color: assessmentColors.charcoal,
    fontSize: 22,
    fontWeight: "900",
  },
  reportMeta: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  reportText: {
    color: assessmentColors.muted,
    lineHeight: 21,
  },
  sectionHeading: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  sectionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    color: "#FFFFFF",
    backgroundColor: assessmentColors.teal,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "900",
  },
  sectionCopy: {
    flex: 1,
    gap: 5,
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  sectionText: {
    color: assessmentColors.muted,
    lineHeight: 20,
  },
  reviewText: {
    color: "#9E2B25",
    fontWeight: "900",
  },
  evidenceRow: {
    gap: 5,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  evidenceTitle: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  hashText: {
    color: assessmentColors.muted,
    fontSize: 12,
  },
});
