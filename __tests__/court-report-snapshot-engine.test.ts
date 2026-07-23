jest.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) => `digest-${value.length}`),
}));

jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(async () => ({ data: null, error: null })),
      insert: jest.fn(async () => ({ error: null })),
    })),
  },
}));

import { supabase } from "../lib/supabase";
import { buildCourtReportDraft } from "../lib/engines/courtReportBuilderEngine";
import {
  buildHashedCourtReportSnapshot,
  listCourtReportSnapshotsForCase,
  saveCourtReportSnapshot,
  verifyCourtReportSnapshotChain,
  verifyCourtReportSnapshotChainForCase,
} from "../lib/engines/courtReportSnapshotEngine";
import type {
  AssessmentScoreResult,
  CompositeReadinessRiskResult,
} from "../lib/engines/assessmentScoringEngine";

const assessment: AssessmentScoreResult = {
  domainScores: [{ domainId: "capacity", rawScore: 8, maxPossible: 10, normalizedScore: 80 }],
  overallScore: 80,
  band: {
    id: "ready",
    label: "Ready",
    minScore: 80,
    maxScore: 100,
    recommendation: "Continue.",
  },
  overrideTriggered: false,
  override: null,
  requiresSupervisorReview: false,
  recommendation: "Continue.",
};

const readiness: CompositeReadinessRiskResult = {
  compositeScore: 82,
  recommendation: "Progress shown.",
  flags: [],
  signals: [],
  suppressedByOverride: false,
  riskBand: "Low",
  direction: "improving",
  workerOnly: true,
};

function makeApprovedReport() {
  return buildCourtReportDraft({
    caseSummary: {
      caseName: "Snapshot case",
      program: "Program",
      phase: "Phase",
      assessmentPurpose: "Final export",
      preparedBy: "Worker",
      generatedAt: "2026-07-16T00:00:00.000Z",
    },
    assessment,
    readiness,
    evidence: [
      {
        id: "evidence-1",
        title: "Reviewed evidence",
        type: "document",
        createdAt: "2026-07-16T00:00:00.000Z",
        status: "reviewed",
        provenance: "worker_observed",
        reviewAvailability: "linked_worker_available",
        linkedDomains: ["Safety"],
      },
    ],
    contradictions: [],
    collaterals: [],
    workerNarrative: {
      strengths: "Stable routines.",
      concerns: "Continue monitoring.",
      nextSteps: "Maintain supports.",
    },
    supervisorReview: {
      approved: true,
      reviewedBy: "Supervisor",
      reviewedAt: "2026-07-16T01:00:00.000Z",
    },
    dataSources: {
      assessment: "live_reviewed",
      readiness: "live_reviewed",
      evidence: "live_reviewed",
      collateral: "live_reviewed",
      workerNarrative: "live_reviewed",
      supervisorReview: "live_reviewed",
    },
  });
}

describe("court report snapshot engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("builds a SHA-256 labelled snapshot hash", async () => {
    const snapshot = await buildHashedCourtReportSnapshot({
      report: makeApprovedReport(),
      caseId: "case-1",
      ownerId: "owner-1",
    });

    expect(snapshot.snapshotHash).toMatch(/^sha256:digest-/);
    expect(snapshot.readyForFinalExport).toBe(true);
  });

  test("saves the snapshot using the append-only database payload", async () => {
    const snapshot = await saveCourtReportSnapshot({
      report: makeApprovedReport(),
      caseId: "case-1",
      ownerId: "owner-1",
      previousSnapshotHash: "sha256:previous",
    });

    const fromMock = supabase.from as jest.Mock;
    const insertMock = fromMock.mock.results[0].value.insert as jest.Mock;

    expect(fromMock).toHaveBeenCalledWith("court_report_snapshots");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        case_id: "case-1",
        owner_id: "owner-1",
        report_title: "SafeSteps Court-Aware Progress Report",
        report_status: "approved",
        snapshot_payload: snapshot.snapshotPayload,
        snapshot_hash: snapshot.snapshotHash,
        previous_snapshot_hash: "sha256:previous",
        hash_algorithm: "sha256",
        ready_for_final_export: true,
        export_readiness_blockers: [],
      }),
    );
  });

  test("links to the latest prior snapshot when no previous hash is supplied", async () => {
    const fromMock = supabase.from as jest.Mock;
    const latestQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(async () => ({
        data: {
          id: "snapshot-previous",
          case_id: "case-1",
          snapshot_hash: "sha256:latest",
          previous_snapshot_hash: null,
          report_status: "approved",
          ready_for_final_export: true,
          created_at: "2026-07-15T00:00:00.000Z",
        },
        error: null,
      })),
    };
    const insertQuery = {
      insert: jest.fn(async () => ({ error: null })),
    };
    fromMock.mockReturnValueOnce(latestQuery).mockReturnValueOnce(insertQuery);

    await saveCourtReportSnapshot({
      report: makeApprovedReport(),
      caseId: "case-1",
      ownerId: "owner-1",
    });

    expect(latestQuery.eq).toHaveBeenCalledWith("case_id", "case-1");
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        previous_snapshot_hash: "sha256:latest",
      }),
    );
  });

  test("verifies a complete newest-first snapshot chain", () => {
    const result = verifyCourtReportSnapshotChain([
      {
        id: "snapshot-3",
        case_id: "case-1",
        snapshot_hash: "sha256:3",
        previous_snapshot_hash: "sha256:2",
        report_status: "approved",
        ready_for_final_export: true,
        created_at: "2026-07-16T03:00:00.000Z",
      },
      {
        id: "snapshot-2",
        case_id: "case-1",
        snapshot_hash: "sha256:2",
        previous_snapshot_hash: "sha256:1",
        report_status: "approved",
        ready_for_final_export: true,
        created_at: "2026-07-16T02:00:00.000Z",
      },
      {
        id: "snapshot-1",
        case_id: "case-1",
        snapshot_hash: "sha256:1",
        previous_snapshot_hash: null,
        report_status: "approved",
        ready_for_final_export: true,
        created_at: "2026-07-16T01:00:00.000Z",
      },
    ]);

    expect(result).toEqual({
      valid: true,
      snapshotCount: 3,
      message: "3 locked snapshots verified in sequence.",
    });
  });

  test("flags a broken snapshot chain link", () => {
    const result = verifyCourtReportSnapshotChain([
      {
        id: "snapshot-2",
        case_id: "case-1",
        snapshot_hash: "sha256:2",
        previous_snapshot_hash: "sha256:missing",
        report_status: "approved",
        ready_for_final_export: true,
        created_at: "2026-07-16T02:00:00.000Z",
      },
      {
        id: "snapshot-1",
        case_id: "case-1",
        snapshot_hash: "sha256:1",
        previous_snapshot_hash: null,
        report_status: "approved",
        ready_for_final_export: true,
        created_at: "2026-07-16T01:00:00.000Z",
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.brokenAtSnapshotId).toBe("snapshot-2");
  });

  test("verifies a case chain through the snapshot query", async () => {
    const fromMock = supabase.from as jest.Mock;
    const chainQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn(async () => ({
        data: [
          {
            id: "snapshot-2",
            case_id: "case-1",
            snapshot_hash: "sha256:2",
            previous_snapshot_hash: "sha256:1",
            report_status: "approved",
            ready_for_final_export: true,
            created_at: "2026-07-16T02:00:00.000Z",
          },
          {
            id: "snapshot-1",
            case_id: "case-1",
            snapshot_hash: "sha256:1",
            previous_snapshot_hash: null,
            report_status: "approved",
            ready_for_final_export: true,
            created_at: "2026-07-16T01:00:00.000Z",
          },
        ],
        error: null,
      })),
    };
    fromMock.mockReturnValueOnce(chainQuery);

    const result = await verifyCourtReportSnapshotChainForCase("case-1");

    expect(chainQuery.eq).toHaveBeenCalledWith("case_id", "case-1");
    expect(result.valid).toBe(true);
    expect(result.snapshotCount).toBe(2);
  });

  test("lists case snapshots newest first", async () => {
    const fromMock = supabase.from as jest.Mock;
    const snapshots = [
      {
        id: "snapshot-2",
        case_id: "case-1",
        snapshot_hash: "sha256:2",
        previous_snapshot_hash: "sha256:1",
        report_status: "approved",
        ready_for_final_export: true,
        created_at: "2026-07-16T02:00:00.000Z",
      },
    ];
    const listQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn(async () => ({ data: snapshots, error: null })),
    };
    fromMock.mockReturnValueOnce(listQuery);

    await expect(listCourtReportSnapshotsForCase("case-1")).resolves.toEqual(snapshots);
    expect(listQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});
