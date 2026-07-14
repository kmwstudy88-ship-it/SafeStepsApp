import { Link } from "expo-router";
import type React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  buildDocumentStoragePath,
  createDocumentManagementSummary,
  evaluateDocumentExpiryAlerts,
  nextDocumentVersionNumber,
  type CaseDocumentRecord,
  type CaseDocumentRequest,
  type CaseDocumentVersion,
} from "../../lib/engines/documentManagementEngine";

const now = new Date("2026-07-12T00:00:00.000Z");

const sampleDocuments: CaseDocumentRecord[] = [
  {
    id: "doc-tenancy",
    case_id: "case-demo",
    parent_user_id: null,
    worker_user_id: null,
    current_version_id: "version-2",
    linked_evidence_id: "evidence-tenancy",
    linked_assessment_id: "assessment-home-stability",
    document_type: "tenancy_agreement",
    title: "Tenancy agreement",
    status: "accepted",
    expiry_date: "2026-07-20",
    court_report_include: true,
    notes: "Linked to home stability evidence and report appendix.",
    created_by: null,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z",
  },
  {
    id: "doc-service-letter",
    case_id: "case-demo",
    parent_user_id: null,
    worker_user_id: null,
    current_version_id: "version-1",
    linked_evidence_id: null,
    linked_assessment_id: "assessment-services",
    document_type: "service_letter",
    title: "Parenting service attendance letter",
    status: "needs_update",
    expiry_date: null,
    court_report_include: false,
    notes: "Current copy does not cover the latest attendance period.",
    created_by: null,
    created_at: "2026-07-02T00:00:00.000Z",
    updated_at: "2026-07-09T00:00:00.000Z",
  },
  {
    id: "doc-financial",
    case_id: "case-demo",
    parent_user_id: null,
    worker_user_id: null,
    current_version_id: null,
    linked_evidence_id: null,
    linked_assessment_id: null,
    document_type: "financial",
    title: "Income and budgeting statement",
    status: "requested",
    expiry_date: "2026-07-10",
    court_report_include: false,
    notes: "Requested for financial stability review.",
    created_by: null,
    created_at: "2026-07-06T00:00:00.000Z",
    updated_at: "2026-07-06T00:00:00.000Z",
  },
];

const sampleRequests: CaseDocumentRequest[] = [
  {
    id: "request-financial",
    case_id: "case-demo",
    document_id: "doc-financial",
    parent_user_id: null,
    requested_by: null,
    document_type: "financial",
    title: "Income and budgeting statement",
    reason: "Required before next readiness review.",
    due_at: "2026-07-15T00:00:00.000Z",
    status: "requested",
    created_at: "2026-07-06T00:00:00.000Z",
    fulfilled_at: null,
  },
];

const sampleVersions: CaseDocumentVersion[] = [
  {
    id: "version-1",
    document_id: "doc-tenancy",
    version_number: 1,
    file_path: "case-documents/case-demo/doc-tenancy/v1-tenancy.pdf",
    file_name: "tenancy.pdf",
    mime_type: "application/pdf",
    file_sha256: "b2c2f4a1",
    uploaded_by: null,
    uploaded_at: "2026-07-01T00:00:00.000Z",
    review_status: "needs_update",
    review_notes: "Older copy.",
  },
  {
    id: "version-2",
    document_id: "doc-tenancy",
    version_number: 2,
    file_path: "case-documents/case-demo/doc-tenancy/v2-tenancy-renewal.pdf",
    file_name: "tenancy-renewal.pdf",
    mime_type: "application/pdf",
    file_sha256: "f6b805d2",
    uploaded_by: null,
    uploaded_at: "2026-07-08T00:00:00.000Z",
    review_status: "accepted",
    review_notes: "Current lease period confirmed.",
  },
];

export default function DocumentsScreen() {
  const summary = createDocumentManagementSummary(sampleDocuments, sampleRequests, now);
  const alerts = evaluateDocumentExpiryAlerts(sampleDocuments, now);
  const nextVersion = nextDocumentVersionNumber(sampleVersions);
  const nextStoragePath = buildDocumentStoragePath({
    caseId: "case-demo",
    documentId: "doc-tenancy",
    versionNumber: nextVersion,
    fileName: "tenancy renewal signed.pdf",
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Document Management</Text>
        <Text style={styles.title}>Requests, versions, expiry checks, and report-ready evidence</Text>
        <Text style={styles.subtitle}>
          Keep case documents tied to evidence records, assessment domains, and report appendices without treating uploads as
          verified facts until a worker reviews them.
        </Text>
      </View>

      <View style={styles.demoNotice}>
        <Text style={styles.demoTitle}>Example records only</Text>
        <Text style={styles.subtitle}>
          This screen is showing sample document records to verify expiry, version, and report-linking logic. It must be connected to live case documents before production use.
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <Metric label="Documents" value={summary.totalDocuments} />
        <Metric label="Accepted" value={summary.acceptedDocuments} />
        <Metric label="Needs update" value={summary.needsUpdate} />
        <Metric label="Expiry alerts" value={summary.expiringOrExpired} />
        <Metric label="Open requests" value={summary.openRequests} />
        <Metric label="Report ready" value={summary.reportReadyDocuments} />
      </View>

      <Section title="Example Expiry Review">
        {alerts.map((alert) => (
          <View key={alert.documentId} style={[styles.row, alert.severity === "high" && styles.highRow]}>
            <Text style={styles.rowTitle}>{alert.title}</Text>
            <Text style={styles.rowText}>{alert.body}</Text>
            <Text style={styles.badge}>{alert.severity.toUpperCase()}</Text>
          </View>
        ))}
      </Section>

      <Section title="Example Active Documents">
        {sampleDocuments.map((document) => (
          <View key={document.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{document.title}</Text>
              <Text style={styles.status}>{document.status.replace("_", " ")}</Text>
            </View>
            <Text style={styles.rowText}>{document.notes}</Text>
            <Text style={styles.meta}>
              Assessment link: {document.linked_assessment_id ?? "Not linked"} · Evidence link:{" "}
              {document.linked_evidence_id ?? "Not linked"}
            </Text>
          </View>
        ))}
      </Section>

      <Section title="Example Version Trail">
        {sampleVersions.map((version) => (
          <View key={version.id} style={styles.row}>
            <Text style={styles.rowTitle}>Version {version.version_number}</Text>
            <Text style={styles.rowText}>{version.file_name}</Text>
            <Text style={styles.meta}>Hash: {version.file_sha256 ?? "Not recorded"} · {version.review_status}</Text>
          </View>
        ))}
        <View style={styles.pathBox}>
          <Text style={styles.pathLabel}>Next app-controlled path</Text>
          <Text style={styles.path}>{nextStoragePath}</Text>
        </View>
      </Section>

      <Section title="Example Open Requests">
        {sampleRequests.map((request) => (
          <View key={request.id} style={styles.row}>
            <Text style={styles.rowTitle}>{request.title}</Text>
            <Text style={styles.rowText}>{request.reason}</Text>
            <Text style={styles.meta}>Due: {request.due_at ? new Date(request.due_at).toLocaleDateString() : "No due date"}</Text>
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
    backgroundColor: "#F4F7F6",
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
    color: "#0F766E",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#14231F",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  subtitle: {
    color: "#52615D",
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
    borderColor: "#D8E3DF",
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
    color: "#14231F",
    fontSize: 24,
    fontWeight: "900",
  },
  metricLabel: {
    color: "#52615D",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: "#14231F",
    fontSize: 18,
    fontWeight: "900",
  },
  row: {
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E3DF",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  highRow: {
    borderColor: "#D97706",
    backgroundColor: "#FFF7ED",
  },
  rowHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: {
    color: "#14231F",
    fontSize: 16,
    fontWeight: "900",
  },
  rowText: {
    color: "#52615D",
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900",
  },
  status: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#DCFCE7",
    color: "#166534",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  meta: {
    color: "#697773",
    fontSize: 12,
    lineHeight: 18,
  },
  pathBox: {
    gap: 6,
    borderRadius: 8,
    backgroundColor: "#E7F3F0",
    padding: 12,
  },
  pathLabel: {
    color: "#0F766E",
    fontSize: 12,
    fontWeight: "900",
  },
  path: {
    color: "#14231F",
    fontSize: 12,
    fontWeight: "700",
  },
  link: {
    color: "#0F766E",
    fontSize: 15,
    fontWeight: "900",
  },
});
