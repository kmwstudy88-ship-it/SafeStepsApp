import React from "react";
import { Stack } from "expo-router";

import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login/index" />
        <Stack.Screen name="register/index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="dashboard/index" />
        <Stack.Screen name="programs" />
        <Stack.Screen name="program-lessons/[programId]/[weekId]/[dayId]" />
        <Stack.Screen name="library/index" />
        <Stack.Screen name="resources/index" />
        <Stack.Screen name="lessons/index" />
        <Stack.Screen name="tasks/index" />
        <Stack.Screen name="check-in" />
        <Stack.Screen name="daily-evidence" />
        <Stack.Screen name="evidence/index" />
        <Stack.Screen name="bulk-setup/index" />
        <Stack.Screen name="timeline/index" />
        <Stack.Screen name="facilitator/index" />
        <Stack.Screen name="assessments/index" />
        <Stack.Screen name="reports/index" />
        <Stack.Screen name="my-story" />
        <Stack.Screen name="settings" />
      </Stack>
    </AuthProvider>
  );
}
