import { Stack } from "expo-router";

export default function CoursesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Courses" }} />
      <Stack.Screen name="course" options={{ title: "Course Player" }} />
      <Stack.Screen name="video-series-pipeline" options={{ title: "Video Series Pipeline" }} />
      <Stack.Screen name="video-series-pipeline/[seriesId]" options={{ title: "Series Review" }} />
    </Stack>
  );
}
