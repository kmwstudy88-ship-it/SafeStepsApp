import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { courseAreas, courses, getCoursesForArea } from "../../curriculum/courses";

type CourseView = "areas" | "all";

function CourseCard({ course }: { course: (typeof courses)[number] }) {
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "#eef3f5",
        borderRadius: 12,
        marginBottom: 14,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>{course.title}</Text>

      <Text style={{ marginTop: 6 }}>{course.description}</Text>

      <Text style={{ marginTop: 6 }}>Lessons: {course.lessons.length}</Text>

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
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: "#dcefe8",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Open Course</Text>
        </Pressable>
      </Link>
    </View>
  );
}

export default function CoursesScreen() {
  const [view, setView] = useState<CourseView>("areas");
  const totalAreaCourses = useMemo(
    () => new Set(courseAreas.flatMap((area) => area.courseIds)).size,
    [],
  );

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Courses
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Courses can be followed as structured learning paths or selected around
        the areas a parent needs most right now.
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
        <Pressable
          onPress={() => setView("areas")}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: view === "areas" ? "#2f5f4a" : "#f1f5f3",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: view === "areas" ? "#ffffff" : "#102033", fontWeight: "bold" }}>
            Areas of Need
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setView("all")}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: view === "all" ? "#2f5f4a" : "#f1f5f3",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: view === "all" ? "#ffffff" : "#102033", fontWeight: "bold" }}>
            All Courses
          </Text>
        </Pressable>
      </View>

      {view === "areas" ? (
        <>
          <View
            style={{
              padding: 16,
              backgroundColor: "#dcefe8",
              borderRadius: 12,
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Build around what is needed
            </Text>
            <Text style={{ marginTop: 6, lineHeight: 21 }}>
              Pick an area below to see a short, structured set of courses. This
              keeps the full library available while giving parents a clearer
              place to start.
            </Text>
            <Text style={{ marginTop: 8, fontWeight: "bold" }}>
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
                style={{
                  padding: 16,
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#d8e5dd",
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>{area.title}</Text>
                <Text style={{ marginTop: 6, lineHeight: 21 }}>{area.description}</Text>
                <Text style={{ marginTop: 8, fontWeight: "bold" }}>
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
                      style={{
                        marginTop: 10,
                        padding: 12,
                        backgroundColor:
                          course.id === area.suggestedStartCourseId ? "#dcefe8" : "#f7faf9",
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>{course.title}</Text>
                      <Text style={{ marginTop: 4 }}>
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
          <Text style={{ marginBottom: 14, fontWeight: "bold" }}>
            Full course library: {courses.length} courses
          </Text>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </>
      )}

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 28,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Need a full program instead?
        </Text>
        <Text style={{ marginTop: 6, lineHeight: 21 }}>
          Programs are longer pathways with monthly topics, weekly sub-topics,
          daily lessons, reflections, and evidence flow.
        </Text>
        <Link href="/programs" asChild>
          <Pressable
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: "#dcefe8",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
            <Text style={{ fontWeight: "bold" }}>Open Programs</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}
