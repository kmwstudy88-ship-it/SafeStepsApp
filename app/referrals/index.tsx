import { Link } from "expo-router";
import type React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  buildReferralEvidenceNote,
  createServiceReferralSummary,
  evaluateServiceReferralAlerts,
  type ServiceReferralRecord,
} from "../../lib/engines/serviceReferralEngine";

const now = new Date("2026-07-12T00:00:00.000Z");

const sampleReferrals: ServiceReferralRecord[] = [
  {
    id: "referral-parenting",
    case_id: "case-demo",
    parent_user_id: null,
    worker_user_id: null,
    provider_id: null,
    service_type: "Parenting support",
    provider_name: "Community Family Service",
    referral_date: "2026-06-20",
    status: "engaged",
    completion_weight: 1,
    due_date: "2026-07-05",
    first_contact_at: "2026-06-23T00:00:00.000Z",
    last_attended_at: "2026-07-03T00:00:00.000Z",
    next_review_at: "2026-07-12T00:00:00.000Z",
    consent_to_contact_provider: true,
    attendance_verified: false,
    linked_evidence_id: null,
    linked_document_id: "doc-service-letter",
    notes: "Parent reports attendance has started.",
    review_notes: "",
    alert_generated: false,
    created_by: null,
    created_at: "2026-06-20T00:00:00.000Z",
    updated_at: "2026-07-03T00:00:00.000Z",
  },
  {
    id: "referral-budget",
    case_id: "case-demo",
    parent_user_id: null,
    worker_user_id: null,
    provider_id: null,
    service_type: "Financial counselling",
    provider_name: "Money Help Centre",
    referral_date: "2026-06-24",
    status: "referred",
    completion_weight: 0.8,
    due_date: "2026-07-06",
    first_contact_at: null,
    last_attended_at: null,
    next_review_at: null,
    consent_to_contact_provider: false,
    attendance_verified: false,
    linked_evidence_id: null,
    linked_document_id: null,
    notes: "Referral sent; parent has not confirmed appointment.",
    review_notes: "",
    alert_generated: false,
    created_by: null,
    created_at: "2026-06-24T00:00:00.000Z",
    updated_at: "2026-06-24T00:00:00.000Z",
  },
  {
    id: "referral-legal",
    case_id: "case-demo",
    parent_user_id: null,
    worker_user_id: null,
    provider_id: null,
    service_type: "Legal advice",
    provider_name: "Community Legal Clinic",
    referral_date: "2026-07-01",
    status: "completed",
    completion_weight: 0.7,
    due_date: "2026-07-10",
    first_contact_at: "2026-07-02T00:00:00.000Z",
    last_attended_at: "2026-07-08T00:00:00.000Z",
    next_review_at: null,
    consent_to_contact_provider: true,
    attendance_verified: true,
    linked_evidence_id: "evidence-legal-letter",
    linked_document_id: "doc-legal-letter",
    notes: "Attendance letter uploaded.",
    review_notes: "No further legal follow-up required this review period.",
    alert_generated: false,
    created_by: null,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z",
  },
];

export default function ReferralsScreen() {
  const summary = createServiceReferralSummary(sampleReferrals, now);
  const alerts = evaluateServiceReferralAlerts(sampleReferrals, now);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Service Referrals</Text>
        <Text style={styles.title}>Follow-up, attendance evidence, and provider-contact consent</Text>
        <Text style={styles.subtitle}>
          Track referrals as review evidence. Alerts are prompts for workers and supervisors, not automatic decisions.
        </Text>
      </View>

      <View style={styles.demoNotice}>
        <Text style={styles.demoTitle}>Example records only</Text>
        <Text style={styles.subtitle}>
          The referrals shown here are sample records for checking review prompts and evidence-linking behavior. Live referral data must come from the case database before production use.
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <Metric label="Total" value={summary.total} />
        <Metric label="Engaged or done" value={summary.engagedOrCompleted} />
        <Metric label="Overdue" value={summary.overdue} />
        <Metric label="Review due" value={summary.needsReview} />
        <Metric label="Verified" value={summary.attendanceVerified} />
        <Metric label="Consent" value={summary.providerContactAllowed} />
      </View>

      <Section title="Example Review Prompts">
        {alerts.map((alert) => (
          <View key={`${alert.referralId}-${alert.metadata.reason}`} style={[styles.row, alert.severity === "high" && styles.highRow]}>
            <Text style={styles.rowTitle}>{alert.title}</Text>
            <Text style={styles.rowText}>{alert.body}</Text>
            <Text style={styles.badge}>{alert.severity.toUpperCase()}</Text>
          </View>
        ))}
      </Section>

      <Section title="Example Referral Status">
        {sampleReferrals.map((referral) => (
          <View key={referral.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{referral.service_type}</Text>
              <Text style={styles.status}>{referral.status.replace("_", " ")}</Text>
            </View>
            <Text style={styles.rowText}>{referral.provider_name ?? "Provider not recorded"}</Text>
            <Text style={styles.meta}>
              Contact consent: {referral.consent_to_contact_provider ? "Yes" : "No"} · Attendance:{" "}
              {referral.attendance_verified ? "Verified" : "Not verified"}
            </Text>
            <Text style={styles.note}>{buildReferralEvidenceNote(referral)}</Text>
          </View>
        ))}
      </Section>

      <Section title="Example Evidence Links">
        {sampleReferrals.map((referral) => (
          <View key={`${referral.id}-links`} style={styles.row}>
            <Text style={styles.rowTitle}>{referral.service_type}</Text>
            <Text style={styles.meta}>Evidence: {referral.linked_evidence_id ?? "Not linked"}</Text>
            <Text style={styles.meta}>Document: {referral.linked_document_id ?? "Not linked"}</Text>
          </View>
        ))}
      </Section>

      <Link href="/assessment-system" style={styles.link}>
        Back to assessment system
      </Link>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7F4",
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 44,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#17211D",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  subtitle: {
    color: "#56615B",
    fontSize: 15,
    lineHeight: 22,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    minWidth: 130,
    flexGrow: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E1DA",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  demoNotice: {
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B45309",
    backgroundColor: "#FFFBEB",
    padding: 14,
  },
  demoTitle: {
    color: "#92400E",
    fontSize: 16,
    fontWeight: "900",
  },
  metricValue: {
    color: "#17211D",
    fontSize: 24,
    fontWeight: "900",
  },
  metricLabel: {
    color: "#56615B",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: "#17211D",
    fontSize: 18,
    fontWeight: "900",
  },
  row: {
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E1DA",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  highRow: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  rowHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: {
    color: "#17211D",
    fontSize: 16,
    fontWeight: "900",
  },
  rowText: {
    color: "#56615B",
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900",
  },
  status: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  meta: {
    color: "#68736D",
    fontSize: 12,
    lineHeight: 18,
  },
  note: {
    color: "#17211D",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#EEF6F2",
    padding: 10,
    fontSize: 13,
    lineHeight: 19,
  },
  link: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "900",
  },
});
