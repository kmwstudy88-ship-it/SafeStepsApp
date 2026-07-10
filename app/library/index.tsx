import { Link, Redirect, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { courses } from "../../curriculum/courses";
import { programs } from "../../lib/data/programs";
import { appLessons } from "../../lib/lessonContent";
import { globalStyles } from "../../lib/styles";

type Section = "courses" | "programs" | "core";

export default function CurriculumLibraryScreen() {
  const { initializing, user } = useAuth();
  const [section, setSection] = useState<Section>("courses");
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();

  const filteredCourses = useMemo(
    () => courses.filter((course) => !search || `${course.title} ${course.description}`.toLowerCase().includes(search)),
    [search],
  );
  const filteredPrograms = useMemo(
    () => programs.filter((program) => !search || `${program.title} ${program.description}`.toLowerCase().includes(search)),
    [search],
  );
  const filteredLessons = useMemo(
    () => appLessons.filter((lesson) => !search || `${lesson.title} ${lesson.summary}`.toLowerCase().includes(search)),
    [search],
  );

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Curriculum</Text>
      <Text style={globalStyles.subtitle}>
        Browse structured programs, standalone courses, and the core SafeSteps lesson pathway.
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
          ["courses", `Courses (${courses.length})`],
          ["programs", `Programs (${programs.length})`],
          ["core", `Core lessons (${appLessons.length})`],
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

      {section === "courses" &&
        filteredCourses.map((course) => (
          <Link key={course.id} href={{ pathname: "/courses/course", params: { courseId: course.id } }} asChild>
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{course.title}</Text>
              <Text style={globalStyles.cardText}>{course.description}</Text>
              <Text style={globalStyles.mutedText}>{course.lessons.length} lessons</Text>
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
          <Link key={lesson.id} href={{ pathname: "/lessons/[lessonId]", params: { lessonId: lesson.id } }} asChild>
            <Pressable style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>Week {lesson.week}: {lesson.title}</Text>
              <Text style={globalStyles.cardText}>{lesson.summary}</Text>
              <Text style={globalStyles.mutedText}>{lesson.estimatedMinutes} minutes</Text>
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
