import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useSensitiveAccess } from "../../components/security/SensitiveRouteBoundary";
import {
  calculateGrowthStats,
  fetchDailyLessonRecords,
  GrowthStats,
  SavedDailyLessonRecord,
} from "../../lib/engines/growthTimelineEngine";
import { useAuth } from "../../lib/auth";
import { getReportSummary, type ReportSummary } from "../../lib/platformData";
import { auditReportViewed } from "../../lib/security/audit";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d8e5dd",
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{value}</Text>
      <Text style={{ marginTop: 4 }}>{label}</Text>
    </View>
  );
}

export default function ReportsScreen() {
  const { user } = useAuth();
  const access = useSensitiveAccess();
  const userId = user?.id;
  const caseId = access?.caseId;
  const [records, setRecords] = useState<SavedDailyLessonRecord[]>([]);
  const [stats, setStats] = useState<GrowthStats | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    if (!userId || !caseId) {
      setLoading(false);
      setError("An active case membership is required before viewing reports.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [savedRecords, reportSummary] = await Promise.all([
        fetchDailyLessonRecords(),
        getReportSummary(userId),
      ]);
      await auditReportViewed(caseId);
      setRecords(savedRecords);
      setStats(calculateGrowthStats(savedRecords));
      setSummary(reportSummary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, [caseId, userId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const completedTaskCount = summary?.tasks.filter((task) => task.status === "completed").length ?? 0;
  const openTaskCount = summary ? summary.tasks.length - completedTaskCount : 0;
  const draftEvidenceCount = summary?.evidence.filter((item) => item.status === "draft").length ?? 0;
  const storedEvidenceCount = summary?.evidence.filter((item) => item.status === "stored").length ?? 0;
  const sharedEvidenceCount = summary?.evidence.filter((item) => item.status === "shared").length ?? 0;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>Progress Reports</Text>
      <Text style={{ marginBottom: 16 }}>
        Reports use your existing Supabase progress events. Objective app events are separated from self-reported confidence and reflection data.
      </Text>

      <Pressable
        onPress={loadReport}
        style={{
          padding: 12,
          backgroundColor: "#dcefe8",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Refresh Report</Text>
      </Pressable>

      {loading && <ActivityIndicator />}

      {error.length > 0 && (
        <View style={{ padding: 14, backgroundColor: "#ffecec", borderRadius: 12, marginBottom: 14 }}>
          <Text style={{ fontWeight: "bold" }}>Could not load report</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      {!loading && stats && (
        <>
          {summary ? (
            <>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Completion Summary</Text>
              <StatCard label="Open tasks remaining" value={openTaskCount} />
              <StatCard label="Completed tasks" value={completedTaskCount} />
              <StatCard label="Draft evidence remaining" value={draftEvidenceCount} />
              <StatCard label="Stored evidence records" value={storedEvidenceCount} />
              <StatCard label="Shared evidence records" value={sharedEvidenceCount} />
              <StatCard label="Program reflections saved" value={summary.reflections.length} />
            </>
          ) : null}

          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Objective Completion Data</Text>
          <StatCard label="Progress events saved" value={stats.totalLessonsSaved} />
          <StatCard label="Completed daily lessons" value={stats.completedLessons} />
          <StatCard label="Knowledge checkpoints completed" value={stats.knowledgeCheckpoints} />
          <StatCard label="Scenario checkpoints completed" value={stats.scenarioCheckpoints} />
          <StatCard label="Real-world practical activities recorded" value={stats.practicalActivities} />

          <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 10 }}>Self-Reported Growth Data</Text>
          <StatCard label="Average confidence before lessons" value={stats.averageConfidenceBefore.toFixed(1)} />
          <StatCard label="Average confidence after lessons" value={stats.averageConfidenceAfter.toFixed(1)} />
          <StatCard
            label="Average confidence change"
            value={stats.confidenceChange >= 0 ? `+${stats.confidenceChange.toFixed(1)}` : stats.confidenceChange.toFixed(1)}
          />

          <View style={{ padding: 16, backgroundColor: "#f1f5f3", borderRadius: 12, marginTop: 10, marginBottom: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Report Note</Text>
            <Text style={{ marginTop: 6 }}>
              Checkpoints, activities and lesson completion are objective app events. Confidence ratings and reflections are self-reported and show the parent&apos;s perspective over time.
            </Text>
            <Text style={{ marginTop: 8 }}>Total records included in this report: {records.length}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
