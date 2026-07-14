import {
  buildReferralEvidenceNote,
  createServiceReferralSummary,
  daysSinceReferral,
  evaluateServiceReferralAlerts,
  referralIsOverdue,
  referralNeedsReview,
  type ServiceReferralRecord,
} from "../lib/engines/serviceReferralEngine";

const now = new Date("2026-07-12T00:00:00.000Z");

function referralFixture(overrides: Partial<ServiceReferralRecord>): ServiceReferralRecord {
  return {
    id: "referral-1",
    case_id: "case-1",
    parent_user_id: null,
    worker_user_id: null,
    provider_id: null,
    service_type: "Parenting support",
    provider_name: "Family Service",
    referral_date: "2026-07-01",
    status: "referred",
    completion_weight: 1,
    due_date: null,
    first_contact_at: null,
    last_attended_at: null,
    next_review_at: null,
    consent_to_contact_provider: false,
    attendance_verified: false,
    linked_evidence_id: null,
    linked_document_id: null,
    notes: null,
    review_notes: "",
    alert_generated: false,
    created_by: null,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("serviceReferralEngine", () => {
  test("detects overdue referrals without flagging completed or declined records", () => {
    expect(referralIsOverdue(referralFixture({ due_date: "2026-07-10" }), now)).toBe(true);
    expect(referralIsOverdue(referralFixture({ due_date: "2026-07-10", status: "completed" }), now)).toBe(false);
    expect(referralIsOverdue(referralFixture({ due_date: "2026-07-10", status: "declined" }), now)).toBe(false);
  });

  test("detects referral review due dates and explicit review status", () => {
    expect(referralNeedsReview(referralFixture({ next_review_at: "2026-07-12T00:00:00.000Z" }), now)).toBe(true);
    expect(referralNeedsReview(referralFixture({ status: "needs_review" }), now)).toBe(true);
    expect(referralNeedsReview(referralFixture({ status: "completed", next_review_at: "2026-07-01T00:00:00.000Z" }), now)).toBe(false);
  });

  test("generates service referral alerts for overdue, review due, unverified attendance, and stale referrals", () => {
    const alerts = evaluateServiceReferralAlerts(
      [
        referralFixture({ id: "overdue", due_date: "2026-07-05" }),
        referralFixture({ id: "review", next_review_at: "2026-07-12T00:00:00.000Z" }),
        referralFixture({ id: "engaged", status: "engaged", attendance_verified: false }),
        referralFixture({ id: "stale", referral_date: "2026-06-20" }),
      ],
      now,
    );

    expect(alerts.map((alert) => alert.notificationType)).toEqual([
      "service_referral_alert",
      "service_referral_alert",
      "service_referral_alert",
      "service_referral_alert",
    ]);
    expect(alerts.some((alert) => alert.severity === "high")).toBe(true);
  });

  test("summarizes referral follow-up for case review", () => {
    const summary = createServiceReferralSummary(
      [
        referralFixture({ status: "engaged", attendance_verified: true, consent_to_contact_provider: true }),
        referralFixture({ status: "completed", attendance_verified: true }),
        referralFixture({ status: "referred", due_date: "2026-07-05" }),
        referralFixture({ status: "needs_review" }),
      ],
      now,
    );

    expect(summary).toEqual({
      total: 4,
      engagedOrCompleted: 2,
      overdue: 1,
      needsReview: 1,
      attendanceVerified: 2,
      providerContactAllowed: 1,
    });
  });

  test("builds neutral evidence notes and day counts", () => {
    expect(daysSinceReferral("2026-07-01", now)).toBe(11);
    expect(buildReferralEvidenceNote(referralFixture({ status: "engaged", attendance_verified: true }))).toBe(
      "Parenting support referral - Family Service; status engaged; attendance verified.",
    );
  });
});
