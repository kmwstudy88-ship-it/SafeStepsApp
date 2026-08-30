import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { AppBottomNav } from "../../../components/AppBottomNav";
import { globalStyles } from "../../../lib/styles";
import { supabase } from "../../../lib/supabase";

type ReportSection = {
  heading: string;
  body: string;
  evidenceCount?: number;
};

type AssessmentReport = {
  id: string;
  title: string;
  report_type: string;
  status: string;
  created_at: string;
  overall_score: number | null;
  band_label: string | null;
  sections: ReportSection[];
  limitations: string | null;
  worker_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
};

export default function AssessmentReportScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase
        .from("assessment_reports")
        .select(
          "id, title, report_type, status, created_at, overall_score, band_label, sections, limitations, worker_notes, approved_by, approved_at",
        )
        .eq("id", reportId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setMessage("Report not found.");
        return;
      }

      setReport(data as AssessmentReport);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load report.");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={globalStyles.screen}>
        <ActivityIndicator />
        <AppBottomNav />
      </ScrollView>
    );
  }

  if (message || !report) {
    return (
      <ScrollView contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.error}>{message || "Report not found."}</Text>
        <AppBottomNav />
      </ScrollView>
    );
  }

  const sections: ReportSection[] = Array.isArray(report.sections) ? report.sections : [];

  return (
    <ScrollView contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>{report.title}</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Report details</Text>
        <Text style={globalStyles.cardText}>
          Type: {report.report_type.replace(/_/g, " ")}
        </Text>
        <Text style={globalStyles.cardText}>Status: {report.status}</Text>
        <Text style={globalStyles.cardText}>
          Created:{" "}
          {new Date(report.created_at).toLocaleDateString("en-AU", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Text>
        {report.overall_score !== null ? (
          <Text style={globalStyles.cardText}>
            Overall score: {report.overall_score}
            {report.band_label ? ` (${report.band_label})` : ""}
          </Text>
        ) : null}
        {report.approved_by ? (
          <Text style={globalStyles.notice}>
            Approved by {report.approved_by}
            {report.approved_at
              ? ` on ${new Date(report.approved_at).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })}`
              : ""}
          </Text>
        ) : null}
      </View>

      {sections.length > 0 ? (
        sections.map((section, index) => (
          <View key={index} style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>{section.heading}</Text>
            <Text style={globalStyles.cardText}>{section.body}</Text>
            {section.evidenceCount !== undefined && section.evidenceCount > 0 ? (
              <Text style={globalStyles.cardText}>
                Evidence items: {section.evidenceCount}
              </Text>
            ) : null}
          </View>
        ))
      ) : (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardText}>This report has no sections recorded.</Text>
        </View>
      )}

      {report.limitations ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Limits of this report</Text>
          <Text style={globalStyles.cardText}>{report.limitations}</Text>
        </View>
      ) : null}

      {report.worker_notes ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Worker notes</Text>
          <Text style={globalStyles.cardText}>{report.worker_notes}</Text>
        </View>
      ) : null}

      <AppBottomNav />
    </ScrollView>
  );
}
