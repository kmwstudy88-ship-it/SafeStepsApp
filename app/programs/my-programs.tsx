import { Link, usePathname } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { getProgramMonths, programs, type ProgramPathway } from "../../lib/data/programs";
import {
  fetchMyProgramEnrollments,
  type ProgramEnrollment,
} from "../../lib/engines/programEnrollmentEngine";

const navItems = [
  ["Home Dashboard", "/dashboard", "⌂"],
  ["Parent-Child Profile", "/parent-child", "👥"],
  ["My Program", "/programs/my-programs", "▣"],
  ["Lessons", "/lessons", "▤"],
  ["Tasks", "/tasks", "☑"],
  ["Assessments", "/assessment-system", "⌁"],
  ["Evidence", "/evidence", "□"],
  ["Reports", "/reports", "▥"],
  ["Messages", "/notifications", "☏"],
  ["Calendar", "/timeline", "◇"],
  ["Resources", "/resources", "▧"],
  ["Settings", "/settings", "⚙"],
  ["Help & Support", "/facilitator", "?"],
] as const;

const categories = [
  ["Communication", "6 Lessons", "#BFE4E2"],
  ["Emotional Well-being", "6 Lessons", "#DCEFE8"],
  ["Parenting Skills", "8 Lessons", "#E8EFD4"],
  ["Problem Solving", "6 Lessons", "#DFF0FF"],
  ["Family Connection", "6 Lessons", "#F7DCD2"],
] as const;

function Sidebar() {
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
          const active =
            href === pathname || (href === "/programs/my-programs" && pathname.startsWith("/programs"));

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

function TopBar({ activeCount }: { activeCount: number }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.menuButton}>
        <Text style={styles.menuText}>☰</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.pageTitle}>Programs & Courses</Text>
        <Text style={styles.pageSub}>Your pathway to building stronger family connections.</Text>
      </View>
      <View style={styles.bellWrap}>
        <Text style={styles.bell}>♧</Text>
        {activeCount > 0 ? <Text style={styles.bellBadge}>{activeCount}</Text> : null}
      </View>
      <View style={styles.parentAvatar}>
        <Text style={styles.avatarFace}>P</Text>
      </View>
      <Text style={styles.parentName}>My profile</Text>
    </View>
  );
}

function ButtonLink({ href, label }: { href: string | object; label: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.outlineButton}>
        <Text style={styles.outlineButtonText}>{label} ›</Text>
      </Pressable>
    </Link>
  );
}

function WatercolorPanel({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function getProgramDurationSummary(program: ProgramPathway) {
  const months = program.durationMonths;
  const weeks = getProgramMonths(program).reduce((total, month) => total + month.weeks.length, 0);
  const monthLabel = months === 1 ? "1-month" : `${months}-month`;
  const weekLabel = weeks === 1 ? "1-week" : `${weeks}-week`;

  if (program.id === "intensive-reunification") {
    return `${monthLabel} intensive reunification pathway with a ${weekLabel} structured plan, practical lessons, reflections, evidence, and worker review.`;
  }

  if (program.id === "home-again") {
    return `${monthLabel} return-home transition pathway with a ${weekLabel} structured plan for routines, child adjustment, repair, evidence, and stability review.`;
  }

  if (months > 0) {
    return `${monthLabel} program with a ${weekLabel} structured plan, practical lessons, reflections, evidence, and growth tracking.`;
  }

  return "Assessment-based pathway with practical lessons, reflections, evidence, and growth tracking.";
}

function getProgramWeekSummary(program: ProgramPathway) {
  const weeks = getProgramMonths(program).reduce((total, month) => total + month.weeks.length, 0);
  if (weeks <= 0) return "Assessment-based pathway";
  return `${weeks}-week structured plan`;
}

function getTotalProgramWeeks(program: ProgramPathway) {
  return getProgramMonths(program).reduce((total, month) => total + month.weeks.length, 0);
}

function formatDate(value?: string | null) {
  if (!value) return "Not started";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function addMonths(value: string | null | undefined, months: number) {
  if (!value || months <= 0) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

export function getProgramPathwaySegments(program: ProgramPathway) {
  const totalWeeks = getTotalProgramWeeks(program);
  if (totalWeeks <= 0) {
    return [["1", "Assessment Plan", "Flexible timing", true]] as const;
  }

  const labels =
    program.id === "intensive-reunification"
      ? ["Safety & Accountability", "Contact Preparation", "Return-Home Readiness", "Post-Return Stability", "Long-Term Maintenance"]
      : program.id === "home-again"
        ? ["Return Home Safely", "Settle Routines", "Repair & Connection", "Stability Review", "Maintenance Plan"]
        : ["Build Foundation", "Practise Skills", "Use Support", "Review Progress", "Plan Ahead"];
  const segmentSize = Math.ceil(totalWeeks / labels.length);

  return labels.map((label, index) => {
    const startWeek = index * segmentSize + 1;
    const endWeek = Math.min((index + 1) * segmentSize, totalWeeks);
    return [String(index + 1), label, startWeek === endWeek ? `Week ${startWeek}` : `Weeks ${startWeek}-${endWeek}`, index === 0] as const;
  });
}

function ProgramArtwork({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.artwork, small ? styles.artworkSmall : null]}>
      <View style={styles.artSun} />
      <View style={styles.artPath} />
      <View style={styles.artHeart} />
      <View style={styles.artFamily}>
        <View style={styles.artAdult} />
        <View style={styles.artChild} />
        <View style={styles.artAdultAlt} />
      </View>
    </View>
  );
}

function HeaderArtwork() {
  return (
    <View style={styles.headerArtwork}>
      <View style={styles.headerSun} />
      <View style={styles.headerMountain} />
      <View style={styles.headerFamily}>
        <View style={styles.headerAdult} />
        <View style={styles.headerChild} />
        <View style={styles.headerAdultAlt} />
        <View style={styles.headerChildSmall} />
      </View>
    </View>
  );
}

function CurrentProgram({ program }: { program: ProgramPathway }) {
  const totalWeeks = getTotalProgramWeeks(program);
  const progressText = totalWeeks > 0 ? `0/${totalWeeks} weeks reviewed` : "Assessment-based progress";

  return (
    <WatercolorPanel style={styles.currentProgram}>
      <Text style={styles.panelTitle}>Current Program</Text>
      <View style={styles.currentProgramBody}>
        <ProgramArtwork />
        <View style={styles.currentProgramText}>
          <Text style={styles.programName}>{program.title}</Text>
          <Text style={styles.programSubtitle}>{program.description}</Text>
          <Text style={styles.programDescription}>{getProgramDurationSummary(program)}</Text>
          <Text style={styles.weekText}>{getProgramWeekSummary(program)}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "0%" }]} />
            </View>
            <Text style={styles.progressValue}>{progressText}</Text>
          </View>
          <ButtonLink
            href={{ pathname: "/programs/program", params: { programId: program.id } }}
            label="View Program Details"
          />
        </View>
      </View>
    </WatercolorPanel>
  );
}

function ContinueCourse() {
  return (
    <WatercolorPanel style={styles.continuePanel}>
      <View style={styles.continueColumn}>
        <Text style={styles.panelTitle}>Continue Course</Text>
        <Text style={styles.mutedLabel}>Course Library</Text>
        <Text style={styles.courseName}>Choose the next assigned lesson</Text>
        <Text style={styles.lessonCount}>Progress updates after saved lesson records</Text>
        <View style={styles.smallTrack}>
          <View style={[styles.progressFill, { width: "0%" }]} />
        </View>
        <ButtonLink href="/lessons" label="Continue Learning" />
      </View>
      <View style={styles.completedColumn}>
        <Text style={styles.panelTitle}>Completed Lessons</Text>
        <View style={styles.ring}>
          <View style={styles.ringInner}>
            <Text style={styles.ringNumber}>0</Text>
            <Text style={styles.ringSub}>saved</Text>
          </View>
        </View>
        <Text style={styles.completedText}>No live lesson total loaded</Text>
        <ButtonLink href="/lessons" label="View All Lessons" />
      </View>
    </WatercolorPanel>
  );
}

function Milestones({ program }: { program: ProgramPathway }) {
  return (
    <WatercolorPanel style={styles.milestonePanel}>
      <HeaderArtwork />
      <View style={styles.milestoneContent}>
        <Text style={styles.star}>☆</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.panelTitle}>Upcoming Milestones</Text>
          <Text style={styles.mutedLabel}>Next review focus</Text>
          <Text style={styles.milestoneName}>{program.curation.reviewCadence}</Text>
          <Text style={styles.lessonCount}>Dates appear after saved case milestones are loaded</Text>
        </View>
        <ButtonLink href="/timeline" label="View Milestones" />
      </View>
    </WatercolorPanel>
  );
}

function Pathway({ program }: { program: ProgramPathway }) {
  const pathway = getProgramPathwaySegments(program);

  return (
    <WatercolorPanel style={styles.pathwayPanel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Program Pathway</Text>
          <Text style={styles.panelSub}>Follow your structured journey to a stronger family.</Text>
        </View>
        <Link href="/programs/main" asChild>
          <Pressable>
            <Text style={styles.viewLink}>View Full Pathway</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.pathLine} />
      <View style={styles.pathSteps}>
        {pathway.map(([number, title, weeks, complete]) => (
          <View key={number} style={styles.pathStep}>
            <View style={[styles.stepCircle, complete ? styles.stepCircleDone : number === "2" ? styles.stepCircleActive : null]}>
              <Text style={[styles.stepNumber, complete || number === "2" ? styles.stepNumberActive : null]}>{number}</Text>
            </View>
            <Text style={styles.stepTitle}>{title}</Text>
            <Text style={styles.stepWeeks}>{weeks}</Text>
            {complete ? <Text style={styles.stepCheck}>✓</Text> : null}
          </View>
        ))}
      </View>
    </WatercolorPanel>
  );
}

function ProgramProgress({ program, enrollment }: { program: ProgramPathway; enrollment?: ProgramEnrollment | null }) {
  const targetCompletion = addMonths(enrollment?.started_at, program.durationMonths);

  return (
    <WatercolorPanel style={styles.progressPanel}>
      <Text style={styles.panelTitle}>Program Progress</Text>
      <View style={styles.bigProgressRow}>
        <Text style={styles.chartIcon}>▥</Text>
        <View>
          <Text style={styles.bigPercent}>0%</Text>
          <Text style={styles.progressCaption}>Overall Progress</Text>
        </View>
      </View>
      <View style={styles.progressTrackWide}>
        <View style={[styles.progressFill, { width: "0%" }]} />
      </View>
      <View style={styles.dateRow}>
        <View>
          <Text style={styles.mutedLabel}>Started</Text>
          <Text style={styles.dateText}>{formatDate(enrollment?.started_at)}</Text>
        </View>
        <View>
          <Text style={styles.mutedLabel}>Target Completion</Text>
          <Text style={styles.dateText}>{formatDate(targetCompletion)}</Text>
        </View>
      </View>
    </WatercolorPanel>
  );
}

function CourseCategories() {
  return (
    <WatercolorPanel style={styles.categoriesPanel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Course Categories</Text>
          <Text style={styles.panelSub}>Explore by topic area</Text>
        </View>
        <Link href="/lessons" asChild>
          <Pressable>
            <Text style={styles.viewLink}>View All Courses</Text>
          </Pressable>
        </Link>
      </View>
      <View style={styles.categoryRow}>
        {categories.map(([title, count, color]) => (
          <Link key={title} href="/lessons" asChild>
            <Pressable style={styles.categoryCard}>
              <View style={[styles.categoryImage, { backgroundColor: color }]}>
                <Text style={styles.categoryIcon}>♡</Text>
              </View>
              <Text style={styles.categoryTitle}>{title}</Text>
              <View style={styles.categoryBottom}>
                <Text style={styles.categoryCount}>{count}</Text>
                <Text style={styles.categoryArrow}>›</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </WatercolorPanel>
  );
}

function Recommended({ program }: { program: ProgramPathway }) {
  return (
    <WatercolorPanel style={styles.recommendedPanel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Recommended for You</Text>
          <Text style={styles.panelSub}>Based on the selected program pathway</Text>
        </View>
        <Link href="/lessons" asChild>
          <Pressable>
            <Text style={styles.viewLink}>View All</Text>
          </Pressable>
        </Link>
      </View>
      <View style={styles.recommendRow}>
        {program.curation.requiredCourseIds.slice(0, 2).map((courseId, index) => (
          <RecommendedLesson
            key={courseId}
            title={courseId.replace(/-/g, " ")}
            meta={index === 0 ? "Required course" : "Required or assigned course"}
            body="Open the course library to continue the next worker-aligned learning step."
            purple={index === 1}
          />
        ))}
      </View>
    </WatercolorPanel>
  );
}

function RecommendedLesson({ title, meta, body, purple }: { title: string; meta: string; body: string; purple?: boolean }) {
  return (
    <View style={styles.recommendCard}>
      <View style={[styles.recommendImage, purple ? styles.recommendPurple : null]}>
        <Text style={styles.categoryIcon}>♡</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.recommendTitle}>{title}</Text>
        <Text style={styles.recommendMeta}>{meta}</Text>
        <Text style={styles.recommendBody}>{body}</Text>
        <ButtonLink href="/lessons" label="Start Lesson" />
      </View>
    </View>
  );
}

function Encouragement() {
  return (
    <View style={styles.encouragement}>
      <View style={styles.encouragementLeft}>
        <Text style={styles.star}>☆</Text>
        <View>
              <Text style={styles.encouragementTitle}>Keep building your record</Text>
            <Text style={styles.encouragementText}>Saved lessons, reflections, and evidence will make your progress clearer over time.</Text>
        </View>
      </View>
      <Text style={styles.quote}>“The best thing you can give your children: your time, your attention, and your love.”</Text>
    </View>
  );
}

function EmptyOrError({
  loading,
  error,
  activeCount,
  onRefresh,
}: {
  loading: boolean;
  error: string;
  activeCount: number;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.statusPanel}>
        <ActivityIndicator color="#0D8E8A" />
        <Text style={styles.statusText}>Loading your program pathway...</Text>
      </View>
    );
  }

  if (error.length > 0) {
    return (
      <View style={styles.errorPanel}>
        <Text style={styles.errorTitle}>Could not load programs</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={onRefresh} style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Refresh ›</Text>
        </Pressable>
      </View>
    );
  }

  if (activeCount === 0) {
    return (
      <View style={styles.statusPanel}>
        <Text style={styles.statusTitle}>No active program yet</Text>
        <Text style={styles.statusText}>
          Review and confirm the pathway saved from intake. SafeSteps will show any worker or governance safeguards before enrolment.
        </Text>
        <ButtonLink href="/programs/recommendation" label="Review Recommendation" />
      </View>
    );
  }

  return null;
}

export default function MyProgramsScreen() {
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 980;

  async function loadEnrollments() {
    setLoading(true);
    setError("");

    try {
      const savedEnrollments = await fetchMyProgramEnrollments();
      setEnrollments(savedEnrollments);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your programs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEnrollments();
  }, []);

  const activeEnrollments = enrollments.filter((enrollment) => enrollment.status === "active");
  const selectedProgram = useMemo(() => {
    const active = activeEnrollments[0];
    if (!active) return null;
    return programs.find((item) => item.id === active.program_id) ?? null;
  }, [activeEnrollments]);
  const selectedEnrollment = selectedProgram
    ? activeEnrollments.find((enrollment) => enrollment.program_id === selectedProgram.id) ?? null
    : null;

  return (
    <View style={styles.appShell}>
      {wide ? <Sidebar /> : null}
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <TopBar activeCount={activeEnrollments.length} />

        {!wide ? (
          <View style={styles.mobileNavNotice}>
            <Text style={styles.mobileNavText}>My Program</Text>
            <ButtonLink href="/parent-child" label="Parent-Child Profile" />
          </View>
        ) : null}

        <EmptyOrError loading={loading} error={error} activeCount={activeEnrollments.length} onRefresh={loadEnrollments} />

        {selectedProgram ? (
          <>
            <View style={styles.topGrid}>
              <CurrentProgram program={selectedProgram} />
              <ContinueCourse />
              <Milestones program={selectedProgram} />
            </View>

            <View style={styles.middleGrid}>
              <Pathway program={selectedProgram} />
              <ProgramProgress program={selectedProgram} enrollment={selectedEnrollment} />
            </View>

            <View style={styles.bottomGrid}>
              <CourseCategories />
              <Recommended program={selectedProgram} />
            </View>

            <Encouragement />
          </>
        ) : null}
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
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 34,
    gap: 14,
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
  pageTitle: {
    color: "#0B2742",
    fontSize: 28,
    fontWeight: "900",
  },
  pageSub: {
    color: "#0B2742",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
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
  topGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  middleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  bottomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "rgba(255,255,255,0.78)",
    padding: 18,
    overflow: "hidden",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  panelTitle: {
    color: "#0B2742",
    fontSize: 18,
    fontWeight: "900",
  },
  panelSub: {
    color: "#0B2742",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  currentProgram: {
    flex: 1.15,
    minWidth: 520,
  },
  currentProgramBody: {
    flexDirection: "row",
    gap: 24,
    marginTop: 14,
  },
  currentProgramText: {
    flex: 1,
  },
  artwork: {
    width: 210,
    height: 230,
    borderRadius: 8,
    backgroundColor: "#DCEFE8",
    overflow: "hidden",
  },
  artworkSmall: {
    width: 120,
    height: 140,
  },
  artSun: {
    position: "absolute",
    right: 30,
    top: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF2C8",
  },
  artHeart: {
    position: "absolute",
    left: 52,
    top: 40,
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 12,
    borderColor: "rgba(255,255,255,0.72)",
  },
  artPath: {
    position: "absolute",
    left: 84,
    bottom: -20,
    width: 54,
    height: 190,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.58)",
    transform: [{ rotate: "18deg" }],
  },
  artFamily: {
    position: "absolute",
    left: 78,
    bottom: 52,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  artAdult: {
    width: 14,
    height: 60,
    borderRadius: 7,
    backgroundColor: "#154B5C",
  },
  artAdultAlt: {
    width: 14,
    height: 56,
    borderRadius: 7,
    backgroundColor: "#256D70",
  },
  artChild: {
    width: 10,
    height: 38,
    borderRadius: 6,
    backgroundColor: "#1B9A90",
  },
  programName: {
    color: "#0B2742",
    fontSize: 19,
    fontWeight: "900",
  },
  programSubtitle: {
    color: "#0B2742",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },
  programDescription: {
    color: "#0B2742",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  weekText: {
    color: "#0B2742",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 18,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  progressTrack: {
    flex: 1,
    minWidth: 140,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E6E2DA",
    overflow: "hidden",
  },
  progressTrackWide: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E6E2DA",
    overflow: "hidden",
    marginTop: 22,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#28AAA1",
  },
  progressValue: {
    color: "#0B2742",
    fontSize: 20,
    fontWeight: "900",
  },
  outlineButton: {
    alignSelf: "flex-start",
    minWidth: 154,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.58)",
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#007D78",
    fontSize: 14,
    fontWeight: "900",
  },
  continuePanel: {
    flex: 1,
    minWidth: 480,
    flexDirection: "row",
    padding: 0,
  },
  continueColumn: {
    flex: 1,
    padding: 22,
    borderRightWidth: 1,
    borderRightColor: "#E4C997",
  },
  completedColumn: {
    width: 220,
    padding: 22,
    alignItems: "center",
  },
  mutedLabel: {
    color: "#3E6280",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 18,
  },
  courseName: {
    color: "#0B2742",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },
  lessonCount: {
    color: "#0B2742",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 16,
  },
  smallTrack: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E6E2DA",
    overflow: "hidden",
    marginVertical: 22,
  },
  ring: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 10,
    borderColor: "#28AAA1",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
  ringInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ringNumber: {
    color: "#0B2742",
    fontSize: 28,
    fontWeight: "900",
  },
  ringSub: {
    color: "#0B2742",
    fontSize: 13,
    fontWeight: "800",
  },
  completedText: {
    color: "#0B2742",
    fontSize: 14,
    fontWeight: "800",
    marginVertical: 18,
  },
  milestonePanel: {
    flex: 1,
    minWidth: 440,
    padding: 0,
  },
  headerArtwork: {
    height: 150,
    backgroundColor: "#F8DAC7",
    overflow: "hidden",
  },
  headerSun: {
    position: "absolute",
    left: "46%",
    top: 34,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF3C8",
  },
  headerMountain: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: "#BEDAE7",
    transform: [{ skewY: "-6deg" }],
  },
  headerFamily: {
    position: "absolute",
    left: "42%",
    bottom: 28,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 9,
  },
  headerAdult: {
    width: 16,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#275B72",
  },
  headerAdultAlt: {
    width: 16,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#426A8C",
  },
  headerChild: {
    width: 12,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#0E8B8B",
  },
  headerChildSmall: {
    width: 11,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#5470AE",
  },
  milestoneContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  star: {
    color: "#F2A51E",
    fontSize: 34,
    fontWeight: "900",
  },
  milestoneName: {
    color: "#0B2742",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    marginTop: 5,
  },
  pathwayPanel: {
    flex: 1.65,
    minWidth: 620,
  },
  pathLine: {
    position: "absolute",
    left: 126,
    right: 126,
    top: 106,
    height: 3,
    backgroundColor: "#BFC9C9",
  },
  pathSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 22,
  },
  pathStep: {
    flex: 1,
    alignItems: "center",
  },
  stepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F2EF",
    borderWidth: 2,
    borderColor: "#BFC9C9",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleDone: {
    backgroundColor: "#25A985",
    borderColor: "#25A985",
  },
  stepCircleActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#1AA59F",
  },
  stepNumber: {
    color: "#6B7777",
    fontSize: 18,
    fontWeight: "900",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepTitle: {
    color: "#0B2742",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
    minHeight: 34,
  },
  stepWeeks: {
    color: "#0B2742",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  stepCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#25A985",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "900",
    overflow: "hidden",
    marginTop: 10,
  },
  progressPanel: {
    flex: 1,
    minWidth: 360,
    backgroundColor: "#F7FBFA",
  },
  bigProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 18,
  },
  chartIcon: {
    color: "#8CCFC6",
    fontSize: 46,
    fontWeight: "900",
  },
  bigPercent: {
    color: "#0B2742",
    fontSize: 42,
    fontWeight: "900",
  },
  progressCaption: {
    color: "#0B2742",
    fontSize: 14,
    fontWeight: "800",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    gap: 20,
  },
  dateText: {
    color: "#0B2742",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },
  categoriesPanel: {
    flex: 1.25,
    minWidth: 540,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    overflow: "hidden",
    backgroundColor: "#FFFDF8",
  },
  categoryImage: {
    height: 92,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 12,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#8CCFC6",
    color: "#0B5C92",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "900",
    backgroundColor: "rgba(255,255,255,0.72)",
    overflow: "hidden",
  },
  categoryTitle: {
    color: "#0B2742",
    fontSize: 13,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingTop: 10,
    minHeight: 42,
  },
  categoryBottom: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  categoryCount: {
    flex: 1,
    color: "#0B2742",
    fontSize: 12,
    fontWeight: "700",
  },
  categoryArrow: {
    color: "#0B8C8A",
    fontSize: 24,
  },
  recommendedPanel: {
    flex: 1,
    minWidth: 460,
  },
  recommendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  recommendCard: {
    flex: 1,
    minWidth: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "#FFFDF8",
    padding: 12,
    flexDirection: "row",
    gap: 14,
  },
  recommendImage: {
    width: 112,
    minHeight: 140,
    borderRadius: 8,
    backgroundColor: "#DCEFE8",
    padding: 12,
  },
  recommendPurple: {
    backgroundColor: "#DCD2F0",
  },
  recommendTitle: {
    color: "#0B2742",
    fontSize: 16,
    fontWeight: "900",
  },
  recommendMeta: {
    color: "#3E6280",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },
  recommendBody: {
    color: "#0B2742",
    fontSize: 13,
    lineHeight: 19,
    marginVertical: 14,
  },
  encouragement: {
    minHeight: 86,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "rgba(255,255,255,0.76)",
    padding: 20,
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  encouragementLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
    minWidth: 320,
  },
  encouragementTitle: {
    color: "#0B2742",
    fontSize: 17,
    fontWeight: "900",
  },
  encouragementText: {
    color: "#0B2742",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  quote: {
    flex: 1,
    minWidth: 320,
    color: "#0B2742",
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    fontWeight: "700",
  },
  viewLink: {
    color: "#007D78",
    fontSize: 14,
    fontWeight: "900",
  },
  statusPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C997",
    backgroundColor: "#F7FBFA",
    padding: 16,
    gap: 10,
  },
  statusTitle: {
    color: "#0B2742",
    fontSize: 17,
    fontWeight: "900",
  },
  statusText: {
    color: "#0B2742",
    fontSize: 14,
    fontWeight: "700",
  },
  errorPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F0B4B4",
    backgroundColor: "#FFECEC",
    padding: 16,
    gap: 10,
  },
  errorTitle: {
    color: "#7A2020",
    fontSize: 17,
    fontWeight: "900",
  },
  errorText: {
    color: "#7A2020",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
});

