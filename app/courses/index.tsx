import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { courses } from "../../lib/data/courses";

export default function CoursesScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Courses
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Courses are standalone learning units. They do not use monthly topics or
        weekly sub-topics like the main programs.
      </Text>

      {courses.map((course) => (
        <View
          key={course.id}
          style={{
            padding: 16,
            backgroundColor: "#eef3f5",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            {course.title}
          </Text>

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
      ))}
    </ScrollView>
  );
}
