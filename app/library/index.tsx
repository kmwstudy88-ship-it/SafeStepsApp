import { Link, Redirect, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { courses, getGoldStandardCourses } from "../../curriculum/courses";
import {
  listCurriculumCoursesFromApi,
  listCurriculumLessonsFromApi,
} from "../../lib/curriculumApi";
import type { ApiCurriculumCourseSummary, ApiCurriculumLessonSummary } from "../../lib/curriculumApi";
import { formatInteractiveVideoCourseAssetStatus } from "../../lib/data/interactiveVideoCourse";
import {
  nervousSystemVideoCourse,
} from "../../lib/data/nervousSystemVideoCourse";
import {
  strengtheningFamilyBondVideoCourse,
  strengtheningFamilyBondTitle,
  strengtheningFamilyBondVideoSteps,
} from "../../lib/data/strengtheningFamilyBondVideoCourse";
import { programs } from "../../lib/data/programs";
import { appLessons } from "../../lib/lessonContent";
import { globalStyles } from "../../lib/styles";

type Section = "courses" | "programs" | "core";
type CourseScope = "gold" | "all";

export default function CurriculumLibraryScreen() {
  const { initializing, user } = useAuth();
  const [section, setSection] = useState<Section>("courses");
  const [courseScope, setCourseScope] = useState<CourseScope>("gold");
  const [query, setQuery] = useState("");
  const [apiCourses, setApiCourses] = useState<ApiCurriculumCourseSummary[]>([]);
  const [apiLessons, setApiLessons] = useState<ApiCurriculumLessonSummary[]>([]);
  const [apiReady, setApiReady] = useState(false);
  const search = query.trim().toLowerCase();

  useEffect(() => {
    let active = true;

    Promise.all([listCurriculumCoursesFromApi(), listCurriculumLessonsFromApi(100)])
      .then(([nextCourses, nextLessons]) => {
        if (!active) return;
        setApiCourses(nextCourses);
        setApiLessons(nextLessons);
        setApiReady(true);
      })
      .catch(() => {
        if (!active) return;
        setApiCourses([]);
        setApiLessons([]);
        setApiReady(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const displayedCourses = apiReady && apiCourses.length > 0 ? apiCourses : courses;
  const goldStandardCourses = useMemo(() => getGoldStandardCourses(), []);
  const goldStandardCourseIds = useMemo(
    () => new Set(goldStandardCourses.map((course) => course.id)),
    [goldStandardCourses],
  );
  const scopedCourses =
    section === "courses" && courseScope === "gold" && !(apiReady && apiCourses.length > 0)
      ? displayedCourses.filter((course) => goldStandardCourseIds.has(course.id))
      : displayedCourses;
  const displayedLessons = apiReady && apiLessons.length > 0 ? apiLessons : appLessons;

  const filteredCourses = useMemo(
    () =>
      scopedCourses.filter(
        (course) => !search || `${course.title} ${course.description ?? ""}`.toLowerCase().includes(search),
      ),
    [scopedCourses, search],
  );
  const filteredPrograms = useMemo(
    () => programs.filter((program) => !search || `${program.title} ${program.description}`.toLowerCase().includes(search)),
    [search],
  );
  const filteredLessons = useMemo(
    () =>
      displayedLessons.filter(
        (lesson) =>
          !search ||
          `${lesson.title} ${"summary" in lesson ? lesson.summary : lesson.content ?? lesson.body ?? ""}`
            .toLowerCase()
            .includes(search),
      ),
    [displayedLessons, search],
  );

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Curriculum</Text>
      <Text style={globalStyles.subtitle}>
        Browse structured programs, standalone courses, and the core SafeSteps lesson pathway.
      </Text>
      <Text style={globalStyles.mutedText}>
        {apiReady ? "Showing Prisma-backed curriculum from the local SafeSteps API." : "Showing built-in curriculum while the local API is unavailable."}
      </Text>

      <TextInput
        accessibilityLabel="Search curriculum"
        value={query}
        onChangeText={setQuery}
        placeholder="Search titles, topics, or skills"
        placeholderTextColor="#667085"
        style={globalStyles.input}
      />

      <View style={globalStyles.segmentedRow}>
        {([
          ["courses", `Courses (${displayedCourses.length})`],
          ["programs", `Programs (${programs.length})`],
          ["core", `Core lessons (${displayedLessons.length})`],
        ] as const).map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: section === value }}
            onPress={() => setSection(value)}
            style={section === value ? globalStyles.segmentSelected : globalStyles.segment}
          >
            <Text style={section === value ? globalStyles.segmentTextSelected : globalStyles.segmentText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {section === "courses" && (
        <View style={globalStyles.segmentedRow}>
          {([
            ["gold", `Gold standard (${goldStandardCourses.length})`],
            ["all", `All courses (${displayedCourses.length})`],
          ] as const).map(([value, label]) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: courseScope === value }}
              onPress={() => setCourseScope(value)}
              style={courseScope === value ? globalStyles.segmentSelected : globalStyles.segment}
            >
              <Text style={courseScope === value ? globalStyles.segmentTextSelected : globalStyles.segmentText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {section === "courses" && (
        <>
          <Link href={"/parent-lessons/nervous-system-regulation" as Href} asChild>
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{nervousSystemVideoCourse.title}</Text>
              <Text style={globalStyles.cardText}>{nervousSystemVideoCourse.description}</Text>
              <Text style={globalStyles.mutedText}>
                {nervousSystemVideoCourse.steps.length} videos | {formatInteractiveVideoCourseAssetStatus(nervousSystemVideoCourse)}
              </Text>
            </Pressable>
          </Link>

          <Link href={"/parent-lessons/strengthening-family-bond" as Href} asChild>
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{strengtheningFamilyBondTitle}</Text>
              <Text style={globalStyles.cardText}>
                Interactive 10-video course with reflections, a quiz checkpoint, and saved completion data.
              </Text>
              <Text style={globalStyles.mutedText}>
                {strengtheningFamilyBondVideoSteps.length} videos | {formatInteractiveVideoCourseAssetStatus(strengtheningFamilyBondVideoCourse)}
              </Text>
            </Pressable>
          </Link>
        </>
      )}

      {section === "courses" &&
        filteredCourses.map((course) => (
          <Link key={course.id} href={{ pathname: "/courses/course", params: { courseId: course.id } }} asChild>
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{course.title}</Text>
              <Text style={globalStyles.cardText}>{course.description ?? "Generated SafeSteps curriculum course."}</Text>
              <Text style={globalStyles.mutedText}>
                {"lessons" in course ? `${course.lessons.length} lessons` : `${course.modules.length} modules from Prisma`}
              </Text>
            </Pressable>
          </Link>
        ))}

      {section === "programs" &&
        filteredPrograms.map((program) => (
          <Link key={program.id} href={{ pathname: "/programs/program", params: { programId: program.id } }} asChild>
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{program.title}</Text>
              <Text style={globalStyles.cardText}>{program.description}</Text>
              <Text style={globalStyles.mutedText}>
                {program.durationMonths > 0 ? `${program.durationMonths} months` : "Flexible duration"}
              </Text>
            </Pressable>
          </Link>
        ))}

      {section === "core" &&
        filteredLessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={"estimatedMinutes" in lesson ? { pathname: "/lessons/[lessonId]", params: { lessonId: lesson.id } } : ("/library" as Href)}
            asChild
          >
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>
                {"week" in lesson ? `Week ${lesson.week}: ${lesson.title}` : lesson.title}
              </Text>
              <Text style={globalStyles.cardText}>
                {"summary" in lesson ? lesson.summary : lesson.content ?? lesson.body ?? "Generated lesson content pending review."}
              </Text>
              <Text style={globalStyles.mutedText}>
                {"estimatedMinutes" in lesson ? `${lesson.estimatedMinutes} minutes` : lesson.weekId ?? lesson.sourcePath}
              </Text>
            </Pressable>
          </Link>
        ))}

      {(section === "courses" ? filteredCourses : section === "programs" ? filteredPrograms : filteredLessons).length === 0 && (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>No curriculum found</Text>
          <Text style={globalStyles.cardText}>Try a broader search term.</Text>
        </View>
      )}

      <Link href={"/challenges" as Href} asChild>
        <Pressable style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>Open Challenges</Text>
        </Pressable>
      </Link>
      <AppBottomNav />
    </ScrollView>
  );
}
