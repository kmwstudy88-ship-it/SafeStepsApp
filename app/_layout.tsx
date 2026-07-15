import React from "react";
import { Stack } from "expo-router";

import { SensitiveRouteBoundary } from "../components/security/SensitiveRouteBoundary";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SensitiveRouteBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login/index" />
          <Stack.Screen name="register/index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="dashboard/index" />
          <Stack.Screen name="programs" />
          <Stack.Screen name="program-lessons/[programId]/[weekId]/[dayId]" />
          <Stack.Screen name="library/index" />
          <Stack.Screen name="challenges/index" />
          <Stack.Screen name="challenges/[challengeId]" />
          <Stack.Screen name="resources/index" />
          <Stack.Screen name="lessons/index" />
          <Stack.Screen name="tasks/index" />
          <Stack.Screen name="sessions/index" />
          <Stack.Screen name="documents/index" />
          <Stack.Screen name="referrals/index" />
          <Stack.Screen name="visits/index" />
          <Stack.Screen name="check-in" />
          <Stack.Screen name="daily-evidence" />
          <Stack.Screen name="evidence/index" />
          <Stack.Screen name="bulk-setup/index" />
          <Stack.Screen name="timeline/index" />
          <Stack.Screen name="family-meeting/index" />
          <Stack.Screen name="parent-child" />
          <Stack.Screen name="facilitator/index" />
          <Stack.Screen name="child-protection/index" />
          <Stack.Screen name="carer/index" />
          <Stack.Screen name="advocate/index" />
          <Stack.Screen name="assessments/index" />
          <Stack.Screen name="assessment-system/index" />
          <Stack.Screen name="assessment-system/case-setup" />
          <Stack.Screen name="assessment-system/records" />
          <Stack.Screen name="assessment-system/parent-profiles" />
          <Stack.Screen name="assessment-system/parent-identity" />
          <Stack.Screen name="assessment-system/scoring" />
          <Stack.Screen name="assessment-system/rubric-scoring" />
          <Stack.Screen name="assessment-system/evidence-uploads" />
          <Stack.Screen name="assessment-system/readiness-index" />
          <Stack.Screen name="assessment-system/report-output" />
          <Stack.Screen name="reports/index" />
          <Stack.Screen name="my-story" />
          <Stack.Screen name="settings" />
        </Stack>
      </SensitiveRouteBoundary>
    </AuthProvider>
  );
}
