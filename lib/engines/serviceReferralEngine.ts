import { supabase } from "../supabase";
import { getSignedInUserId } from "../authSession";

export type ServiceReferralStatus =
  | "referred"
  | "waiting"
  | "engaged"
  | "completed"
  | "declined"
  | "discontinued"
  | "missed"
  | "needs_review";

export type ServiceReferralRecord = {
  id: string;
  case_id: string;
  parent_user_id: string | null;
  worker_user_id: string | null;
  provider_id: string | null;
  service_type: string;
  provider_name: string | null;
  referral_date: string;
  status: ServiceReferralStatus;
  completion_weight: number;
  due_date: string | null;
  first_contact_at: string | null;
  last_attended_at: string | null;
  next_review_at: string | null;
  consent_to_contact_provider: boolean;
  attendance_verified: boolean;
  linked_evidence_id: string | null;
  linked_document_id: string | null;
  notes: string | null;
  review_notes: string;
  alert_generated: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceReferralAlert = {
  referralId: string;
  title: string;
  severity: "moderate" | "high";
  notificationType: "service_referral_alert";
  body: string;
  metadata: Record<string, unknown>;
};

export type ServiceReferralSummary = {
  total: number;
  engagedOrCompleted: number;
  overdue: number;
  needsReview: number;
  attendanceVerified: number;
  providerContactAllowed: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dateOnlyTime(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function daysSinceReferral(referralDate: string, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((today - dateOnlyTime(referralDate)) / MS_PER_DAY);
}

export function referralIsOverdue(
  referral: Pick<ServiceReferralRecord, "due_date" | "status">,
  now = new Date(),
) {
  if (!referral.due_date) return false;
  if (["engaged", "completed", "declined", "discontinued"].includes(referral.status)) return false;
  return dateOnlyTime(referral.due_date) < Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function referralNeedsReview(
  referral: Pick<ServiceReferralRecord, "next_review_at" | "status">,
  now = new Date(),
) {
  if (referral.status === "completed" || referral.status === "declined" || referral.status === "discontinued") {
    return false;
  }
  return referral.status === "needs_review" || (!!referral.next_review_at && new Date(referral.next_review_at) <= now);
}

export function evaluateServiceReferralAlerts(
  referrals: Pick<
    ServiceReferralRecord,
    | "id"
    | "service_type"
    | "provider_name"
    | "referral_date"
    | "status"
    | "due_date"
    | "next_review_at"
    | "attendance_verified"
    | "consent_to_contact_provider"
  >[],
  now = new Date(),
): ServiceReferralAlert[] {
  return referrals.flatMap((referral) => {
    const alerts: ServiceReferralAlert[] = [];
    const label = referral.provider_name ? `${referral.service_type} with ${referral.provider_name}` : referral.service_type;

    if (referralIsOverdue(referral, now)) {
      alerts.push({
        referralId: referral.id,
        title: "Referral overdue",
        severity: "high",
        notificationType: "service_referral_alert",
        body: `${label} is past the expected follow-up date and needs worker review.`,
        metadata: { reason: "overdue", dueDate: referral.due_date },
      });
    }

    if (referralNeedsReview(referral, now)) {
      alerts.push({
        referralId: referral.id,
        title: "Referral review due",
        severity: "moderate",
        notificationType: "service_referral_alert",
        body: `${label} is due for a progress review.`,
        metadata: { reason: "review_due", nextReviewAt: referral.next_review_at },
      });
    }

    if (referral.status === "engaged" && !referral.attendance_verified) {
      alerts.push({
        referralId: referral.id,
        title: "Attendance evidence needed",
        severity: "moderate",
        notificationType: "service_referral_alert",
        body: `${label} is marked engaged but attendance has not been verified.`,
        metadata: { reason: "attendance_unverified" },
      });
    }

    if (daysSinceReferral(referral.referral_date, now) >= 14 && referral.status === "referred") {
      alerts.push({
        referralId: referral.id,
        title: "Referral still unconfirmed",
        severity: "moderate",
        notificationType: "service_referral_alert",
        body: `${label} has no confirmed engagement after 14 days.`,
        metadata: { reason: "stale_referred" },
      });
    }

    return alerts;
  });
}

export function createServiceReferralSummary(
  referrals: Pick<
    ServiceReferralRecord,
    "status" | "due_date" | "next_review_at" | "attendance_verified" | "consent_to_contact_provider"
  >[],
  now = new Date(),
): ServiceReferralSummary {
  return {
    total: referrals.length,
    engagedOrCompleted: referrals.filter((referral) => referral.status === "engaged" || referral.status === "completed").length,
    overdue: referrals.filter((referral) => referralIsOverdue(referral, now)).length,
    needsReview: referrals.filter((referral) => referralNeedsReview(referral, now)).length,
    attendanceVerified: referrals.filter((referral) => referral.attendance_verified).length,
    providerContactAllowed: referrals.filter((referral) => referral.consent_to_contact_provider).length,
  };
}

export function buildReferralEvidenceNote(referral: Pick<ServiceReferralRecord, "service_type" | "provider_name" | "status" | "attendance_verified">) {
  const provider = referral.provider_name ?? "provider not recorded";
  const verification = referral.attendance_verified ? "attendance verified" : "attendance not yet verified";
  return `${referral.service_type} referral - ${provider}; status ${referral.status}; ${verification}.`;
}

export async function listCaseServiceReferrals(caseId: string) {
  const { data, error } = await supabase
    .from("case_service_referrals")
    .select("*")
    .eq("case_id", caseId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ServiceReferralRecord[];
}

export async function createCaseServiceReferral(input: {
  caseId: string;
  parentUserId?: string | null;
  workerUserId?: string | null;
  serviceType: string;
  providerName?: string | null;
  dueDate?: string | null;
  consentToContactProvider?: boolean;
}) {
  const userId = await getSignedInUserId("creating a service referral");
  const { data, error } = await supabase
    .from("case_service_referrals")
    .insert({
      case_id: input.caseId,
      parent_user_id: input.parentUserId ?? null,
      worker_user_id: input.workerUserId ?? userId,
      service_type: input.serviceType,
      provider_name: input.providerName ?? null,
      due_date: input.dueDate ?? null,
      consent_to_contact_provider: input.consentToContactProvider ?? false,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ServiceReferralRecord;
}

export async function updateCaseServiceReferralStatus(input: {
  referralId: string;
  status: ServiceReferralStatus;
  reviewNotes?: string;
  attendanceVerified?: boolean;
  linkedEvidenceId?: string | null;
  linkedDocumentId?: string | null;
}) {
  const { data, error } = await supabase
    .from("case_service_referrals")
    .update({
      status: input.status,
      review_notes: input.reviewNotes ?? "",
      attendance_verified: input.attendanceVerified ?? false,
      linked_evidence_id: input.linkedEvidenceId ?? null,
      linked_document_id: input.linkedDocumentId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.referralId)
    .select("*")
    .single();

  if (error) throw error;
  return data as ServiceReferralRecord;
}
