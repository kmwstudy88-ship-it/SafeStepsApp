import { Link, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { courseAreas, courses, getCoursesForArea, getGoldStandardCourses } from "../../curriculum/courses";
import { listCurriculumCoursesFromApi } from "../../lib/curriculumApi";
import type { ApiCurriculumCourseSummary } from "../../lib/curriculumApi";
import { formatInteractiveVideoCourseAssetStatus } from "../../lib/data/interactiveVideoCourse";
import {
  nervousSystemVideoCourse,
} from "../../lib/data/nervousSystemVideoCourse";
import {
  strengtheningFamilyBondVideoCourse,
  strengtheningFamilyBondTitle,
  strengtheningFamilyBondVideoSteps,
} from "../../lib/data/strengtheningFamilyBondVideoCourse";
import { getSafeStepsLessonWatercolorPalette, safestepsLessonTheme } from "../../lib/safestepsLessonTheme";

type CourseView = "gold" | "areas" | "all";
type DisplayCourse = (typeof courses)[number] | ApiCurriculumCourseSummary;

function CourseCard({ course }: { course: DisplayCourse }) {
  const lessonCount = "lessons" in course ? `${course.lessons.length} lessons` : `${course.modules.length} modules`;
  const palette = getSafeStepsLessonWatercolorPalette(course.id);

  return (
    <View
      style={[styles.courseCard, { backgroundColor: palette.wash }]}
    >
      <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
      <Text style={styles.cardTitle}>{course.title}</Text>

      <Text style={styles.cardText}>{course.description ?? "Generated SafeSteps curriculum course."}</Text>

      <Text style={styles.metaText}>Structure: {lessonCount}</Text>

      <Link
        href={{
          pathname: "/courses/course",
          params: {
            courseId: course.id,
          },
        }}
        asChild
      >
        <Pressable
          style={StyleSheet.flatten([styles.cardButton, { backgroundColor: palette.accentDark }])}
        >
          <Text style={styles.cardButtonText}>Open Course</Text>
        </Pressable>
      </Link>
    </View>
  );
}

export default function CoursesScreen() {
  const [view, setView] = useState<CourseView>("gold");
  const [apiCourses, setApiCourses] = useState<ApiCurriculumCourseSummary[]>([]);
  const [apiReady, setApiReady] = useState(false);
  const goldStandardCourses = useMemo(() => getGoldStandardCourses(), []);
  const goldStandardLessonCount = useMemo(
    () => goldStandardCourses.reduce((total, course) => total + course.lessons.length, 0),
    [goldStandardCourses],
  );
  const totalAreaCourses = useMemo(
    () => new Set(courseAreas.flatMap((area) => area.courseIds)).size,
    [],
  );
  const allCourses = apiReady && apiCourses.length > 0 ? apiCourses : courses;

  useEffect(() => {
    let active = true;

    listCurriculumCoursesFromApi()
      .then((nextCourses) => {
        if (!active) return;
        setApiCourses(nextCourses);
        setApiReady(true);
      })
      .catch(() => {
        if (!active) return;
        setApiCourses([]);
        setApiReady(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.brand}>SafeSteps</Text>
      <Text style={styles.title}>Courses</Text>

      <Text style={styles.subtitle}>
        Courses can be followed as structured learning paths or selected around
        the areas a parent needs most right now.
      </Text>
      <Text style={styles.statusText}>
        {apiReady ? "All Courses is reading from the local Prisma curriculum API." : "All Courses is using the built-in course library until the local API is available."}
      </Text>

      <Link href={"/courses/video-series-pipeline" as Href} asChild>
        <Pressable style={styles.pipelineButton}>
          <Text style={styles.pipelineButtonText}>Review Video Series Pipeline</Text>
        </Pressable>
      </Link>

      <Link href={"/parent-lessons/nervous-system-regulation" as Href} asChild>
        <Pressable style={styles.videoCourseCard}>
          <Text style={styles.videoBadge}>Interactive video course</Text>
          <Text style={styles.cardTitle}>{nervousSystemVideoCourse.title}</Text>
          <Text style={styles.cardText}>{nervousSystemVideoCourse.description}</Text>
          <Text style={styles.metaText}>
            {nervousSystemVideoCourse.steps.length} videos | {formatInteractiveVideoCourseAssetStatus(nervousSystemVideoCourse)}
          </Text>
          <Text style={styles.videoCourseLink}>Open video course</Text>
        </Pressable>
      </Link>

      <Link href={"/parent-lessons/strengthening-family-bond" as Href} asChild>
        <Pressable style={styles.videoCourseCard}>
          <Text style={styles.videoBadge}>Interactive video course</Text>
          <Text style={styles.cardTitle}>{strengtheningFamilyBondTitle}</Text>
          <Text style={styles.cardText}>
            A 10-video parent lesson with reflections, a quiz checkpoint, and saved completion data.
          </Text>
          <Text style={styles.metaText}>
            {strengtheningFamilyBondVideoSteps.length} videos | {formatInteractiveVideoCourseAssetStatus(strengtheningFamilyBondVideoCourse)}
          </Text>
          <Text style={styles.videoCourseLink}>Open video course</Text>
        </Pressable>
      </Link>

      <View style={styles.segmentRow}>
        <Pressable
          onPress={() => setView("gold")}
          style={[styles.segmentButton, view === "gold" && styles.segmentButtonActive]}
        >
          <Text style={view === "gold" ? styles.segmentTextActive : styles.segmentText}>
            Gold Standard
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setView("areas")}
          style={[styles.segmentButton, view === "areas" && styles.segmentButtonActive]}
        >
          <Text style={view === "areas" ? styles.segmentTextActive : styles.segmentText}>
            Areas of Need
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setView("all")}
          style={[styles.segmentButton, view === "all" && styles.segmentButtonActive]}
        >
          <Text style={view === "all" ? styles.segmentTextActive : styles.segmentText}>
            All Courses
          </Text>
        </Pressable>
      </View>

      {view === "gold" ? (
        <>
          <View
            style={styles.featureCard}
          >
            <View style={styles.cardAccent} />
            <Text style={styles.cardTitle}>
              SafeSteps gold standard course library
            </Text>
            <Text style={styles.cardText}>
              These courses cover the areas many DFV, AOD, parenting, and reunification programs
              miss: nervous system education, intergenerational trauma, child empathy,
              shame resilience, practical life skills, digital safety, and community connection.
            </Text>
            <Text style={styles.metaText}>
              {goldStandardCourses.length} courses, {goldStandardLessonCount} lessons
            </Text>
          </View>

          {goldStandardCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </>
      ) : view === "areas" ? (
        <>
          <View
            style={styles.featureCard}
          >
            <View style={styles.cardAccent} />
            <Text style={styles.cardTitle}>
              Build around what is needed
            </Text>
            <Text style={styles.cardText}>
              Pick an area below to see a short, structured set of courses. This
              keeps the full library available while giving parents a clearer
              place to start.
            </Text>
            <Text style={styles.metaText}>
              {courseAreas.length} areas, {totalAreaCourses} launch courses mapped
            </Text>
          </View>

          {courseAreas.map((area) => {
            const areaCourses = getCoursesForArea(area.id);
            const suggestedCourse = areaCourses.find(
              (course) => course.id === area.suggestedStartCourseId,
            );

            return (
              <View
                key={area.id}
                style={styles.areaCard}
              >
                <Text style={styles.cardTitle}>{area.title}</Text>
                <Text style={styles.cardText}>{area.description}</Text>
                <Text style={styles.metaText}>
                  {areaCourses.length} course{areaCourses.length === 1 ? "" : "s"}
                  {suggestedCourse ? ` | Start with: ${suggestedCourse.title}` : ""}
                </Text>

                {areaCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={{
                      pathname: "/courses/course",
                      params: {
                        courseId: course.id,
                      },
                    }}
                    asChild
                  >
                    <Pressable
                      style={StyleSheet.flatten([
                        styles.areaCourseButton,
                        course.id === area.suggestedStartCourseId && styles.areaCourseButtonSuggested,
                      ])}
                    >
                      <Text style={styles.areaCourseTitle}>{course.title}</Text>
                      <Text style={styles.cardText}>
                        {course.lessons.length} lessons
                        {course.id === area.suggestedStartCourseId ? " | suggested start" : ""}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            );
          })}
        </>
      ) : (
        <>
          <Text style={styles.metaText}>
            Full course library: {allCourses.length} courses
          </Text>
          {allCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </>
      )}

      <View
        style={styles.featureCard}
      >
        <View style={styles.cardAccent} />
        <Text style={styles.cardTitle}>
          Need a full program instead?
        </Text>
        <Text style={styles.cardText}>
          Programs are longer pathways with monthly topics, weekly sub-topics,
          daily lessons, reflections, and evidence flow.
        </Text>
        <Link href="/programs" asChild>
          <Pressable
              style={styles.cardButton}
            >
            <Text style={styles.cardButtonText}>Open Programs</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 20,
    gap: 16,
    backgroundColor: safestepsLessonTheme.colors.background,
  },
  brand: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  title: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
  },
  statusText: {
    color: safestepsLessonTheme.colors.muted,
    fontWeight: "700",
    textAlign: "center",
  },
  pipelineButton: {
    alignSelf: "center",
    borderRadius: safestepsLessonTheme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: safestepsLessonTheme.colors.purpleDark,
  },
  pipelineButtonText: {
    color: safestepsLessonTheme.colors.white,
    fontWeight: "900",
  },
  videoCourseCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    backgroundColor: "#EFF8F4",
    ...safestepsLessonTheme.shadow,
  },
  videoBadge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: safestepsLessonTheme.radius.pill,
    backgroundColor: "#005766",
    color: safestepsLessonTheme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  videoCourseLink: {
    color: "#005766",
    fontSize: 14,
    fontWeight: "900",
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  segmentButton: {
    flexGrow: 1,
    borderRadius: safestepsLessonTheme.radius.pill,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 12,
    alignItems: "center",
    backgroundColor: safestepsLessonTheme.colors.card,
  },
  segmentButtonActive: {
    backgroundColor: safestepsLessonTheme.colors.purpleDark,
  },
  segmentText: {
    color: safestepsLessonTheme.colors.navy,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: safestepsLessonTheme.colors.white,
    fontWeight: "900",
  },
  courseCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    ...safestepsLessonTheme.shadow,
  },
  featureCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    backgroundColor: safestepsLessonTheme.colors.card,
    ...safestepsLessonTheme.shadow,
  },
  areaCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    backgroundColor: safestepsLessonTheme.colors.white,
  },
  cardAccent: {
    width: 52,
    height: 7,
    borderRadius: safestepsLessonTheme.radius.pill,
    backgroundColor: safestepsLessonTheme.colors.peach,
  },
  cardTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  cardText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  metaText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "900",
  },
  cardButton: {
    marginTop: 4,
    borderRadius: safestepsLessonTheme.radius.pill,
    padding: 14,
    alignItems: "center",
    backgroundColor: safestepsLessonTheme.colors.purpleDark,
  },
  cardButtonText: {
    color: safestepsLessonTheme.colors.white,
    fontWeight: "900",
  },
  areaCourseButton: {
    borderRadius: safestepsLessonTheme.radius.medium,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 14,
    backgroundColor: safestepsLessonTheme.colors.card,
  },
  areaCourseButtonSuggested: {
    backgroundColor: safestepsLessonTheme.colors.lavender,
  },
  areaCourseTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontWeight: "900",
  },
});
