import { Stack } from "expo-router";

export default function ProgramsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Programs" }} />
      <Stack.Screen name="main" options={{ title: "Browse Programs" }} />
      <Stack.Screen name="my-programs" options={{ title: "My Programs" }} />
      <Stack.Screen name="program" options={{ title: "Program Pathway" }} />
      <Stack.Screen name="month" options={{ title: "Monthly Topic" }} />
      <Stack.Screen name="week" options={{ title: "Weekly Sub-Topic" }} />
      <Stack.Screen name="reflection" options={{ title: "Reflection" }} />
      <Stack.Screen name="lesson" options={{ title: "Daily Lesson" }} />
    </Stack>
  );
}