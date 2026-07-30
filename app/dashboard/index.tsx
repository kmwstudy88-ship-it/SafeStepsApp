import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import {
  DashboardStats,
  fetchDashboardStats,
} from "../../lib/engines/dashboardEngine";

const colors = {
  teal: "#008A84",
  tealDark: "#053C4E",
  tealDeep: "#006A66",
  sage: "#E4F3EF",
  cream: "#F8F5EE",
  card: "rgba(255, 255, 255, 0.94)",
  border: "#D9E5E2",
  text: "#0B2742",
  muted: "#546A76",
  amber: "#F5E7C8",
  green: "#2E7D50",
};

const sidebarItems = [
  ["Dashboard", "/dashboard"],
  ["My Program", "/programs/my-programs"],
  ["Curriculum", "/library"],
  ["Challenges", "/challenges"],
  ["Tasks", "/tasks"],
  ["Evidence", "/evidence"],
  ["Assessments", "/assessment-system"],
  ["Reports", "/reports"],
  ["Calendar", "/timeline"],
  ["Messages", "/notifications"],
  ["Resources", "/resources"],
  ["Support", "/facilitator"],
  ["Profile", "/settings"],
  ["Settings", "/settings"],
] as const;

const quickActions = [
  ["Daily Challenges", "/parent/daily-challenges", "★"],
  ["Curriculum", "/library", "▤"],
  ["Challenges", "/challenges", "◎"],
  ["Upload Evidence", "/evidence", "↑"],
  ["Journal Entry", "/growth", "✎"],
  ["Assessments", "/assessment-system", "⌁"],
  ["View Reports", "/reports", "▣"],
  ["Messages", "/notifications", "☏"],
  ["Resources", "/resources", "?"],
] as const;

const evidenceUploadLinks = [
  ["Daily task uploads", "/tasks"],
  ["Evidence uploads", "/evidence"],
  ["Reflection uploads", "/growth"],
  ["Photo and document uploads", "/evidence-upload"],
] as const;

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function Sidebar() {
  return (
    <View style={styles.sidebar}>
      <View style={styles.logoBlock}>
        <Text style={styles.logoMark}>SafeSteps</Text>
        <Text style={styles.logoTagline}>Stronger families. Brighter futures.</Text>
      </View>

      <View style={styles.sideNav}>
        {sidebarItems.map(([label, href], index) => {
          const isActive = index === 0;
          const linkStyle = StyleSheet.flatten([
            styles.sideNavItem,
            isActive && styles.sideNavItemActive,
          ]);

          return (
            <Link key={label} href={href as any} asChild>
              <Pressable style={linkStyle}>
                <Text style={isActive ? styles.sideNavTextActive : styles.sideNavText}>
                  {label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>

      <View style={styles.supportCard}>
        <Text style={styles.supportIcon}>♡</Text>
        <Text style={styles.supportTitle}>Need Support?</Text>
        <Text style={styles.supportText}>
          We are here to help. Reach out to your support team.
        </Text>
        <Link href="/facilitator" asChild>
          <Pressable style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Contact Support</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: string;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        {action ? <Text style={styles.panelAction}>{action}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function PriorityRow({
  title,
  due,
  complete,
}: {
  title: string;
  due: string;
  complete: boolean;
}) {
  return (
    <View style={styles.priorityRow}>
      <View style={complete ? styles.checkCircleComplete : styles.checkCircle} />
      <View style={{ flex: 1 }}>
        <Text style={styles.priorityTitle}>{title}</Text>
        <Text style={styles.priorityDue}>{due}</Text>
      </View>
    </View>
  );
}

function QuickAction({ label, href, icon }: { label: string; href: string; icon: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.quickAction}>
        <Text style={styles.quickIcon}>{icon}</Text>
        <Text style={styles.quickText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 900;

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
          : "Could not load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const completedTasks = stats?.completedTasks ?? 0;
  const readyTasks = stats?.readyTasks ?? 0;
  const evidenceItems = stats?.evidenceItems ?? 0;
  const progressEvents = stats?.progressEvents ?? 0;
  const totalTasks = completedTasks + readyTasks;
  const taskCompletionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "SafeSteps parent";
  const programJourney = stats?.programJourney ?? null;
  const programIsActive = programJourney?.recommendationStatus === "active";
  const programHref = programIsActive
    ? "/programs/my-programs"
    : "/programs/recommendation";
  const programActionLabel = programIsActive
    ? "Continue My Program"
    : "Review My Recommendation";
  const programStage = !programJourney
    ? "Complete intake to receive a recommendation"
    : programIsActive
      ? "Active enrolment"
      : programJourney.recommendationStatus === "confirmed"
        ? programJourney.reviewerState === "approved" ||
          programJourney.reviewerState === "not_required"
          ? "Confirmed — ready for the next start check"
          : "Confirmed — waiting for required review"
        : "Recommendation ready for your review";

  return (
    <ImageBackground
      source={require("../../assets/safesteps-course-background.png")}
      resizeMode="cover"
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.appFrame}>
        {wide ? <Sidebar /> : null}

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <View style={styles.profileCluster}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
              </View>
              <Text style={styles.profileName}>{displayName}</Text>
            </View>
          </View>

          <Text style={styles.pageTitle}>Dashboard</Text>

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Welcome back</Text>
              <Text style={styles.heroTitle}>
                {programIsActive
                  ? "Keep your SafeSteps record moving."
                  : "Your next program step is visible."}
              </Text>
              <Text style={styles.heroText}>
                {programIsActive
                  ? "Continue your confirmed program, complete practical tasks, and save evidence as your work builds over time."
                  : "Review the pathway saved from intake, its limits, and any worker or governance safeguards before enrolment."}
              </Text>
              <Link href={programHref as any} asChild>
                <Pressable style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>{programActionLabel}</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {loading ? <ActivityIndicator /> : null}

          {error.length > 0 ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Dashboard Error</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={loadDashboard} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Refresh Dashboard</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.grid}>
            <Panel title="Program Progress">
              <View style={styles.progressPanelBody}>
                <View style={styles.progressRing}>
                  <Text style={styles.progressPercent}>{taskCompletionPercent}%</Text>
                  <Text style={styles.progressLabel}>Tasks</Text>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={styles.stageTitle}>
                    {programJourney?.programTitle ?? "Program journey"}
                  </Text>
                  <Text style={styles.stageSubtitle}>{programStage}</Text>
                  <Text style={styles.panelText}>
                    {programJourney
                      ? `Saved intake pathway: ${programJourney.selectedStream}. Self-reported intake remains separate from assessment and evidence records.`
                      : "Complete parent intake before SafeSteps can show a pathway recommendation."}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${taskCompletionPercent}%` }]} />
                  </View>
                  <Link href={programHref as any} asChild>
                    <Pressable>
                      <Text style={styles.textLink}>{programActionLabel}</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </Panel>

            <Panel title="Current Priorities" action={`${readyTasks} ready`}>
              <PriorityRow
                title={`${readyTasks} task${readyTasks === 1 ? "" : "s"} ready`}
                due="Open Tasks to continue practical work"
                complete={readyTasks === 0}
              />
              <PriorityRow
                title={`${completedTasks} task${completedTasks === 1 ? "" : "s"} completed`}
                due="Saved from your SafeSteps activity"
                complete
              />
              <PriorityRow
                title={`${stats?.reflections ?? 0} reflection${(stats?.reflections ?? 0) === 1 ? "" : "s"} saved`}
                due="Reflections help turn content into evidence of insight"
                complete={(stats?.reflections ?? 0) > 0}
              />
              <PriorityRow
                title={`${evidenceItems} evidence item${evidenceItems === 1 ? "" : "s"} saved`}
                due="Upload documents or media when you have new proof of work"
                complete={evidenceItems > 0}
              />
              <Link href="/tasks" asChild>
                <Pressable>
                  <Text style={styles.textLink}>View all tasks</Text>
                </Pressable>
              </Link>
            </Panel>

            <Panel title="Appointments">
              <View style={styles.appointmentRow}>
                <Text style={styles.dateBadge}>NEXT</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.priorityTitle}>No appointment record loaded</Text>
                  <Text style={styles.priorityDue}>
                    SafeSteps will only show appointment dates after they are saved to your record.
                  </Text>
                </View>
              </View>
            </Panel>

            <Panel title="Evidence Upload">
              <View style={styles.evidencePanelBody}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={styles.panelText}>
                    Keep your progress visible. Consistency builds trust.
                  </Text>
                  <View style={styles.evidenceUploadList}>
                    {evidenceUploadLinks.map(([label, href]) => (
                      <Link key={label} href={href} asChild>
                        <Pressable style={styles.evidenceUploadLink}>
                          <Text style={styles.evidenceUploadItem}>{label}</Text>
                          <Text style={styles.evidenceUploadArrow}>›</Text>
                        </Pressable>
                      </Link>
                    ))}
                  </View>
                  <Link href="/evidence" asChild>
                    <Pressable style={styles.evidenceUploadLink}>
                      <Text style={styles.evidenceUploadItem}>Upload Evidence</Text>
                      <Text style={styles.evidenceUploadArrow}>›</Text>
                    </Pressable>
                  </Link>
                </View>
                <View style={styles.smallRing}>
                  <Text style={styles.progressPercent}>{evidenceItems}</Text>
                  <Text style={styles.progressLabel}>items</Text>
                </View>
              </View>
            </Panel>
          </View>

          <Panel title="Quick Actions">
            <View style={styles.quickGrid}>
              {quickActions.map(([label, href, icon]) => (
                <QuickAction key={label} label={label} href={href} icon={icon} />
              ))}
            </View>
          </Panel>

          <View style={styles.grid}>
            <Panel title="Parent-Child Dashboard">
              <Text style={styles.panelText}>
                Child-shared records, monitored messages, family activities, and calendar requests live in a separate parent-child area.
              </Text>
              <Text style={styles.priorityDue}>
                Parents only see what the child has chosen to share through the parent-child pathway.
              </Text>
              <Link href="/parent-child" asChild>
                <Pressable style={styles.outlineButton}>
                  <Text style={styles.outlineButtonText}>Open Parent-Child Dashboard</Text>
                </Pressable>
              </Link>
            </Panel>

            <Panel title="Recent Activity" action="View all">
              <PriorityRow
                title={`${completedTasks} tasks completed`}
                due="Updated from your SafeSteps activity"
                complete
              />

              <PriorityRow
                title={`${progressEvents} progress events saved`}
                due="Lessons, checkpoints, and practice records"
                complete
              />

              <PriorityRow
                title={`${readyTasks} ready tasks remaining`}
                due="Review tasks when ready"
                complete={readyTasks === 0}
              />
            </Panel>
          </View>

          {stats ? (
            <View style={styles.statsRow}>
              <StatTile label="Active Programs" value={stats.activePrograms} />
              <StatTile label="Evidence Items" value={evidenceItems} />
              <StatTile label="Progress Events" value={progressEvents} />
              <StatTile label="Reflections" value={stats.reflections} />
            </View>
          ) : null}

          <View style={styles.bottomBanner}>
            <Text style={styles.bottomIcon}>♡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bottomTitle}>Your record is built from saved activity.</Text>
              <Text style={styles.panelText}>
                {[
                  pluralize(completedTasks, "completed task"),
                  pluralize(evidenceItems, "evidence item"),
                  pluralize(stats?.reflections ?? 0, "reflection"),
                ].join(", ")}.
              </Text>
            </View>
          </View>

          {!wide ? <AppBottomNav /> : null}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  backgroundImage: {
    opacity: 0.24,
  },
  appFrame: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 255,
    gap: 22,
    padding: 22,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
  },
  logoBlock: {
    gap: 2,
    paddingBottom: 8,
  },
  logoMark: {
    color: colors.teal,
    fontSize: 28,
    fontWeight: "900",
  },
  logoTagline: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  sideNav: {
    gap: 8,
  },
  sideNavItem: {
    minHeight: 46,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  sideNavItemActive: {
    backgroundColor: colors.sage,
  },
  sideNavText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  sideNavTextActive: {
    color: colors.tealDeep,
    fontSize: 15,
    fontWeight: "900",
  },
  supportCard: {
    gap: 10,
    marginTop: "auto",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(232, 246, 243, 0.86)",
  },
  supportIcon: {
    color: colors.teal,
    fontSize: 30,
    fontWeight: "900",
  },
  supportTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  supportText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  outlineButton: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  outlineButtonText: {
    color: colors.tealDeep,
    fontWeight: "900",
  },
  content: {
    flexGrow: 1,
    gap: 18,
    padding: 24,
    paddingBottom: 34,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.teal,
    backgroundColor: "#FFFFFF",
  },
  avatarText: {
    color: colors.tealDark,
    fontWeight: "900",
  },
  profileName: {
    color: colors.text,
    fontWeight: "800",
  },
  pageTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  hero: {
    minHeight: 245,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(221, 242, 240, 0.86)",
    justifyContent: "center",
    padding: 28,
  },
  heroCopy: {
    maxWidth: 520,
    gap: 12,
  },
  eyebrow: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "900",
  },
  heroText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: colors.teal,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  panel: {
    flexGrow: 1,
    flexBasis: 360,
    gap: 14,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    boxShadow: "0 7px 14px rgba(11, 39, 66, 0.07)",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  panelAction: {
    color: colors.tealDeep,
    fontSize: 13,
    fontWeight: "800",
  },
  panelText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  progressPanelBody: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 24,
  },
  progressRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 14,
    borderColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  smallRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 10,
    borderColor: "#8ED3CA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  progressPercent: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  progressLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  stageTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  stageSubtitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  progressTrack: {
    height: 9,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#DDE7E4",
  },
  progressFill: {
    width: "68%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: colors.teal,
  },
  textLink: {
    color: colors.tealDeep,
    fontWeight: "900",
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E9F0EE",
  },
  checkCircleComplete: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.teal,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#B9C9C6",
  },
  priorityTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  priorityDue: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  appointmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  dateBadge: {
    overflow: "hidden",
    width: 58,
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: colors.sage,
    color: colors.tealDeep,
    textAlign: "center",
    fontWeight: "900",
  },
  evidencePanelBody: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 22,
  },
  evidenceUploadList: {
    gap: 6,
    paddingTop: 2,
  },
  evidenceUploadLink: {
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(228, 243, 239, 0.62)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
  },
  evidenceUploadItem: {
    color: colors.tealDeep,
    fontSize: 14,
    fontWeight: "900",
  },
  evidenceUploadArrow: {
    color: colors.tealDeep,
    fontSize: 20,
    fontWeight: "900",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    flexGrow: 1,
    flexBasis: 130,
    minHeight: 94,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(228, 243, 239, 0.78)",
  },
  quickIcon: {
    color: colors.tealDeep,
    fontSize: 24,
    fontWeight: "900",
  },
  quickText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  measureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  statusPill: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.sage,
    color: colors.tealDeep,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statTile: {
    flexGrow: 1,
    flexBasis: 160,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  statValue: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    marginTop: 4,
    fontWeight: "700",
  },
  bottomBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  bottomIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.sage,
    color: colors.tealDeep,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 31,
    fontWeight: "900",
  },
  bottomTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  errorCard: {
    gap: 10,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FBE5E1",
    borderWidth: 1,
    borderColor: "#E8B6AE",
  },
  errorTitle: {
    color: "#8E2B21",
    fontSize: 17,
    fontWeight: "900",
  },
  errorText: {
    color: "#8E2B21",
  },
});

