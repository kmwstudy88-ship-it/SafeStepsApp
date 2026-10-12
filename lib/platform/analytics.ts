import { supabase } from "../supabase";
import type { ReviewMetrics, ReviewType, SnapshotComparison } from "./types";

type ReviewSnapshot = {
  id: string;
  enrolment_id: string;
  user_id: string;
  review_type: ReviewType;
  review_month: number | null;
  metrics: ReviewMetrics | null;
  narrative: string | null;
  created_by: string | null;
  created_at: string;
};

export function compareSnapshotMetrics(baseline: ReviewMetrics, latest: ReviewMetrics): SnapshotComparison[] {
  const keys = Array.from(new Set([...Object.keys(baseline), ...Object.keys(latest)])).sort();

  return keys.map((key) => {
    const start = baseline[key] ?? null;
    const end = latest[key] ?? null;
    const difference = typeof start === "number" && typeof end === "number" ? end - start : null;
    return { key, baseline: start, latest: end, difference };
  });
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("You must be signed in.");
  return data.user.id;
}

export async function saveReviewSnapshot(input: {
  enrolmentId: string;
  reviewType: ReviewType;
  reviewMonth?: number;
  metrics: ReviewMetrics;
  narrative?: string;
}) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("review_snapshots")
    .insert({
      enrolment_id: input.enrolmentId,
      user_id: userId,
      review_type: input.reviewType,
      review_month: input.reviewMonth ?? null,
      metrics: input.metrics,
      narrative: input.narrative ?? null,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listReviewSnapshots(enrolmentId: string) {
  const { data, error } = await supabase
    .from("review_snapshots")
    .select("*")
    .eq("enrolment_id", enrolmentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReviewSnapshot[];
}

export async function buildLongitudinalComparison(enrolmentId: string) {
  const snapshots = await listReviewSnapshots(enrolmentId);
  const baseline = snapshots.find((item) => item.review_type === "baseline");
  const latest = [...snapshots].reverse().find((item) => item.review_type === "final_review" || item.review_type === "month_review");

  if (!baseline || !latest) {
    return { snapshots, comparison: [] as SnapshotComparison[] };
  }

  return {
    snapshots,
    comparison: compareSnapshotMetrics(baseline.metrics ?? {}, latest.metrics ?? {}),
  };
}
