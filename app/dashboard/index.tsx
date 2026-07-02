import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  DashboardStats,
  fetchDashboardStats,
} from "../../lib/engines/dashboardEngine";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: "45%",
        padding: 14,
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

function NavCard({
  title,
  description,
  href,
  primary = false,
}: {
  title: string;
  description: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable
        style={{
          padding: 16,
          backgroundColor: primary ? "#dcefe8" : "#f1f5f3",
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{title}</Text>
        <Text style={{ marginTop: 6 }}>{description}</Text>
      </Pressable>
    </Link>
  );
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const loadedStats = await fetchDashboardStats();
      setStats(loadedStats);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 8 }}>
        SafeSteps Dashboard
      </Text>

      <Text style={{ marginBottom: 16 }}>
        Your programs, courses, reflections, evidence, tasks, growth timeline,
        and reports all connect here.
      </Text>

      <Pressable
        onPress={loadDashboard}
        style={{
          padding: 12,
          backgroundColor: "#dcefe8",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Refresh Dashboard</Text>
      </Pressable>

      {loading && <ActivityIndicator />}

      {error.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ffecec",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Dashboard Error</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      {stats && (
        <>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            Today&apos;s Overview
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <StatCard label="Active Programs" value={stats.activePrograms} />
            <StatCard label="Ready Tasks" value={stats.readyTasks} />
            <StatCard label="Completed Tasks" value={stats.completedTasks} />
            <StatCard label="Evidence Items" value={stats.evidenceItems} />
            <StatCard label="Progress Events" value={stats.progressEvents} />
            <StatCard label="Reflections" value={stats.reflections} />
          </View>
        </>
      )}

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Continue
      </Text>

      <NavCard
        title="My Programs"
        description="Continue active SafeSteps programs you have already started."
        href="/programs/my-programs"
        primary
      />

      <NavCard
        title="SafeSteps Growth"
        description="My Why, Parent Story, Strengths, Family Wins, Toolbox and Future Letter."
        href="/growth"
        primary
      />

      <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 10 }}>
        Bulk Completion
      </Text>

      <NavCard
        title="Bulk Setup"
        description="Add the remaining SafeSteps task and evidence bundles, then review what was created."
        href="/bulk-setup"
        primary
      />

      <NavCard
        title="Complete Ready Tasks"
        description="Open tasks and use Mark All Ready Tasks Complete when the remaining actions are done."
        href="/tasks"
      />

      <NavCard
        title="Store Draft Evidence"
        description="Open evidence and mark all draft evidence stored after review."
        href="/evidence"
      />

      <NavCard
        title="Assessment System"
        description="Set up cases, score assessment domains, link evidence, and prepare structured reports."
        href="/assessment-system"
        primary
      />

      <NavCard
        title="Issue Completion Certificate"
        description="Create a certificate record once the current SafeSteps work has been reviewed."
        href="/certificates"
      />

      <NavCard
        title="Clear Reminders"
        description="Review reminders and mark unread notifications read in bulk."
        href="/notifications"
      />

      <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 10 }}>
        Main Areas
      </Text>

      <NavCard
        title="Browse Programs"
        description="Start a structured pathway with monthly topics, weekly sub-topics and daily lessons."
        href="/programs/main"
      />

      <NavCard
        title="Courses"
        description="Standalone courses that are not broken into months and weeks."
        href="/courses"
      />

      <NavCard
        title="Tasks"
        description="Parent actions, practice tasks and completed activity records."
        href="/tasks"
      />

      <NavCard
        title="Evidence"
        description="Upload notes, photos, worksheets, documents and practice proof."
        href="/evidence"
      />

      <NavCard
        title="Growth Timeline"
        description="View reflections, lessons, checkpoints, practice activities and progress events."
        href="/progress"
      />

      <NavCard
        title="Reports"
        description="View objective completion data and self-reported growth data."
        href="/reports"
      />

      <NavCard
        title="Resources"
        description="Worksheets, guides, templates, checklists and support information."
        href="/resources"
      />
    </ScrollView>
  );
}
