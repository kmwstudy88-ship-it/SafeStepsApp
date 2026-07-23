import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import { useAuth } from "../../lib/auth";
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
import { fetchEvidenceItems, type EvidenceItem } from "../../lib/engines/evidenceEngine";
import {
  fetchCourtReportLiveData,
  type CourtReportLiveData,
} from "../../lib/engines/courtReportLiveDataEngine";
import { saveCourtReportSupervisorApproval } from "../../lib/engines/courtReportSupervisorApprovalEngine";
import {
  buildCourtReportDraft,
  structuredEvidenceToCourtReportEvidence,
  type CourtReportEvidenceRecord,
} from "../../lib/engines/courtReportBuilderEngine";
import {
  buildHashedCourtReportSnapshot,
  fetchLatestCourtReportSnapshot,
  listCourtReportSnapshotsForCase,
  saveCourtReportSnapshot,
  verifyCourtReportSnapshotChainForCase,
  type CourtReportSnapshotChainVerification,
  type CourtReportSnapshotSummary,
} from "../../lib/engines/courtReportSnapshotEngine";
import {
  fetchLatestAssessmentCaseSetup,
  type AssessmentCaseSetup,
} from "../../lib/engines/assessmentCaseEngine";

const calibrationEvidence: CourtReportEvidenceRecord[] = [
  {
    id: "evidence-home-routine",
    title: "Calibration evidence item",
    type: "document",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "reviewed",
    provenance: "worker_observed",
    reviewAvailability: "linked_worker_available",
    linkedDomains: ["Environmental Safety and Stability", "Parenting Routines"],
    integrityHash: "sha256:calibration",
  },
  {
    id: "evidence-reflection",
    title: "Calibration reflection item",
    type: "reflection",
    createdAt: "2026-07-03T00:00:00.000Z",
    status: "accepted",
    provenance: "parent_family_submitted",
    reviewAvailability: "linked_worker_available",
    linkedDomains: ["Insight and Accountability"],
    integrityHash: "sha256:calibration-2",
  },
];

export default function ReportOutputScreen() {
  const { initializing, user } = useAuth();
  const [savedEvidence, setSavedEvidence] = useState<EvidenceItem[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");
  const [snapshotHash, setSnapshotHash] = useState("");
  const [snapshotReady, setSnapshotReady] = useState(false);
  const [caseRecord, setCaseRecord] = useState<AssessmentCaseSetup | null>(null);
  const [caseError, setCaseError] = useState("");
  const [lockingSnapshot, setLockingSnapshot] = useState(false);
  const [snapshotMessage, setSnapshotMessage] = useState("");
  const [previousSnapshot, setPreviousSnapshot] = useState<CourtReportSnapshotSummary | null>(null);
  const [snapshotHistory, setSnapshotHistory] = useState<CourtReportSnapshotSummary[]>([]);
  const [chainVerification, setChainVerification] = useState<CourtReportSnapshotChainVerification | null>(null);
  const [liveReportData, setLiveReportData] = useState<CourtReportLiveData | null>(null);
  const [liveReportLoading, setLiveReportLoading] = useState(false);
  const [liveReportError, setLiveReportError] = useState("");
  const [approvingReport, setApprovingReport] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvidence() {
      if (!user) {
        setSavedEvidence([]);
        return;
      }

      setEvidenceLoading(true);
      setEvidenceError("");

      try {
        const items = await fetchEvidenceItems();
        if (active) setSavedEvidence(items);
      } catch (error) {
        if (active) {
          setSavedEvidence([]);
          setEvidenceError(error instanceof Error ? error.message : "Could not load saved evidence.");
        }
      } finally {
        if (active) setEvidenceLoading(false);
      }
    }

    loadEvidence();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    let active = true;

    async function loadCaseRecord() {
      if (!user) {
        setCaseRecord(null);
        return;
      }

      setCaseError("");

      try {
        const latestCase = await fetchLatestAssessmentCaseSetup();
        if (!active) return;

        setCaseRecord(latestCase);

        if (latestCase) {
          setLiveReportLoading(true);
          const [latestSnapshot, history, verification, liveData] = await Promise.all([
            fetchLatestCourtReportSnapshot(latestCase.id),
            listCourtReportSnapshotsForCase(latestCase.id),
            verifyCourtReportSnapshotChainForCase(latestCase.id),
            fetchCourtReportLiveData(latestCase),
          ]);
          setPreviousSnapshot(latestSnapshot);
          setSnapshotHistory(history);
          setChainVerification(verification);
          setLiveReportData(liveData);
          setLiveReportError("");
        } else {
          setPreviousSnapshot(null);
          setSnapshotHistory([]);
          setChainVerification(null);
          setLiveReportData(null);
        }
      } catch (error) {
        if (active) {
          setCaseRecord(null);
          setPreviousSnapshot(null);
          setSnapshotHistory([]);
          setChainVerification(null);
          setLiveReportData(null);
          setCaseError(error instanceof Error ? error.message : "Could not load a live case file.");
          setLiveReportError(error instanceof Error ? error.message : "Could not load live report records.");
        }
      } finally {
        if (active) setLiveReportLoading(false);
      }
    }

    loadCaseRecord();

    return () => {
      active = false;
    };
  }, [user]);

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

    const reportEvidence = savedEvidence.length > 0
      ? savedEvidence.map((item) =>
          structuredEvidenceToCourtReportEvidence({
            id: item.id,
            title: item.title,
            notes: item.notes,
            evidence_type: item.evidence_type,
            structured_data: item.structured_data,
            review_status: item.review_status,
            status: item.status,
            file_path: item.file_path,
            created_at: item.created_at,
            integrity_hash: item.integrity_hash,
          }),
        )
      : calibrationEvidence;

    const assessmentInput = liveReportData?.assessment ?? assessment;
    const readinessInput = liveReportData?.readiness ?? readiness;
    const hasLiveCase = Boolean(caseRecord);

    return buildCourtReportDraft({
      caseSummary: {
        caseName: caseRecord?.family_label ?? (savedEvidence.length > 0 ? "Saved evidence report preview" : "Calibration report preview"),
        program: caseRecord?.program_stream ?? "Program stream not selected",
        phase: caseRecord ? `Phase ${caseRecord.program_phase}` : "Review phase not selected",
        assessmentPurpose: savedEvidence.length > 0
          ? "Structured report using saved evidence records and any live case-linked assessment data available."
          : "Structured preview for testing court-aware documentation output.",
        preparedBy: caseRecord?.caseworker_name ?? "Worker review required",
        supervisor: caseRecord?.supervisor_name ?? "Supervisor review required",
        generatedAt: new Date().toISOString(),
      },
      assessment: assessmentInput,
      readiness: readinessInput,
      evidence: reportEvidence,
      contradictions: liveReportData?.contradictions.length
        ? liveReportData.contradictions
        : hasLiveCase
          ? []
          : [
              {
                id: "contradiction-generalisation",
                severity: "medium",
                summary: "Skills appear stronger in session than in contact observations.",
                sourceA: "Parent reflection",
                sourceB: "Contact observation",
                resolved: false,
              },
            ],
      collaterals: liveReportData?.collaterals.length
        ? liveReportData.collaterals
        : hasLiveCase
          ? []
          : [
              {
                id: "collateral-service",
                source: "Service attendance confirmation",
                date: "2026-07-04",
                summary: "Parent attended scheduled support service.",
                alignment: "aligned",
              },
            ],
      workerNarrative: liveReportData?.workerNarrative ?? {
        strengths: hasLiveCase ? undefined : "Parent is engaging with routine evidence and has completed structured reflections.",
        concerns: hasLiveCase ? undefined : "Generalisation outside sessions still needs further evidence and supervisor discussion.",
        nextSteps: hasLiveCase ? undefined : "Continue contact observations, request updated collateral, and review readiness after the next scoring period.",
      },
      supervisorReview: liveReportData?.supervisorReview ?? {
        approved: false,
        notes: hasLiveCase ? "Final supervisor approval is not recorded for this live case." : "Draft preview only.",
      },
      dataSources: {
        assessment: liveReportData?.dataSources.assessment ?? "calibration",
        readiness: liveReportData?.dataSources.readiness ?? "calibration",
        evidence: savedEvidence.length > 0 ? "live_unreviewed" : "calibration",
        collateral: liveReportData?.dataSources.collateral ?? "calibration",
        workerNarrative: liveReportData?.dataSources.workerNarrative ?? "calibration",
        supervisorReview: liveReportData?.dataSources.supervisorReview ?? "not_connected",
      },
      trends: liveReportData?.trends.length ? liveReportData.trends : trends,
    });
  }, [caseRecord, liveReportData, savedEvidence]);

  const usingSavedEvidence = savedEvidence.length > 0;

  useEffect(() => {
    let active = true;

    async function buildSnapshotPreview() {
      const snapshot = await buildHashedCourtReportSnapshot({
        report,
        caseId: "preview-case",
        ownerId: user?.id,
      });

      if (active) {
        setSnapshotHash(snapshot.snapshotHash);
        setSnapshotReady(snapshot.readyForFinalExport);
      }
    }

    buildSnapshotPreview().catch((error) => {
      if (active) {
        setSnapshotHash(error instanceof Error ? `Snapshot hash unavailable: ${error.message}` : "Snapshot hash unavailable.");
        setSnapshotReady(false);
      }
    });

    return () => {
      active = false;
    };
  }, [report, user?.id]);

  const lockDisabled = !caseRecord || !snapshotReady || lockingSnapshot;
  const approvalDisabled = !caseRecord || approvingReport || report.exportReadinessBlockers.some((blocker) => blocker !== "supervisor: final supervisor approval is not recorded.");

  async function refreshLiveReportData(targetCase: AssessmentCaseSetup) {
    const liveData = await fetchCourtReportLiveData(targetCase);
    setLiveReportData(liveData);
    setLiveReportError("");
  }

  async function handleSupervisorApproval() {
    if (!caseRecord || approvalDisabled) return;

    setApprovingReport(true);
    setApprovalMessage("");

    try {
      await saveCourtReportSupervisorApproval({
        caseId: caseRecord.id,
        snapshotHash,
        approved: true,
        reviewerName: caseRecord.supervisor_name,
        reviewNotes: "Supervisor approval recorded from court report builder after export-readiness review.",
      });
      await refreshLiveReportData(caseRecord);
      setApprovalMessage("Supervisor approval recorded. Recheck export readiness before locking a final snapshot.");
    } catch (error) {
      setApprovalMessage(error instanceof Error ? error.message : "Could not record supervisor approval.");
    } finally {
      setApprovingReport(false);
    }
  }

  async function handleLockSnapshot() {
    if (!caseRecord || lockDisabled) return;

    setLockingSnapshot(true);
    setSnapshotMessage("");

    try {
      const snapshot = await saveCourtReportSnapshot({
        report,
        caseId: caseRecord.id,
        ownerId: caseRecord.owner_id,
      });

      setSnapshotHash(snapshot.snapshotHash);
      setSnapshotReady(snapshot.readyForFinalExport);
      setPreviousSnapshot({
        id: "just-locked",
        case_id: snapshot.caseId,
        snapshot_hash: snapshot.snapshotHash,
        previous_snapshot_hash: snapshot.previousSnapshotHash ?? null,
        report_status: snapshot.reportStatus,
        ready_for_final_export: snapshot.readyForFinalExport,
        created_at: new Date().toISOString(),
      });
      const [history, verification] = await Promise.all([
        listCourtReportSnapshotsForCase(caseRecord.id),
        verifyCourtReportSnapshotChainForCase(caseRecord.id),
      ]);
      setSnapshotHistory(history);
      setChainVerification(verification);
      setSnapshotMessage(`Snapshot locked for ${caseRecord.family_label ?? "case file"}: ${snapshot.snapshotHash}`);
    } catch (error) {
      setSnapshotMessage(error instanceof Error ? error.message : "Could not lock report snapshot.");
    } finally {
      setLockingSnapshot(false);
    }
  }

  return (
    <AssessmentScreenShell
      title="Court Report Builder"
      subtitle="Structured court-aware report draft compiled from scoring, readiness, evidence, contradictions, collateral, and supervisor review state."
    >
      <View style={styles.exampleNotice}>
        <Text style={styles.exampleTitle}>{usingSavedEvidence ? "Saved evidence preview" : "Calibration preview only"}</Text>
        <Text style={styles.reportText}>
          {usingSavedEvidence
            ? "This report preview uses saved evidence records from the signed-in account. It remains a draft until live assessment, collateral, worker narrative, and supervisor review records are connected."
            : "This report preview is generated from calibration assessment, evidence, collateral, and worker narrative data. It is not a live case report and cannot be used as a court-ready output until connected to reviewed records."}
        </Text>
        {initializing || evidenceLoading ? <ActivityIndicator /> : null}
        {evidenceError ? <Text style={styles.reviewText}>{evidenceError}</Text> : null}
        {liveReportLoading ? <ActivityIndicator /> : null}
        {liveReportError ? <Text style={styles.reviewText}>{liveReportError}</Text> : null}
      </View>

      <View style={report.supervisorReviewRequired ? styles.reviewCard : styles.reportCard}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <Text style={styles.reportMeta}>Status: {report.status.replace(/_/g, " ")}</Text>
        <Text style={styles.reportMeta}>Version: {report.versionLabel}</Text>
        <Text style={styles.reportMeta}>Generated: {new Date(report.generatedAt).toLocaleString()}</Text>
        <Text style={styles.reportText}>{report.tamperEvidenceSummary}</Text>
      </View>

      <View style={snapshotReady ? styles.readyCard : styles.blockerCard}>
        <Text style={styles.sectionHeading}>Immutable snapshot preview</Text>
        <Text style={styles.reportText}>
          {snapshotReady
            ? "This report can be locked as an immutable snapshot when attached to a live case file."
            : "This report is not ready for final locked export. The snapshot hash is still shown for audit preview only."}
        </Text>
        {caseRecord ? (
          <Text style={styles.reportMeta}>Live case: {caseRecord.family_label ?? caseRecord.id}</Text>
        ) : (
          <Text style={styles.reviewText}>
            {caseError || "No live case file is linked yet. Create or select a case before locking a final snapshot."}
          </Text>
        )}
        {previousSnapshot ? (
          <Text style={styles.hashText}>Previous snapshot: {previousSnapshot.snapshot_hash}</Text>
        ) : caseRecord ? (
          <Text style={styles.reportText}>No previous locked snapshot is attached to this case yet.</Text>
        ) : null}
        {chainVerification ? (
          <Text style={chainVerification.valid ? styles.successText : styles.reviewText}>
            Chain check: {chainVerification.message}
          </Text>
        ) : null}
        {snapshotHash ? <Text style={styles.hashText}>{snapshotHash}</Text> : <ActivityIndicator />}
        <Pressable
          disabled={lockDisabled}
          onPress={handleLockSnapshot}
          style={[styles.primaryButton, lockDisabled && styles.disabledButton]}
        >
          {lockingSnapshot ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Lock Report Snapshot</Text>
          )}
        </Pressable>
        {snapshotMessage ? <Text style={snapshotMessage.startsWith("Snapshot locked") ? styles.successText : styles.reviewText}>{snapshotMessage}</Text> : null}
      </View>

      <View style={report.exportReadinessBlockers.length > 0 ? styles.blockerCard : styles.readyCard}>
        <Text style={styles.sectionHeading}>
          {report.exportReadinessBlockers.length > 0
            ? `Export blocked: ${report.exportReadinessBlockers.length} item${report.exportReadinessBlockers.length === 1 ? "" : "s"}`
            : "Export readiness"}
        </Text>
        {report.exportReadinessBlockers.length > 0 ? (
          report.exportReadinessBlockers.map((blocker) => (
            <Text key={blocker} style={styles.blockerText}>
              - {blocker}
            </Text>
          ))
        ) : (
          <Text style={styles.reportText}>
            No export blockers are currently detected. Final export still requires immutable snapshot and audit handling.
          </Text>
        )}
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.sectionHeading}>Supervisor approval</Text>
        <Text style={styles.reportText}>
          Approval is recorded as an immutable supervisor decision. Supervision notes alone do not unlock final export.
        </Text>
        {liveReportData?.supervisorReview ? (
          <Text style={liveReportData.supervisorReview.approved ? styles.successText : styles.reviewText}>
            {liveReportData.supervisorReview.approved ? "Approved" : "Review recorded without final approval"} by{" "}
            {liveReportData.supervisorReview.reviewedBy ?? "supervisor"} on{" "}
            {liveReportData.supervisorReview.reviewedAt
              ? new Date(liveReportData.supervisorReview.reviewedAt).toLocaleString()
              : "unrecorded date"}
          </Text>
        ) : (
          <Text style={styles.reviewText}>No supervisor approval record is attached.</Text>
        )}
        <Pressable
          disabled={approvalDisabled}
          onPress={handleSupervisorApproval}
          style={[styles.primaryButton, approvalDisabled && styles.disabledButton]}
        >
          {approvingReport ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Record Supervisor Approval</Text>
          )}
        </Pressable>
        {approvalDisabled && caseRecord ? (
          <Text style={styles.sectionText}>
            Resolve non-supervisor export blockers before approval can be recorded.
          </Text>
        ) : null}
        {approvalMessage ? (
          <Text style={approvalMessage.startsWith("Supervisor approval") ? styles.successText : styles.reviewText}>
            {approvalMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.sectionHeading}>Locked snapshot history</Text>
        {snapshotHistory.length > 0 ? (
          snapshotHistory.map((snapshot, index) => (
            <View key={snapshot.id} style={styles.snapshotHistoryRow}>
              <Text style={styles.sectionTitle}>
                {index === 0 ? "Latest" : `Version ${snapshotHistory.length - index}`}
              </Text>
              <Text style={styles.sectionText}>
                {snapshot.report_status.replace(/_/g, " ")} - {snapshot.ready_for_final_export ? "final export ready" : "not final export ready"}
              </Text>
              <Text style={styles.sectionText}>Locked: {new Date(snapshot.created_at).toLocaleString()}</Text>
              <Text style={styles.hashText}>Hash: {snapshot.snapshot_hash}</Text>
              {snapshot.previous_snapshot_hash ? (
                <Text style={styles.hashText}>Previous: {snapshot.previous_snapshot_hash}</Text>
              ) : (
                <Text style={styles.sectionText}>First visible snapshot in this case chain.</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.reportText}>No locked snapshots are attached to this case yet.</Text>
        )}
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
            {item.provenance ? <Text style={styles.sectionText}>Source: {item.provenance.replace(/_/g, " ")}</Text> : null}
            {item.reviewAvailability ? (
              <Text style={styles.sectionText}>Review: {item.reviewAvailability.replace(/_/g, " ")}</Text>
            ) : null}
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
  blockerCard: {
    gap: 8,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
  readyCard: {
    gap: 8,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#047857",
    backgroundColor: "#ECFDF5",
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
  blockerText: {
    color: "#7F1D1D",
    fontWeight: "800",
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: assessmentColors.teal,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.5,
  },
  successText: {
    color: "#047857",
    fontWeight: "900",
  },
  evidenceRow: {
    gap: 5,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  snapshotHistoryRow: {
    gap: 5,
    paddingVertical: 12,
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
