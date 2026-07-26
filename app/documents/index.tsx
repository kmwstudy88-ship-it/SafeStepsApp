import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  createDocumentManagementSummary,
  evaluateDocumentExpiryAlerts,
  listCaseDocuments,
  type CaseDocumentRecord,
  type CaseDocumentRequest,
} from "../../lib/engines/documentManagementEngine";

export default function DocumentsScreen() {
  const [caseId, setCaseId] = useState("");
  const [documents, setDocuments] = useState<CaseDocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const summary = createDocumentManagementSummary(documents, [] as CaseDocumentRequest[]);
  const alerts = evaluateDocumentExpiryAlerts(documents);

  async function loadDocuments() {
    const trimmedCaseId = caseId.trim();
    if (!trimmedCaseId) {
      setErrorMessage("Enter a case ID before loading documents.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      setDocuments(await listCaseDocuments(trimmedCaseId));
    } catch (error) {
      setDocuments([]);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load case documents.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Document Management</Text>
        <Text style={styles.title}>Requests, versions, expiry checks, and report-ready evidence</Text>
        <Text style={styles.subtitle}>
          Keep case documents tied to evidence records, assessment domains, and report appendices without treating uploads
          as verified facts until a worker reviews them.
        </Text>
      </View>

      <View style={styles.intelligencePanel}>
        <View style={styles.intelligenceCopy}>
          <Text style={styles.intelligenceTitle}>Document Intelligence</Text>
          <Text style={styles.rowText}>
            Paste or upload document text for worker review across parent capacity, child wellbeing, safety, evidence
            quality, and caseworker-context signals.
          </Text>
        </View>
        <Link href="/assessment-system/document-intelligence" style={styles.actionLink}>
          Open analysis
        </Link>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Load live case documents</Text>
        <Text style={styles.rowText}>
          Enter a case ID to read document status, expiry dates, review state, linked evidence, and report-appendix
          selections from the case database.
        </Text>
        <TextInput
          value={caseId}
          onChangeText={setCaseId}
          placeholder="Case ID"
          placeholderTextColor="#6B7A76"
          style={styles.input}
        />
        <Pressable style={styles.button} onPress={loadDocuments} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "Loading..." : "Load documents"}</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      {documents.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Document summary</Text>
          <View style={styles.summaryGrid}>
            <Metric label="Total" value={summary.totalDocuments} />
            <Metric label="Accepted" value={summary.acceptedDocuments} />
            <Metric label="Needs update" value={summary.needsUpdate} />
            <Metric label="Report ready" value={summary.reportReadyDocuments} />
          </View>
          {alerts.length > 0 ? (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>Expiry review prompts</Text>
              {alerts.map((alert) => (
                <Text key={alert.documentId} style={styles.rowText}>
                  - {alert.body}
                </Text>
              ))}
            </View>
          ) : null}
          {documents.map((document) => (
            <View key={document.id} style={styles.recordRow}>
              <Text style={styles.recordTitle}>{document.title}</Text>
              <Text style={styles.rowText}>
                {document.document_type} - {document.status}
                {document.expiry_date ? ` - expires ${document.expiry_date}` : ""}
              </Text>
              <Text style={styles.rowText}>
                {document.court_report_include ? "Selected for report appendix after review." : "Not selected for report appendix."}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <Link href="/assessment-system" style={styles.link}>
        Back to assessment system
      </Link>
    </ScrollView>
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
  intelligencePanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7D8CE",
    backgroundColor: "#E7F3F0",
    padding: 14,
  },
  intelligenceCopy: {
    flexGrow: 1,
    flexBasis: 260,
    gap: 6,
  },
  intelligenceTitle: {
    color: "#0F766E",
    fontSize: 17,
    fontWeight: "900",
  },
  actionLink: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#0F766E",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "900",
  },
  rowText: {
    color: "#52615D",
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E3DF",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  emptyTitle: {
    color: "#14231F",
    fontSize: 18,
    fontWeight: "900",
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#D8E3DF",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FBFDFB",
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#0F766E",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  errorText: {
    color: "#B42318",
    fontSize: 14,
    fontWeight: "800",
  },
  card: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E3DF",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    minWidth: 118,
    gap: 3,
    borderRadius: 8,
    backgroundColor: "#F4F7F6",
    padding: 10,
  },
  metricValue: {
    color: "#14231F",
    fontSize: 22,
    fontWeight: "900",
  },
  metricLabel: {
    color: "#52615D",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  alertBox: {
    gap: 6,
    borderRadius: 8,
    backgroundColor: "#FFF7ED",
    padding: 10,
  },
  alertTitle: {
    color: "#9A3412",
    fontWeight: "900",
  },
  recordRow: {
    gap: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  recordTitle: {
    color: "#14231F",
    fontSize: 16,
    fontWeight: "900",
  },
  link: {
    color: "#0F766E",
    fontSize: 15,
    fontWeight: "900",
  },
});

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
