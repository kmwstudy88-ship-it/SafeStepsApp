import { Link, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { AppBottomNav } from "../../components/AppBottomNav";
import { TrajectorySummary } from "../../components/assessments/TrajectorySummary";
import { useAuth } from "../../lib/auth";
import {
  summarizeDomainTrajectory,
  type DomainScore,
  type LongitudinalTrajectorySummary,
} from "../../lib/engines/assessmentScoringEngine";
import { globalStyles } from "../../lib/styles";
import { supabase } from "../../lib/supabase";

type AssessmentScoreRow = {
  id: string;
  assessed_at: string;
  domain_scores: DomainScore[] | null;
  overall_score: number | null;
  band_label: string | null;
  phase: string | null;
};

type ReportSummaryRow = {
  id: string;
  title: string;
  report_type: string;
  created_at: string;
  status: string;
};

export default function AssessmentReportsScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [caseId, setCaseId] = useState<string | null>(null);
  const [trajectory, setTrajectory] = useState<LongitudinalTrajectorySummary | null>(null);
  const [reports, setReports] = useState<ReportSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadCaseId = useCallback(async () => {
    if (!userId) return null;
    const { data } = await supabase
      .from("reunification_cases")
      .select("id")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();
    return data?.id ?? null;
  }, [userId]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setMessage("");
      try {
        const id = await loadCaseId();
        if (!active) return;
        if (!id) {
          setMessage("No active case found. Complete case setup first.");
          setLoading(false);
          return;
        }
        setCaseId(id);

        // Load assessment score history
        const { data: scoreData, error: scoreError } = await supabase
          .from("assessment_domain_scores")
          .select("id, assessed_at, domain_scores, overall_score, band_label, phase")
          .eq("case_id", id)
          .order("assessed_at", { ascending: true });

        if (scoreError) throw scoreError;

        const records = ((scoreData ?? []) as AssessmentScoreRow[])
          .filter((r) => r.domain_scores)
          .map((r) => ({
            assessmentId: r.id,
            assessedAt: r.assessed_at,
            domainScores: r.domain_scores as DomainScore[],
          }));

        if (!active) return;

        setTrajectory(summarizeDomainTrajectory(records));

        // Load saved reports
        const { data: reportData, error: reportError } = await supabase
          .from("assessment_reports")
          .select("id, title, report_type, created_at, status")
          .eq("case_id", id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (reportError) throw reportError;
        if (!active) return;

        setReports((reportData ?? []) as ReportSummaryRow[]);
      } catch (err) {
        if (active) setMessage(err instanceof Error ? err.message : "Could not load data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [loadCaseId]);

  return (
    <ScrollView contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Assessment reports</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>About this section</Text>
        <Text style={globalStyles.cardText}>
          This section summarises domain score trajectories across assessments and lists
          saved reports. Reports summarise real records only — they do not generate
          unsupported conclusions.
        </Text>
      </View>

      {loading ? <ActivityIndicator /> : null}
      {message ? <Text style={globalStyles.error}>{message}</Text> : null}

      {trajectory && !loading ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Score trajectory</Text>
          {trajectory.assessmentCount === 0 ? (
            <Text style={globalStyles.cardText}>
              No scored assessments recorded yet. Domain trajectories will appear once
              assessment scores are saved.
            </Text>
          ) : (
            <TrajectorySummary summary={trajectory} />
          )}
        </View>
      ) : null}

      {caseId ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Saved reports</Text>
          {reports.length === 0 ? (
            <Text style={globalStyles.cardText}>
              No reports have been generated for this case.
            </Text>
          ) : null}
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/assessments/report/${report.id}` as Href}
              asChild
            >
              <Pressable style={globalStyles.card}>
                <Text style={globalStyles.cardTitle}>{report.title}</Text>
                <Text style={globalStyles.cardText}>
                  Type: {report.report_type.replace(/_/g, " ")} · Status: {report.status}
                </Text>
                <Text style={globalStyles.cardText}>
                  {new Date(report.created_at).toLocaleDateString("en-AU", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}

      <AppBottomNav />
    </ScrollView>
  );
}
