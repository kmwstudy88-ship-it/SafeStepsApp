import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { courses } from "../../lib/data/courses";

export default function CoursePlayerScreen() {
  const params = useLocalSearchParams();
  const courseId = String(params.courseId ?? "");

  const course = courses.find((item) => item.id === courseId) ?? courses[0];

  const [viewedLessons, setViewedLessons] = useState<Record<number, boolean>>(
    {}
  );

  const allLessonsViewed = useMemo(() => {
    return course.lessons.every((lesson) => viewedLessons[lesson.lessonNumber]);
  }, [course.lessons, viewedLessons]);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        {course.title}
      </Text>

      <Text style={{ marginBottom: 16 }}>{course.description}</Text>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Course Structure
        </Text>
        <Text style={{ marginTop: 6 }}>
          This is a standalone course. It uses simple lessons and a final
          completion step. It does not use monthly or weekly program structure.
        </Text>
      </View>

      {course.lessons.map((lesson) => (
        <View
          key={lesson.lessonNumber}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Lesson {lesson.lessonNumber}: {lesson.title}
          </Text>

          <Text style={{ marginTop: 6 }}>
            Duration: {lesson.durationMinutes} minutes
          </Text>

          <Text style={{ marginTop: 8 }}>
            Course lesson content will be displayed here.
          </Text>

          <Pressable
            onPress={() =>
              setViewedLessons((current) => ({
                ...current,
                [lesson.lessonNumber]: true,
              }))
            }
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              backgroundColor: viewedLessons[lesson.lessonNumber]
                ? "#dcefe8"
                : "#eef3f5",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              {viewedLessons[lesson.lessonNumber]
                ? "Lesson Viewed"
                : "Mark Lesson Viewed"}
            </Text>
          </Pressable>
        </View>
      ))}

      <View
        style={{
          padding: 16,
          backgroundColor: allLessonsViewed ? "#dcefe8" : "#e5e5e5",
          borderRadius: 12,
          marginBottom: 40,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          {allLessonsViewed
            ? "Course Ready for Completion"
            : "Complete all course lessons first"}
        </Text>

        <Text style={{ marginTop: 6 }}>
          Final quiz and certificate generation will be added in the next build
          stage.
        </Text>
      </View>
    </ScrollView>
  );
}
