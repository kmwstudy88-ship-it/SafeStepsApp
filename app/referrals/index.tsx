import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useSensitiveAccess } from "../../components/security/SensitiveRouteBoundary";
import {
  createServiceReferralSummary,
  evaluateServiceReferralAlerts,
  listCaseServiceReferrals,
  type ServiceReferralRecord,
} from "../../lib/engines/serviceReferralEngine";

export default function ReferralsScreen() {
  const access = useSensitiveAccess();
  const caseId = access?.caseId ?? null;
  const [referrals, setReferrals] = useState<ServiceReferralRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const summary = createServiceReferralSummary(referrals);
  const alerts = evaluateServiceReferralAlerts(referrals);

  const loadReferrals = useCallback(async () => {
    if (!caseId) {
      setReferrals([]);
      setErrorMessage("An authorised case must be selected before referrals can be loaded.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      setReferrals(await listCaseServiceReferrals(caseId));
    } catch (error) {
      setReferrals([]);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load case referrals.");
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Service Referrals</Text>
        <Text style={styles.title}>Follow-up, attendance evidence, and provider-contact consent</Text>
        <Text style={styles.subtitle}>
          Referrals are loaded only from the authorised case selected for this account. Alerts remain human-review prompts and never become automatic decisions.
        </Text>
      </View>

      <View style={styles.casePanel}>
        <Text style={styles.emptyTitle}>Authorised case</Text>
        <Text style={styles.rowText}>{caseId ?? "No active case is available."}</Text>
        <Pressable style={styles.button} onPress={loadReferrals} disabled={isLoading || !caseId}>
          <Text style={styles.buttonText}>{isLoading ? "Loading..." : "Refresh referrals"}</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      {referrals.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Referral summary</Text>
          <View style={styles.summaryGrid}>
            <Metric label="Total" value={summary.total} />
            <Metric label="Engaged" value={summary.engagedOrCompleted} />
            <Metric label="Overdue" value={summary.overdue} />
            <Metric label="Review" value={summary.needsReview} />
          </View>
          {alerts.length > 0 ? (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>Human-review prompts</Text>
              {alerts.map((alert) => (
                <Text key={`${alert.referralId}-${alert.title}`} style={styles.rowText}>
                  - {alert.body}
                </Text>
              ))}
            </View>
          ) : null}
          {referrals.map((referral) => (
            <View key={referral.id} style={styles.recordRow}>
              <Text style={styles.recordTitle}>{referral.service_type}</Text>
              <Text style={styles.rowText}>
                {referral.provider_name ?? "Provider not recorded"} - {referral.status}
                {referral.due_date ? ` - due ${referral.due_date}` : ""}
              </Text>
              <Text style={styles.rowText}>
                {referral.consent_to_contact_provider
                  ? "Provider contact consent recorded."
                  : "Provider contact consent not recorded."}
                {referral.attendance_verified ? " Attendance verified." : " Attendance not verified."}
              </Text>
            </View>
          ))}
        </View>
      ) : !isLoading && !errorMessage ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>No referrals recorded</Text>
          <Text style={styles.rowText}>This authorised case does not currently have service referral records.</Text>
        </View>
      ) : null}

      <View style={styles.checklist}>
        <Text style={styles.sectionTitle}>Referral review must preserve</Text>
        <Text style={styles.rowText}>- Consent before provider contact.</Text>
        <Text style={styles.rowText}>- Attendance evidence separate from parent self-report.</Text>
        <Text style={styles.rowText}>- Overdue follow-up prompts as human-review cues only.</Text>
        <Text style={styles.rowText}>- Links to evidence, documents, and assessment domains before report use.</Text>
      </View>

      <Link href="/assessment-system" style={styles.link}>
        Back to assessment system
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7F4" },
  content: { gap: 18, padding: 20, paddingBottom: 44 },
  header: { gap: 8 },
  eyebrow: { color: "#2563EB", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#17211D", fontSize: 28, fontWeight: "900", lineHeight: 34 },
  subtitle: { color: "#56615B", fontSize: 15, lineHeight: 22 },
  casePanel: {
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E1DA",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  emptyTitle: { color: "#17211D", fontSize: 18, fontWeight: "900" },
  checklist: {
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E1DA",
    backgroundColor: "#EFF6FF",
    padding: 14,
  },
  card: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E1DA",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  errorText: { color: "#B42318", fontSize: 14, fontWeight: "800" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { minWidth: 112, gap: 3, borderRadius: 8, backgroundColor: "#F5F7F4", padding: 10 },
  metricValue: { color: "#17211D", fontSize: 22, fontWeight: "900" },
  metricLabel: { color: "#56615B", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  alertBox: { gap: 6, borderRadius: 8, backgroundColor: "#FFF7ED", padding: 10 },
  alertTitle: { color: "#9A3412", fontWeight: "900" },
  recordRow: { gap: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#E6ECE8" },
  recordTitle: { color: "#17211D", fontSize: 16, fontWeight: "900" },
  sectionTitle: { color: "#17211D", fontSize: 18, fontWeight: "900" },
  rowText: { color: "#56615B", fontSize: 14, lineHeight: 20 },
  link: { color: "#2563EB", fontSize: 15, fontWeight: "900" },
});

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
