import * as Crypto from "expo-crypto";

import { supabase } from "../supabase";
import {
  buildCourtReportSnapshotDraft,
  type CourtReportDraft,
  type CourtReportSnapshotDraft,
} from "./courtReportBuilderEngine";

export type SaveCourtReportSnapshotInput = {
  report: CourtReportDraft;
  caseId: string;
  ownerId?: string;
  previousSnapshotHash?: string | null;
};

export type SavedCourtReportSnapshot = CourtReportSnapshotDraft & {
  snapshotHash: string;
};

export type CourtReportSnapshotSummary = {
  id: string;
  case_id: string;
  snapshot_hash: string;
  previous_snapshot_hash: string | null;
  report_status: CourtReportDraft["status"];
  ready_for_final_export: boolean;
  created_at: string;
};

export type CourtReportSnapshotChainVerification = {
  valid: boolean;
  snapshotCount: number;
  brokenAtSnapshotId?: string;
  message: string;
};

export async function createCourtReportSnapshotHash(snapshotHashInput: string) {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, snapshotHashInput);
  return `sha256:${digest}`;
}

export async function buildHashedCourtReportSnapshot(
  input: SaveCourtReportSnapshotInput,
): Promise<SavedCourtReportSnapshot> {
  const snapshotDraft = buildCourtReportSnapshotDraft(input.report, {
    caseId: input.caseId,
    ownerId: input.ownerId,
    previousSnapshotHash: input.previousSnapshotHash,
  });

  return {
    ...snapshotDraft,
    snapshotHash: await createCourtReportSnapshotHash(snapshotDraft.snapshotHashInput),
  };
}

export async function fetchLatestCourtReportSnapshot(caseId: string): Promise<CourtReportSnapshotSummary | null> {
  const { data, error } = await supabase
    .from("court_report_snapshots")
    .select("id, case_id, snapshot_hash, previous_snapshot_hash, report_status, ready_for_final_export, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return (data ?? null) as CourtReportSnapshotSummary | null;
}

export async function listCourtReportSnapshotsForCase(caseId: string): Promise<CourtReportSnapshotSummary[]> {
  const { data, error } = await supabase
    .from("court_report_snapshots")
    .select("id, case_id, snapshot_hash, previous_snapshot_hash, report_status, ready_for_final_export, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as CourtReportSnapshotSummary[];
}

export function verifyCourtReportSnapshotChain(
  snapshotsNewestFirst: CourtReportSnapshotSummary[],
): CourtReportSnapshotChainVerification {
  if (snapshotsNewestFirst.length === 0) {
    return {
      valid: true,
      snapshotCount: 0,
      message: "No locked snapshots are attached to this case yet.",
    };
  }

  const hashes = new Set(snapshotsNewestFirst.map((snapshot) => snapshot.snapshot_hash));

  for (let index = 0; index < snapshotsNewestFirst.length - 1; index += 1) {
    const current = snapshotsNewestFirst[index];
    const previous = snapshotsNewestFirst[index + 1];

    if (current.previous_snapshot_hash !== previous.snapshot_hash) {
      return {
        valid: false,
        snapshotCount: snapshotsNewestFirst.length,
        brokenAtSnapshotId: current.id,
        message: `Snapshot ${current.id} does not link to the next older snapshot.`,
      };
    }
  }

  const oldest = snapshotsNewestFirst[snapshotsNewestFirst.length - 1];

  if (oldest.previous_snapshot_hash && !hashes.has(oldest.previous_snapshot_hash)) {
    return {
      valid: false,
      snapshotCount: snapshotsNewestFirst.length,
      brokenAtSnapshotId: oldest.id,
      message: `Oldest visible snapshot ${oldest.id} references a missing previous snapshot.`,
    };
  }

  return {
    valid: true,
    snapshotCount: snapshotsNewestFirst.length,
    message: `${snapshotsNewestFirst.length} locked snapshot${snapshotsNewestFirst.length === 1 ? "" : "s"} verified in sequence.`,
  };
}

export async function verifyCourtReportSnapshotChainForCase(
  caseId: string,
): Promise<CourtReportSnapshotChainVerification> {
  return verifyCourtReportSnapshotChain(await listCourtReportSnapshotsForCase(caseId));
}

export async function saveCourtReportSnapshot(input: SaveCourtReportSnapshotInput): Promise<SavedCourtReportSnapshot> {
  const previousSnapshot = input.previousSnapshotHash === undefined
    ? await fetchLatestCourtReportSnapshot(input.caseId)
    : null;
  const snapshot = await buildHashedCourtReportSnapshot({
    ...input,
    previousSnapshotHash: input.previousSnapshotHash ?? previousSnapshot?.snapshot_hash ?? null,
  });

  const { error } = await supabase.from("court_report_snapshots").insert({
    case_id: snapshot.caseId,
    owner_id: snapshot.ownerId,
    report_title: snapshot.reportTitle,
    version_label: snapshot.versionLabel,
    report_status: snapshot.reportStatus,
    snapshot_payload: snapshot.snapshotPayload,
    snapshot_hash: snapshot.snapshotHash,
    previous_snapshot_hash: snapshot.previousSnapshotHash,
    hash_algorithm: "sha256",
    ready_for_final_export: snapshot.readyForFinalExport,
    export_readiness_blockers: snapshot.exportReadinessBlockers,
  });

  if (error) throw error;

  return snapshot;
}
