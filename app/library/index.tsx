import { Link, Redirect, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { courses, getGoldStandardCourses, type CourseCategory, type CourseLevel } from "../../curriculum/courses";
import { workshops } from "../../curriculum/workshops";
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
import { appLessons, getLessonDurationCategory } from "../../lib/lessonContent";
import { globalStyles } from "../../lib/styles";

type Section = "courses" | "programs" | "core" | "workshops";
type CourseScope = "gold" | "all";

const COURSE_CATEGORIES: CourseCategory[] = [
  "Communication",
  "Child Safety",
  "Parenting Skills",
  "Emotional Regulation",
  "Attachment",
  "Behaviour",
  "Family Wellbeing",
  "Co-Parenting",
  "Trauma",
  "Life Skills",
  "Other",
];

const COURSE_LEVELS: CourseLevel[] = ["foundational", "intermediate", "advanced"];

function formatLevel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export default function CurriculumLibraryScreen() {
  const { initializing, user } = useAuth();
  const [section, setSection] = useState<Section>("courses");
  const [courseScope, setCourseScope] = useState<CourseScope>("gold");
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | "all">("all");
  const [levelFilter, setLevelFilter] = useState<CourseLevel | "all">("all");
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();

  const displayedCourses = courses;
  const goldStandardCourses = useMemo(() => getGoldStandardCourses(), []);
  const goldStandardCourseIds = useMemo(
    () => new Set(goldStandardCourses.map((course) => course.id)),
    [goldStandardCourses],
  );
  const scopedCourses =
    section === "courses" && courseScope === "gold"
      ? displayedCourses.filter((course) => goldStandardCourseIds.has(course.id))
      : displayedCourses;
  const displayedLessons = appLessons;

  const filteredCourses = useMemo(
    () =>
      scopedCourses.filter((course) => {
        const matchesSearch = !search || `${course.title} ${course.description ?? ""}`.toLowerCase().includes(search);
        const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
        const matchesLevel = levelFilter === "all" || course.level === levelFilter;
        return matchesSearch && matchesCategory && matchesLevel;
      }),
    [scopedCourses, search, categoryFilter, levelFilter],
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
          `${lesson.title} ${lesson.summary}`
            .toLowerCase()
            .includes(search),
      ),
    [displayedLessons, search],
  );
  const filteredWorkshops = useMemo(
    () =>
      workshops.filter(
        (workshop) =>
          !search ||
          `${workshop.title} ${workshop.description} ${workshop.tags.join(" ")}`
            .toLowerCase()
            .includes(search),
      ),
    [search],
  );

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  const currentEmptyState =
    section === "courses"
      ? filteredCourses.length === 0
      : section === "programs"
      ? filteredPrograms.length === 0
      : section === "core"
      ? filteredLessons.length === 0
      : filteredWorkshops.length === 0;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Curriculum</Text>
      <Text style={globalStyles.subtitle}>
        Browse structured programs, standalone courses, core lessons, and workshops.
      </Text>

      <TextInput
        accessibilityLabel="Search curriculum"
        value={query}
        onChangeText={setQuery}
        placeholder="Search titles, topics, or skills"
        placeholderTextColor="#667085"
        style={globalStyles.input}
      />

      {/* Section tabs */}
      <View style={globalStyles.segmentedRow}>
        {([
          ["courses", `Courses (${displayedCourses.length})`],
          ["programs", `Programs (${programs.length})`],
          ["core", `Core (${displayedLessons.length})`],
          ["workshops", `Workshops (${workshops.length})`],
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

      {/* Courses: scope + category + level filters */}
      {section === "courses" && (
        <>
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

          <View style={globalStyles.segmentedRow}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: categoryFilter === "all" }}
              onPress={() => setCategoryFilter("all")}
              style={categoryFilter === "all" ? globalStyles.segmentSelected : globalStyles.segment}
            >
              <Text style={categoryFilter === "all" ? globalStyles.segmentTextSelected : globalStyles.segmentText}>All categories</Text>
            </Pressable>
            {COURSE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                accessibilityRole="radio"
                accessibilityState={{ selected: categoryFilter === cat }}
                onPress={() => setCategoryFilter(cat)}
                style={categoryFilter === cat ? globalStyles.segmentSelected : globalStyles.segment}
              >
                <Text style={categoryFilter === cat ? globalStyles.segmentTextSelected : globalStyles.segmentText}>{cat}</Text>
              </Pressable>
            ))}
          </View>

          <View style={globalStyles.segmentedRow}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: levelFilter === "all" }}
              onPress={() => setLevelFilter("all")}
              style={levelFilter === "all" ? globalStyles.segmentSelected : globalStyles.segment}
            >
              <Text style={levelFilter === "all" ? globalStyles.segmentTextSelected : globalStyles.segmentText}>All levels</Text>
            </Pressable>
            {COURSE_LEVELS.map((level) => (
              <Pressable
                key={level}
                accessibilityRole="radio"
                accessibilityState={{ selected: levelFilter === level }}
                onPress={() => setLevelFilter(level)}
                style={levelFilter === level ? globalStyles.segmentSelected : globalStyles.segment}
              >
                <Text style={levelFilter === level ? globalStyles.segmentTextSelected : globalStyles.segmentText}>{formatLevel(level)}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Video courses (pinned) */}
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

      {/* Course cards */}
      {section === "courses" &&
        filteredCourses.map((course) => (
          <Link key={course.id} href={{ pathname: "/courses/course", params: { courseId: course.id } }} asChild>
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{course.title}</Text>
              <Text style={globalStyles.cardText}>{course.description ?? "Generated SafeSteps curriculum course."}</Text>
              <Text style={globalStyles.mutedText}>
                {course.lessons.length} lessons
                {course.category ? ` · ${course.category}` : ""}
                {course.level ? ` · ${formatLevel(course.level)}` : ""}
              </Text>
            </Pressable>
          </Link>
        ))}

      {/* Program cards */}
      {section === "programs" &&
        filteredPrograms.map((program) => (
          <Link key={program.id} href={{ pathname: "/programs/program", params: { programId: program.id } }} asChild>
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{program.title}</Text>
              <Text style={globalStyles.cardText}>{program.description}</Text>
              <Text style={globalStyles.mutedText}>
                {program.durationMonths > 0 ? `${program.durationMonths} months` : "Flexible duration"}
                {program.workshopIds && program.workshopIds.length > 0
                  ? ` · ${program.workshopIds.length} workshop${program.workshopIds.length > 1 ? "s" : ""}`
                  : ""}
              </Text>
            </Pressable>
          </Link>
        ))}

      {/* Core lesson cards */}
      {section === "core" &&
        filteredLessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={{ pathname: "/lessons/[lessonId]", params: { lessonId: lesson.id } }}
            asChild
          >
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>Week {lesson.week}: {lesson.title}</Text>
              <Text style={globalStyles.cardText}>{lesson.summary}</Text>
              <Text style={globalStyles.mutedText}>
                {lesson.estimatedMinutes} min · {formatLevel(getLessonDurationCategory(lesson.estimatedMinutes))}
              </Text>
            </Pressable>
          </Link>
        ))}

      {/* Workshop cards */}
      {section === "workshops" &&
        filteredWorkshops.map((workshop) => (
          <Link
            key={workshop.id}
            href={{ pathname: "/workshops/[workshopId]", params: { workshopId: workshop.id } }}
            asChild
          >
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{workshop.title}</Text>
              <Text style={globalStyles.cardText}>{workshop.description}</Text>
              <Text style={globalStyles.mutedText}>
                {workshop.durationMinutes} min · {formatLevel(workshop.format)} · {formatLevel(workshop.level)}
              </Text>
            </Pressable>
          </Link>
        ))}

      {currentEmptyState && (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>No curriculum found</Text>
          <Text style={globalStyles.cardText}>Try a broader search term or adjust the filters.</Text>
        </View>
      )}

      {section === "workshops" && (
        <Link href={"/workshops/index" as Href} asChild>
          <Pressable style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Browse Full Workshop Library</Text>
          </Pressable>
        </Link>
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
