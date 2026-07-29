import React from "react";
import { Stack } from "expo-router";

import { AdvancedAssessmentPreviewBoundary } from "../components/security/AdvancedAssessmentPreviewBoundary";
import { AuthRouteBoundary } from "../components/security/AuthRouteBoundary";
import { ProgramEnrollmentBoundary } from "../components/security/ProgramEnrollmentBoundary";
import { SensitiveRouteBoundary } from "../components/security/SensitiveRouteBoundary";
import { AuthProvider } from "../lib/auth";
import { CaseProvider } from "../lib/contexts/CaseContext";
import { EvidenceProvider } from "../lib/contexts/EvidenceContext";
import { FamilyProvider } from "../lib/contexts/FamilyContext";
import { SafetyProvider } from "../lib/contexts/SafetyContext";
import { TenantProvider } from "../lib/contexts/TenantContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthRouteBoundary>
        <SensitiveRouteBoundary>
        <ProgramEnrollmentBoundary>
          <AdvancedAssessmentPreviewBoundary>
            <TenantProvider>
              <FamilyProvider>
                <CaseProvider>
                  <SafetyProvider>
                    <EvidenceProvider>
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="login/index" />
                        <Stack.Screen name="register/index" />
                        <Stack.Screen name="forgot-password/index" />
                        <Stack.Screen name="reset-password/index" />
                        <Stack.Screen name="welcome" />
                        <Stack.Screen name="onboarding/how-safesteps-works" />
                        <Stack.Screen name="onboarding/privacy-parent-rights" />
                        <Stack.Screen name="onboarding/verify-account" />
                        <Stack.Screen name="onboarding/protect-account" />
                        <Stack.Screen name="onboarding/accessibility-preferences" />
                        <Stack.Screen name="dashboard/index" />
                        <Stack.Screen name="programs" />
                        <Stack.Screen name="program-lessons/[programId]/[weekId]/[dayId]" />
                        <Stack.Screen name="library/index" />
                        <Stack.Screen name="challenges/index" />
                        <Stack.Screen name="challenges/[challengeId]" />
                        <Stack.Screen name="resources/index" />
                        <Stack.Screen name="resources/child-wellbeing-check-in" />
                        <Stack.Screen name="resources/evidence-templates" />
                        <Stack.Screen name="resources/parenting-tools" />
                        <Stack.Screen name="resources/program-support" />
                        <Stack.Screen name="resources/safety-planning" />
                        <Stack.Screen name="resources/support-service-preparation" />
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
                        <Stack.Screen name="parent/daily-challenges/index" />
                        <Stack.Screen name="parent/daily-challenges/[id]" />
                        <Stack.Screen name="parent/daily-challenges/evidence" />
                        <Stack.Screen name="parent/daily-challenges/complete" />
                        <Stack.Screen name="parent/daily-challenges/rewards" />
                        <Stack.Screen name="parent/daily-challenges/streak" />
                        <Stack.Screen name="parent/daily-challenges/history" />
                        <Stack.Screen name="parent/daily-challenges/summary" />
                        <Stack.Screen name="parent/daily-challenges/settings" />
                        <Stack.Screen name="parent-lessons/strengthening-family-bond" />
                        <Stack.Screen name="parent-lessons/nervous-system-regulation" />
                        <Stack.Screen name="facilitator/index" />
                        <Stack.Screen name="facilitator/contact-session-log" />
                        <Stack.Screen name="child-protection/index" />
                        <Stack.Screen name="carer/index" />
                        <Stack.Screen name="advocate/index" />
                        <Stack.Screen name="assessments/index" />
                        <Stack.Screen name="intake-progress" />
                        <Stack.Screen name="intake-review" />
                        <Stack.Screen name="assessment-system/index" />
                        <Stack.Screen name="assessment-system/case-setup" />
                        <Stack.Screen name="assessment-system/records" />
                        <Stack.Screen name="assessment-system/parent-profiles" />
                        <Stack.Screen name="assessment-system/parent-identity" />
                        <Stack.Screen name="assessment-system/scoring" />
                        <Stack.Screen name="assessment-system/rubric-scoring" />
                        <Stack.Screen name="assessment-system/evidence-uploads" />
                        <Stack.Screen name="assessment-system/program-service-recommendations" />
                        <Stack.Screen name="assessment-system/document-intelligence" />
                        <Stack.Screen name="assessment-system/method-encyclopedia" />
                        <Stack.Screen name="assessment-system/sequence-knowledge" />
                        <Stack.Screen name="assessment-system/psychometric-engine" />
                        <Stack.Screen name="assessment-system/measurement-evidence-ontology" />
                        <Stack.Screen name="assessment-system/human-development-model" />
                        <Stack.Screen name="assessment-system/human-development-operating-system" />
                        <Stack.Screen name="assessment-system/platform-domain-architecture" />
                        <Stack.Screen name="assessment-system/implementation-blueprint" />
                        <Stack.Screen name="assessment-system/workflow-state-machines" />
                        <Stack.Screen name="assessment-system/fairness-governance" />
                        <Stack.Screen name="assessment-system/ai-governance" />
                        <Stack.Screen name="assessment-system/evidence-integrity" />
                        <Stack.Screen name="assessment-system/event-orchestration" />
                        <Stack.Screen name="assessment-system/api-service-contracts" />
                        <Stack.Screen name="assessment-system/readiness-index" />
                        <Stack.Screen name="assessment-system/contact-progression-review" />
                        <Stack.Screen name="assessment-system/home-again-transition-review" />
                        <Stack.Screen name="assessment-system/report-output" />
                        <Stack.Screen name="reports/index" />
                        <Stack.Screen name="my-story" />
                        <Stack.Screen name="settings" />
                      </Stack>
                    </EvidenceProvider>
                  </SafetyProvider>
                </CaseProvider>
              </FamilyProvider>
            </TenantProvider>
          </AdvancedAssessmentPreviewBoundary>
        </ProgramEnrollmentBoundary>
        </SensitiveRouteBoundary>
      </AuthRouteBoundary>
    </AuthProvider>
  );
}
