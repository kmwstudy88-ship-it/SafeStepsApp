import { Link, usePathname } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { EmptyState, ErrorState } from "../../lib/parentChild/components";
import { getParentChildOverview, type ParentChildOverview } from "../../lib/parentChild/parentChildService";

const navItems = [
  ["Home Dashboard", "/dashboard", "⌂"],
  ["Parent-Child Profile", "/parent-child", "👥"],
  ["My Program", "/programs/my-programs", "▣"],
  ["Lessons", "/lessons", "☰"],
  ["Tasks", "/tasks", "☑"],
  ["Family Meeting", "/family-meeting", "◇"],
  ["Assessments", "/assessment-system", "⌁"],
  ["Evidence", "/evidence", "□"],
  ["Reports", "/reports", "▤"],
  ["Messages", "/parent-child/messages", "☏"],
  ["Games", "/parent-child/games", "◇"],
  ["Family Challenges", "/parent-child/family-challenges", "◎"],
  ["Weekend Activities", "/parent-child/weekend-activities", "☼"],
  ["Family Calendar", "/parent-child/family-calendar", "◷"],
  ["Resources", "/resources", "▥"],
  ["Settings", "/settings", "⚙"],
  ["Help & Support", "/facilitator", "?"],
] as const;

function Sidebar({ messageCount }: { messageCount: number }) {
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoWrap}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoIconText}>S</Text>
        </View>
        <Text style={styles.logo}>SafeSteps</Text>
        <Text style={styles.tagline}>Stronger Families. Safer Futures</Text>
      </View>

      <View style={styles.navList}>
        {navItems.map(([label, href, icon]) => {
          const active = href === pathname || (href === "/parent-child" && pathname.startsWith("/parent-child"));

          return (
            <Link key={label} href={href as any} asChild>
              <Pressable
                style={StyleSheet.flatten([
                  styles.navItem,
                  active && styles.navItemActive,
                ])}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.navIcon,
                    active && styles.navTextActive,
                  ])}
                >
                  {icon}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.navText,
                    active && styles.navTextActive,
                  ])}
                >
                  {label}
                </Text>
                {label === "Messages" && messageCount > 0 ? (
                  <Text style={styles.navBadge}>{messageCount}</Text>
                ) : null}
                {active ? <Text style={styles.navChevron}>›</Text> : null}
              </Pressable>
            </Link>
          );
        })}
      </View>

      <Link href="/login" asChild>
        <Pressable style={styles.logout}>
          <Text style={styles.navIcon}>↪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function TopBar() {
  return (
    <View style={styles.topBar}>
      <View style={styles.menuButton}>
        <Text style={styles.menuText}>☰</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.welcome}>Parent-Child Workspace</Text>
        <Text style={styles.welcomeSub}>Shared child records, requests, and monitored messages.</Text>
      </View>
      <View style={styles.bellWrap}>
        <Text style={styles.bell}>♧</Text>
      </View>
      <View style={styles.parentAvatar}>
        <Text style={styles.avatarFace}>P</Text>
      </View>
      <Text style={styles.parentName}>Parent view</Text>
    </View>
  );
}

function Shortcut({ title, subtitle, href, icon }: { title: string; subtitle: string; href: string; icon: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.shortcut}>
        <Text style={styles.shortcutIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.shortcutTitle}>{title}</Text>
          <Text style={styles.shortcutSub}>{subtitle}</Text>
        </View>
        <Text style={styles.shortcutArrow}>›</Text>
      </Pressable>
    </Link>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  tone = "blue",
}: {
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
  tone?: "blue" | "green" | "purple" | "orange";
}) {
  return (
    <View style={[styles.sectionCard, styles[`${tone}Wash`]]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function MetricLine({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalTop}>
        <Text style={styles.goalLabel}>{label}</Text>
        <Text style={styles.goalValue}>{value}</Text>
      </View>
    </View>
  );
}

function FamilyProfile({ overview }: { overview: ParentChildOverview | null }) {
  const statusLabel = overview?.openRequestCount || overview?.openMessageCount ? "Needs review" : "Active";
  const sharedCount = overview?.sharedItemCount ?? 0;
  const requestCount = overview?.requestCount ?? 0;

  return (
    <View style={styles.profileGrid}>
      <View style={styles.profilePanel}>
        <View style={styles.profilePeople}>
          <View style={styles.personBlock}>
            <Text style={styles.smallLabel}>Parent</Text>
            <View style={styles.largeAvatar}>
              <Text style={styles.largeAvatarText}>P</Text>
            </View>
            <Text style={styles.personName}>Parent record</Text>
            <Text style={styles.personMeta}>Signed-in account</Text>
          </View>
          <View style={styles.childrenBlock}>
            <Text style={styles.smallLabel}>Children</Text>
            <View style={styles.childAvatars}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>{sharedCount}</Text>
              </View>
              <View style={styles.childAvatarPink}>
                <Text style={styles.childAvatarText}>{requestCount}</Text>
              </View>
            </View>
            <Text style={styles.childNames}>Shared items        Requests</Text>
          </View>
        </View>
        <View style={styles.profileFacts}>
          <Fact icon="□" label="Shared child records" value={`${sharedCount}`} />
          <Fact icon="◇" label="Open requests" value={`${overview?.openRequestCount ?? 0}`} />
          <Fact icon="◇" label="Status" value={statusLabel} pill />
        </View>
      </View>

      <View style={styles.heroPanel}>
        <View style={styles.sun} />
        <View style={styles.mountainOne} />
        <View style={styles.mountainTwo} />
        <View style={styles.familyShapes}>
          <View style={styles.parentShape} />
          <View style={styles.childShape} />
          <View style={styles.parentShapeAlt} />
          <View style={styles.childShapeSmall} />
        </View>
        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>
            Child-only material stays private unless it has been shared through the child voice pathway.
          </Text>
          <Text style={styles.quoteHeart}>♥</Text>
        </View>
      </View>
    </View>
  );
}

function Fact({ icon, label, value, pill }: { icon: string; label: string; value: string; pill?: boolean }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factIcon}>{icon}</Text>
      <View>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={pill ? styles.factPill : styles.factValue}>{value}</Text>
      </View>
    </View>
  );
}

function OverviewContent({ overview }: { overview: ParentChildOverview }) {
  const progress = useMemo(() => {
    const total = overview.sharedItemCount + overview.requestCount + overview.messageCount;
    const open = overview.openRequestCount + overview.openMessageCount;
    if (total === 0) return 0;
    return Math.max(20, Math.min(95, Math.round(((total - open) / total) * 100)));
  }, [overview]);

  return (
    <>
      <View style={styles.shortcutRow}>
        <Shortcut
          title="Child Shared Dashboard"
          subtitle="Only child-shared records, not the private child space"
          href="/parent-child/shared-items"
          icon="▤"
        />
        <Shortcut
          title="Monitored Messages"
          subtitle="Messages shared through the parent-child pathway"
          href="/parent-child/messages"
          icon="☏"
        />
        <Shortcut
          title="Parent-Child Games"
          subtitle="Child-shared game requests and follow-up"
          href="/parent-child/games"
          icon="◇"
        />
        <Shortcut
          title="Family Challenges"
          subtitle="Shared challenges families can practise together"
          href="/parent-child/family-challenges"
          icon="◎"
        />
        <Shortcut
          title="Weekend Activities"
          subtitle="Activities, routines, and family tasks"
          href="/parent-child/weekend-activities"
          icon="☼"
        />
        <Shortcut
          title="Family Calendar"
          subtitle="Visits, activities, family tasks, and future games"
          href="/parent-child/family-calendar"
          icon="◷"
        />
      </View>

      <FamilyProfile overview={overview} />

      <View style={styles.overallProgress}>
          <Text style={styles.progressIcon}>◎</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.overallTitle}>Parent-Child Review Progress</Text>
          <Text style={styles.overallSub}>
            {overview.sharedItemCount + overview.requestCount + overview.messageCount === 0
              ? "No shared child voice records are available yet."
              : "Based on reviewed shared records, requests, and monitored messages."}
          </Text>
        </View>
        <View style={styles.overallTrack}>
          <View style={[styles.overallFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.overallPercent}>{progress}%</Text>
        <Link href="/progress" asChild>
          <Pressable style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Full Progress ›</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.threeColumn}>
        <SectionCard title="Review Queue" subtitle="Records available to the parent view." icon="◎" tone="blue">
          <MetricLine label="Shared child items" value={overview.sharedItemCount} />
          <MetricLine label="Child requests" value={overview.requestCount} />
          <MetricLine label="Monitored messages" value={overview.messageCount} />
          <Link href="/parent-child/requests" asChild>
            <Pressable>
              <Text style={styles.linkText}>View child requests ›</Text>
            </Pressable>
          </Link>
        </SectionCard>

        <SectionCard title="Child Voice" subtitle="What your child wants you to know." icon="☏" tone="green">
          {overview.latestRequest?.message ? (
            <VoiceBubble avatar="R" text={overview.latestRequest.message} />
          ) : null}
          {overview.latestSharedItem ? (
            <VoiceBubble
              avatar="S"
              text={overview.latestSharedItem.summary_text || overview.latestSharedItem.item_title || "Shared child item"}
            />
          ) : null}
          {!overview.latestRequest?.message && !overview.latestSharedItem ? (
            <Text style={styles.emptyPanelText}>
              No child-shared voice records are available in the parent view yet.
            </Text>
          ) : null}
          <Link href="/parent-child/shared-items" asChild>
            <Pressable>
              <Text style={styles.linkText}>View full summary ›</Text>
            </Pressable>
          </Link>
        </SectionCard>

        <SectionCard title="Privacy Boundary" subtitle="Parent access is mediated by sharing controls." icon="♙" tone="orange">
          <SafeguardRow label="Private child records" value="Hidden from parent view" />
          <SafeguardRow label="Shared records" value="Visible when audience is parent or both" />
          <SafeguardRow label="Parent replies" value="Child visibility must be selected" />
        </SectionCard>
      </View>

      <View style={styles.bottomGrid}>
        <SectionCard title="Monitoring Status" subtitle="Open items that need human review." icon="♡" tone="green">
          <SafeguardRow label="Open child requests" value={`${overview.openRequestCount}`} />
          <SafeguardRow label="Open monitored messages" value={`${overview.openMessageCount}`} />
          <SafeguardRow
            label="Latest message"
            value={overview.latestMessage ? new Date(overview.latestMessage.created_at).toLocaleString() : "None available"}
          />
        </SectionCard>

        <SectionCard title="Next Actions" subtitle="Use real child-shared records before parent follow-up." icon="◷" tone="purple">
          <TimelineRow color="#25A985" title="Review shared items" date={`${overview.sharedItemCount} available`} detail="Read only records the child chose to share." />
          <TimelineRow color="#2B83D3" title="Respond to requests" date={`${overview.openRequestCount} open`} detail="Save calm parent notes and choose child visibility deliberately." />
          <TimelineRow color="#7E66D9" title="Check family calendar" date="Shared only" detail="Review upcoming visits, activities, family tasks, and future requested games." />
          <Link href="/parent-child/family-calendar" asChild>
            <Pressable>
              <Text style={styles.linkText}>Open family calendar ›</Text>
            </Pressable>
          </Link>
        </SectionCard>
      </View>
    </>
  );
}

function VoiceBubble({ avatar, text }: { avatar: string; text: string }) {
  return (
    <View style={styles.voiceRow}>
      <View style={styles.voiceAvatar}>
        <Text style={styles.voiceAvatarText}>{avatar}</Text>
      </View>
      <View style={styles.voiceBubble}>
        <Text style={styles.voiceText}>“{text}”</Text>
      </View>
    </View>
  );
}

function SafeguardRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.contactRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{label}</Text>
        <Text style={styles.contactDetail}>{value}</Text>
      </View>
    </View>
  );
}

function TimelineRow({ color, title, date, detail }: { color: string; title: string; date: string; detail: string }) {
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <Text style={styles.timelineTitle}>{title}</Text>
      <Text style={styles.timelineDate}>{date}</Text>
      <Text style={styles.timelineDetail}>{detail}</Text>
    </View>
  );
}

export default function ParentChildHomeScreen() {
  const [overview, setOverview] = useState<ParentChildOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 980;

  useEffect(() => {
    let mounted = true;

    async function loadOverview() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getParentChildOverview();

        if (mounted) {
          setOverview(result);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load parent-child overview.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.appShell}>
      {wide ? <Sidebar messageCount={overview?.openMessageCount ?? 0} /> : null}
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <TopBar />

        {!wide ? (
          <View style={styles.mobileNavNotice}>
            <Text style={styles.mobileNavText}>Parent-Child Profile</Text>
            <Link href="/parent-child/messages" asChild>
              <Pressable style={styles.mobileMessageButton}>
                <Text style={styles.mobileMessageText}>Messages {overview?.openMessageCount ? `(${overview.openMessageCount})` : ""}</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}

        <View style={styles.pageHeader}>
          <Text style={styles.backArrow}>←</Text>
          <View>
            <Text style={styles.pageTitle}>Parent-Child Profile</Text>
            <Text style={styles.pageSub}>Overview of your family, goals, and support network.</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator color="#0D8E8A" />
            <EmptyState message="Loading parent-child overview..." />
          </View>
        ) : null}

        {!loading && errorMessage ? <ErrorState message={errorMessage} /> : null}

        {!loading && overview ? <OverviewContent overview={overview} /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: "#F9F4EA",
    flexDirection: "row",
  },
  sidebar: {
    width: 294,
    backgroundColor: "#003A4B",
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRightWidth: 4,
    borderRightColor: "#E6B44D",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 18,
  },
  logoIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E7F4ED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#26AAA0",
  },
  logoIconText: {
    color: "#0E5864",
    fontSize: 34,
    fontWeight: "900",
  },
  logo: {
    color: "#27C3B5",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },
  tagline: {
    color: "#D4E9EA",
    fontSize: 12,
    fontWeight: "700",
  },
  navList: {
    gap: 6,
  },
  navItem: {
    minHeight: 48,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: "#1AA59F",
  },
  navIcon: {
    width: 24,
    color: "#F2FAFB",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "900",
  },
  navText: {
    flex: 1,
    color: "#F2FAFB",
    fontSize: 16,
    fontWeight: "800",
  },
  navTextActive: {
    color: "#FFFFFF",
  },
  navChevron: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 28,
  },
  navBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFBF2E",
    color: "#062F3B",
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 26,
    overflow: "hidden",
  },
  logout: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.24)",
    paddingTop: 24,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingHorizontal: 14,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FBF7EF",
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 34,
    gap: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#24A9A1",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#BEE5DC",
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  welcome: {
    color: "#0B3770",
    fontSize: 24,
    fontWeight: "900",
  },
  welcomeSub: {
    color: "#0B3770",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 3,
  },
  bellWrap: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  bell: {
    color: "#0B5C92",
    fontSize: 24,
    fontWeight: "900",
  },
  bellBadge: {
    position: "absolute",
    right: 3,
    top: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#25A985",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 18,
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
  },
  parentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E7F4ED",
    borderWidth: 2,
    borderColor: "#24A9A1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFace: {
    color: "#0B5C73",
    fontSize: 24,
    fontWeight: "900",
  },
  parentName: {
    color: "#0B3770",
    fontSize: 14,
    fontWeight: "900",
  },
  mobileNavNotice: {
    backgroundColor: "#083E50",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mobileNavText: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "900",
  },
  mobileMessageButton: {
    backgroundColor: "#24A9A1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mobileMessageText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 8,
  },
  backArrow: {
    color: "#0B3770",
    fontSize: 32,
    fontWeight: "800",
  },
  pageTitle: {
    color: "#0B3770",
    fontSize: 25,
    fontWeight: "900",
  },
  pageSub: {
    color: "#0B3770",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  shortcutRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 18,
    flexWrap: "wrap",
  },
  shortcut: {
    width: 340,
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "rgba(255,255,255,0.72)",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
  },
  shortcutIcon: {
    color: "#0B5C92",
    fontSize: 26,
    fontWeight: "900",
  },
  shortcutTitle: {
    color: "#0B3770",
    fontSize: 15,
    fontWeight: "900",
  },
  shortcutSub: {
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  shortcutArrow: {
    color: "#0B5C92",
    fontSize: 28,
  },
  profileGrid: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  profilePanel: {
    flex: 0.9,
    minWidth: 360,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 18,
  },
  profilePeople: {
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
  },
  personBlock: {
    flex: 1,
    alignItems: "center",
  },
  childrenBlock: {
    flex: 1,
    alignItems: "center",
  },
  smallLabel: {
    alignSelf: "flex-start",
    color: "#0B3770",
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 8,
  },
  largeAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E6F5EF",
    borderWidth: 2,
    borderColor: "#25A985",
    alignItems: "center",
    justifyContent: "center",
  },
  largeAvatarText: {
    color: "#0C6E74",
    fontSize: 34,
    fontWeight: "900",
  },
  personName: {
    color: "#0B3770",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 12,
  },
  personMeta: {
    color: "#0B3770",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  childAvatars: {
    flexDirection: "row",
    gap: 22,
  },
  childAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#DFF0FF",
    borderWidth: 2,
    borderColor: "#58A3D7",
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarPink: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFE9E9",
    borderWidth: 2,
    borderColor: "#B6A5D9",
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarText: {
    color: "#0B3770",
    fontSize: 22,
    fontWeight: "900",
  },
  childNames: {
    color: "#0B3770",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },
  profileFacts: {
    borderTopWidth: 1,
    borderTopColor: "#E4C997",
    marginTop: 16,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  fact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  factIcon: {
    color: "#0B5C92",
    fontSize: 24,
    fontWeight: "900",
  },
  factLabel: {
    color: "#52708B",
    fontSize: 12,
    fontWeight: "800",
  },
  factValue: {
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  factPill: {
    color: "#176E4E",
    backgroundColor: "#DDF4E5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
  },
  heroPanel: {
    flex: 1.4,
    minWidth: 430,
    minHeight: 230,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "#F9D8C6",
  },
  sun: {
    position: "absolute",
    top: 54,
    left: "42%",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF1C9",
  },
  mountainOne: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 42,
    height: 105,
    backgroundColor: "#B9C7E9",
    opacity: 0.65,
    transform: [{ skewY: "-8deg" }],
  },
  mountainTwo: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    height: 80,
    backgroundColor: "#BFE4E2",
    opacity: 0.78,
    transform: [{ skewY: "5deg" }],
  },
  familyShapes: {
    position: "absolute",
    left: "44%",
    bottom: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  parentShape: {
    width: 18,
    height: 78,
    borderRadius: 9,
    backgroundColor: "#275B72",
  },
  parentShapeAlt: {
    width: 18,
    height: 72,
    borderRadius: 9,
    backgroundColor: "#426A8C",
  },
  childShape: {
    width: 13,
    height: 48,
    borderRadius: 7,
    backgroundColor: "#0E8B8B",
  },
  childShapeSmall: {
    width: 12,
    height: 44,
    borderRadius: 7,
    backgroundColor: "#5470AE",
  },
  quoteCard: {
    position: "absolute",
    right: 42,
    top: 40,
    width: 230,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.78)",
    padding: 18,
  },
  quoteMark: {
    color: "#D4A96F",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 34,
  },
  quoteText: {
    color: "#0B3770",
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "800",
  },
  quoteHeart: {
    alignSelf: "flex-end",
    color: "#19A89F",
    fontSize: 24,
  },
  overallProgress: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "rgba(255,255,255,0.72)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  progressIcon: {
    color: "#0B5C92",
    fontSize: 34,
    fontWeight: "900",
  },
  overallTitle: {
    color: "#0B3770",
    fontSize: 18,
    fontWeight: "900",
  },
  overallSub: {
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "700",
  },
  overallTrack: {
    flex: 1.4,
    minWidth: 230,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ECE4DA",
    overflow: "hidden",
  },
  overallFill: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "#35B49D",
  },
  overallPercent: {
    color: "#0B3770",
    fontSize: 15,
    fontWeight: "900",
  },
  viewButton: {
    minWidth: 190,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8DCBC3",
    backgroundColor: "#F7FBFA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#0B5C92",
    fontSize: 14,
    fontWeight: "900",
  },
  threeColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  bottomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  sectionCard: {
    flex: 1,
    minWidth: 330,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "rgba(255,255,255,0.76)",
    padding: 18,
  },
  blueWash: {
    backgroundColor: "#FFFBF2",
  },
  greenWash: {
    backgroundColor: "#F6FCF8",
  },
  purpleWash: {
    backgroundColor: "#FCF9FF",
  },
  orangeWash: {
    backgroundColor: "#FFF9F1",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  sectionIcon: {
    color: "#0B5C92",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
  },
  sectionTitle: {
    color: "#0B3770",
    fontSize: 18,
    fontWeight: "900",
  },
  sectionSub: {
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  goalRow: {
    marginTop: 8,
  },
  goalTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalLabel: {
    flex: 1,
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "800",
  },
  goalValue: {
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "900",
  },
  goalTrack: {
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EAE3D8",
    overflow: "hidden",
    marginTop: 5,
  },
  goalFill: {
    height: 9,
    borderRadius: 5,
    backgroundColor: "#35B49D",
  },
  linkText: {
    color: "#079894",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 14,
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  voiceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DFF0FF",
    borderWidth: 1,
    borderColor: "#58A3D7",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceAvatarText: {
    color: "#0B3770",
    fontWeight: "900",
  },
  voiceBubble: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4DDD0",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 12,
  },
  voiceText: {
    color: "#0B3770",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
  },
  emptyPanelText: {
    color: "#53665A",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECE4DA",
    paddingVertical: 8,
  },
  contactAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFE1C8",
    alignItems: "center",
    justifyContent: "center",
  },
  contactAvatarText: {
    color: "#0B3770",
    fontWeight: "900",
  },
  contactName: {
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "900",
  },
  contactDetail: {
    color: "#42678A",
    fontSize: 12,
    fontWeight: "700",
  },
  contactPhone: {
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "800",
  },
  contactMail: {
    color: "#0B5C92",
    fontSize: 17,
    fontWeight: "900",
  },
  wellbeingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 12,
  },
  wellbeingItem: {
    width: 92,
    alignItems: "center",
  },
  wellbeingCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: "#35B49D",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  wellbeingWatch: {
    borderColor: "#F2AA22",
  },
  wellbeingIcon: {
    color: "#1EA283",
    fontSize: 24,
    fontWeight: "900",
  },
  wellbeingWatchText: {
    color: "#F2AA22",
  },
  wellbeingLabel: {
    color: "#0B3770",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    color: "#0B3770",
    fontSize: 12,
    fontWeight: "800",
  },
  timelineRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECE4DA",
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  timelineTitle: {
    width: 120,
    color: "#0B3770",
    fontSize: 13,
    fontWeight: "900",
  },
  timelineDate: {
    width: 100,
    color: "#42678A",
    fontSize: 12,
    fontWeight: "800",
  },
  timelineDetail: {
    flex: 1,
    color: "#42678A",
    fontSize: 12,
    fontWeight: "700",
  },
  loadingPanel: {
    gap: 12,
  },
});
