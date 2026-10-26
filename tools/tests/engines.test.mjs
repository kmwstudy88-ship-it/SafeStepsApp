import test from 'node:test';
import assert from 'node:assert/strict';
import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  evaluateContactProgression,
  CONTACT_PROGRESSION_STAGES,
} = await importTypeScriptModule('../../lib/engines/contactProgressionEngine.ts');

const {
  evaluateFamilyMeetingSession,
} = await importTypeScriptModule('../../lib/engines/familyMeetingEngine.ts');

const {
  evaluatePsychometricQuality,
} = await importTypeScriptModule('../../lib/engines/psychometricEngine.ts');

const {
  evaluateKinshipSafetyCircle,
} = await importTypeScriptModule('../../lib/engines/kinshipSafetyCircleEngine.ts');

const {
  evaluateChildDevelopmentCapacity,
  deriveChildAgeBand,
} = await importTypeScriptModule('../../lib/engines/childDevelopmentCapacityEngine.ts');

const {
  evaluateLearningProgression,
} = await importTypeScriptModule('../../lib/engines/learningProgressionEngine.ts');

const {
  evaluateForensicAssurance,
} = await importTypeScriptModule('../../lib/engines/forensicAssuranceEngine.ts');

const {
  evaluateRegulationSimulation,
  BUILTIN_SCENARIOS,
} = await importTypeScriptModule('../../lib/engines/regulationScenarioEngine.ts');

test('contactProgressionEngine advances stage only when all prerequisites and visit thresholds are met', () => {
  const input = {
    caseId: 'case-123',
    currentStage: 'supervised',
    targetStage: 'community',
    recentVisits: Array.from({ length: 6 }, (_, i) => ({
      visitId: `v-${i}`,
      visitDate: '2026-09-01',
      stage: 'supervised',
      attended: true,
      onTime: true,
      incidentFree: true,
      positiveRepairObserved: true,
    })),
    safetyVerification: {
      functionalSafetyPlanCurrent: true,
      stableLivingEnvironmentVerified: true,
      substanceScreeningCompliant: true,
      supportNetworkActive: true,
      culturalSafetyPlanInPlace: true,
      accessibilityAccommodationsMet: true,
    },
    openSafetyIncidentsCount: 0,
    unresolvedContradictionsCount: 0,
    caseWorkerEndorsement: true,
  };

  const result = evaluateContactProgression(input);
  assert.equal(result.transitionAction, 'advance');
  assert.equal(result.recommendedStage, 'community');
  assert.equal(result.readyToAdvance, true);
  assert.equal(result.prerequisitesMet, true);
  assert.equal(result.supervisorSignoffRequired, true);
  assert.equal(result.decisionSupportOnly, true);
  assert.equal(result.humanReviewRequired, true);
});

test('contactProgressionEngine steps back stage when acute incidents occur', () => {
  const input = {
    caseId: 'case-123',
    currentStage: 'community',
    targetStage: 'overnight',
    recentVisits: [
      {
        visitId: 'v-1',
        visitDate: '2026-09-01',
        stage: 'community',
        attended: true,
        onTime: true,
        incidentFree: false,
        positiveRepairObserved: false,
      },
      {
        visitId: 'v-2',
        visitDate: '2026-09-08',
        stage: 'community',
        attended: true,
        onTime: true,
        incidentFree: false,
        positiveRepairObserved: false,
      },
    ],
    safetyVerification: {
      functionalSafetyPlanCurrent: true,
      stableLivingEnvironmentVerified: true,
      substanceScreeningCompliant: false,
      supportNetworkActive: true,
      culturalSafetyPlanInPlace: true,
      accessibilityAccommodationsMet: true,
    },
    openSafetyIncidentsCount: 2,
    unresolvedContradictionsCount: 1,
    caseWorkerEndorsement: false,
  };

  const result = evaluateContactProgression(input);
  assert.equal(result.transitionAction, 'step_back');
  assert.equal(result.recommendedStage, 'supervised');
  assert.equal(result.readyToAdvance, false);
  assert.ok(result.riskStepBackTriggers.length >= 2);
});

test('familyMeetingEngine resolves consensus and activates circuit breaker on deadlock or conflict', () => {
  // Test unanimous consensus
  const unanimousInput = {
    familyId: 'fam-1',
    sessionWeek: 1,
    nominations: [
      { activityId: 'act-1', title: 'Park Scavenger Hunt', nominatedByRole: 'Child', category: 'outdoor' },
      { activityId: 'act-2', title: 'Pizza Night', nominatedByRole: 'Parent', category: 'cooking' },
    ],
    votes: [
      { memberId: 'm-1', role: 'Child', preferredActivityId: 'act-1' },
      { memberId: 'm-2', role: 'Parent', preferredActivityId: 'act-1' },
    ],
    consensusTimerSeconds: 300,
    timerExpired: false,
    deadlockReported: false,
    conflictFlagRaised: false,
    previousStreak: 2,
  };

  const unanimousResult = evaluateFamilyMeetingSession(unanimousInput);
  assert.equal(unanimousResult.consensusType, 'Unanimous');
  assert.equal(unanimousResult.selectedActivityId, 'act-1');
  assert.equal(unanimousResult.updatedStreak, 3);
  assert.equal(unanimousResult.circuitBreaker.triggered, false);

  // Test circuit breaker on conflict
  const conflictInput = {
    ...unanimousInput,
    conflictFlagRaised: true,
  };
  const conflictResult = evaluateFamilyMeetingSession(conflictInput);
  assert.equal(conflictResult.circuitBreaker.triggered, true);
  assert.equal(conflictResult.circuitBreaker.reason, 'ConflictReported');
  assert.equal(conflictResult.updatedStreak, 2); // Streak preserved, not penalized
  assert.ok(conflictResult.clinicianTelemetryAlerts.length > 0);
});

test('psychometricEngine computes multi-source sufficiency and penalizes contradictions', () => {
  const input = {
    caseId: 'case-1',
    subjectId: 'subj-1',
    domains: [
      { domainId: 'd-safety', domainName: 'Home Safety Routines', minimumItemsRequired: 2, weight: 1 },
      { domainId: 'd-attunement', domainName: 'Parent-Child Attunement', minimumItemsRequired: 2, weight: 1 },
    ],
    evidenceItems: [
      {
        id: 'e-1',
        domainId: 'd-safety',
        sourceType: 'worker_observation',
        score: 85,
        observedAt: new Date().toISOString(),
        corroborated: true,
        contradicted: false,
      },
      {
        id: 'e-2',
        domainId: 'd-safety',
        sourceType: 'parent_reflection',
        score: 80,
        observedAt: new Date().toISOString(),
        corroborated: true,
        contradicted: false,
      },
      {
        id: 'e-3',
        domainId: 'd-attunement',
        sourceType: 'worker_observation',
        score: 40,
        observedAt: new Date().toISOString(),
        corroborated: false,
        contradicted: true,
      },
    ],
  };

  const result = evaluatePsychometricQuality(input);
  assert.equal(result.caseId, 'case-1');
  assert.equal(result.unresolvedContradictionsCount, 1);
  assert.equal(result.uncorroboratedClaimsCount, 1);
  assert.ok(result.competencyConfidence >= 0.1 && result.competencyConfidence <= 1);
  assert.equal(result.domainBreakdown.find((d) => d.domainId === 'd-safety').isSufficient, true);
  assert.equal(result.domainBreakdown.find((d) => d.domainId === 'd-attunement').isSufficient, false);
});

test('kinshipSafetyCircleEngine evaluates network resilience and flags 30-minute responder gaps', () => {
  const robustInput = {
    caseId: 'case-1',
    familyId: 'fam-1',
    members: [
      {
        memberId: 'mem-1',
        name: 'Grandmother',
        relationship: 'Maternal Grandmother',
        roleType: 'primary_kinship',
        verified: true,
        contactConfirmed: true,
        responseWindowMinutes: 20,
        hasExclusionFlag: false,
        availability: '24_7',
      },
      {
        memberId: 'mem-2',
        name: 'Uncle David',
        relationship: 'Maternal Uncle',
        roleType: 'secondary_backup',
        verified: true,
        contactConfirmed: true,
        responseWindowMinutes: 45,
        hasExclusionFlag: false,
        availability: 'on_call',
      },
      {
        memberId: 'mem-3',
        name: 'Neighbor Sarah',
        relationship: 'Trusted Community Neighbor',
        roleType: 'emergency_30min_responder',
        verified: true,
        contactConfirmed: true,
        responseWindowMinutes: 10,
        hasExclusionFlag: false,
        availability: 'on_call',
      },
    ],
  };

  const robustResult = evaluateKinshipSafetyCircle(robustInput);
  assert.equal(robustResult.tier, 'robust');
  assert.equal(robustResult.hasPrimarySupport, true);
  assert.equal(robustResult.hasThirtyMinuteResponder, true);
  assert.equal(robustResult.hasIndependentBackup, true);
  assert.equal(robustResult.boundaryBreachRiskIdentified, false);

  // Test boundary breach
  const breachInput = {
    ...robustInput,
    members: [
      ...robustInput.members,
      {
        memberId: 'mem-unsafe',
        name: 'Restricted Person',
        relationship: 'Ex-Partner',
        roleType: 'secondary_backup',
        verified: false,
        contactConfirmed: false,
        responseWindowMinutes: 30,
        hasExclusionFlag: true,
        exclusionReason: 'Active Intervention Order',
        availability: 'on_call',
      },
    ],
  };

  const breachResult = evaluateKinshipSafetyCircle(breachInput);
  assert.equal(breachResult.tier, 'critical_gap');
  assert.equal(breachResult.boundaryBreachRiskIdentified, true);
});

test('childDevelopmentCapacityEngine identifies age bands and flags adult conflict exposure', () => {
  assert.equal(deriveChildAgeBand(0.5), 'infant_0_12m');
  assert.equal(deriveChildAgeBand(4), 'early_childhood_1_5y');
  assert.equal(deriveChildAgeBand(8), 'middle_childhood_6_11y');
  assert.equal(deriveChildAgeBand(15), 'adolescent_12_17y');

  const input = {
    caseId: 'case-1',
    childAgeYears: 7,
    observations: [
      { dimension: 'emotional_attunement', rating: 4 },
      { dimension: 'behavioral_expectations', rating: 2 },
      { dimension: 'soothing_and_co_regulation', rating: 3 },
      { dimension: 'boundary_protection', rating: 1 },
      { dimension: 'daily_routine_structure', rating: 4 },
    ],
    adultDisputeInvolvementReported: true,
  };

  const result = evaluateChildDevelopmentCapacity(input);
  assert.equal(result.ageBand, 'middle_childhood_6_11y');
  assert.ok(result.mismatchFlags.some((f) => f.type === 'adultification_or_messenger'));
  assert.ok(result.mismatchFlags.some((f) => f.type === 'unrealistic_expectation'));
  assert.ok(result.strengthsIdentified.length >= 2);
  assert.ok(result.coachingRecommendations.length > 0);
});

test('learningProgressionEngine verifies completion and keeps education distinct from clinical clearance', () => {
  const input = {
    userId: 'user-123',
    course: {
      courseId: 'active-listening',
      courseTitle: 'Active Listening for Co-Parents',
      totalLessons: 4,
      requiredReflectionsCount: 2,
      passQuizScoreThreshold: 70,
    },
    completedLessons: [
      { lessonId: 'l-1', moduleId: 'm-1', completedAt: '2026-09-01', reflectionText: 'This lesson helped me understand pause before replying.', quizScorePercent: 85, timeSpentSeconds: 600 },
      { lessonId: 'l-2', moduleId: 'm-1', completedAt: '2026-09-02', reflectionText: 'Practiced naming feelings instead of defending myself.', quizScorePercent: 90, timeSpentSeconds: 700 },
      { lessonId: 'l-3', moduleId: 'm-2', completedAt: '2026-09-03', reflectionText: 'Learned about non-verbal cues and eye contact.', quizScorePercent: 75, timeSpentSeconds: 500 },
      { lessonId: 'l-4', moduleId: 'm-2', completedAt: '2026-09-04', reflectionText: 'Completed final review and repair practice session.', quizScorePercent: 95, timeSpentSeconds: 800 },
    ],
    integrityDeclarationAccepted: true,
  };

  const result = evaluateLearningProgression(input);
  assert.equal(result.completionPercent, 100);
  assert.equal(result.certificate.eligible, true);
  assert.ok(result.certificate.certificateId.startsWith('CERT-ACTIVE-LISTENING-'));
  assert.match(result.educationalDisclaimer, /educational learning modules/);
  assert.equal(result.decisionSupportOnly, true);
});

test('forensicAssuranceEngine flags procedural defects and hearsay without primary observation', () => {
  const input = {
    caseId: 'case-1',
    proposedInterventionSeverity: 'suspended_contact',
    supervisoryEndorsementPresent: false,
    artifacts: [
      {
        artifactId: 'art-1',
        title: 'Anonymous neighbor complaint',
        sourceType: 'anonymous_intake',
        sha256Digest: 'abc',
        integrityVerified: true,
        containsDirectObservation: false,
        containsHearsayOrRumor: true,
        participantGivenOpportunityToRespond: false,
        observedAt: '2026-09-01',
      },
    ],
  };

  const result = evaluateForensicAssurance(input);
  assert.equal(result.courtPackReadiness, 'high_evidentiary_risk');
  assert.ok(result.proportionalityConcerns.length > 0);
  assert.ok(result.fairnessDefectFlags.length > 0);
  assert.ok(result.mandatorySupervisorCheckpoints.length > 0);
});

test('regulationScenarioEngine runs interactive simulation and returns proficiency feedback', () => {
  const scenario = BUILTIN_SCENARIOS[0];
  const choice = scenario.choices[0]; // calm_pause choice

  const result = evaluateRegulationSimulation({
    scenarioId: scenario.id,
    selectedChoices: [choice],
  });

  assert.equal(result.scenarioId, scenario.id);
  assert.equal(result.totalStepsTaken, 1);
  assert.ok(result.deEscalationScore >= 50);
  assert.equal(result.decisionSupportOnly, true);
  assert.equal(result.humanReviewRequired, true);
  assert.match(result.educationalDisclaimer, /fictional practice modules/);
});
