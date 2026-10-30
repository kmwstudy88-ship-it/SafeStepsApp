import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getCasePlan,
  getCaseTasks,
  calculateCaseProgress,
  updateCasePlanActionStatus,
  pauseActionComplianceTimer,
  toggleCaseTaskCompletion,
  recordParentGoalPerspective,
} = await importTypeScriptModule('../../lib/parentWorkspace/casePlanService.ts');

test('getCasePlan returns active case plan conforming to canonical hierarchy', async () => {
  const plan = await getCasePlan('demo_case');
  assert(plan);
  assert.equal(plan.planStatus, 'active');
  assert(Array.isArray(plan.goals));
  assert(plan.goals.length >= 3);

  const safetyGoal = plan.goals.find((g) => g.id === 'goal_01');
  assert(safetyGoal);
  assert.equal(safetyGoal.goalDomain, 'child_safety');
  assert.equal(safetyGoal.priorityLevel, 'essential');
  assert(safetyGoal.actions.length >= 3);
  assert(safetyGoal.childVoiceSummary);
});

test('calculateCaseProgress computes accurate progress and domain breakdown', async () => {
  const plan = await getCasePlan('demo_case');
  assert(plan);

  const progress = calculateCaseProgress(plan);
  assert(typeof progress.overallPercentage === 'number');
  assert(progress.overallPercentage >= 0 && progress.overallPercentage <= 100);
  assert.equal(progress.totalGoals, plan.goals.length);
  assert(progress.totalActions >= progress.completedActions);

  // Check domain breakdown
  assert(progress.domainProgress.child_safety);
  assert(progress.domainProgress.emotional_regulation);
  assert(progress.domainProgress.parenting_skills);
});

test('updateCasePlanActionStatus updates status, links evidence, and recalculates goal progress', async () => {
  const planBefore = await getCasePlan('demo_case');
  const targetGoal = planBefore.goals.find((g) => g.id === 'goal_01');
  const targetAction = targetGoal.actions.find((a) => a.id === 'act_01_03');
  assert.equal(targetAction.actionStatus, 'pending');

  const result = await updateCasePlanActionStatus({
    caseId: 'demo_case',
    goalId: 'goal_01',
    actionId: 'act_01_03',
    newStatus: 'completed',
    evidenceVaultId: 'ev_home_safety_walkthrough_01',
  });

  assert.equal(result.success, true);
  const updatedPlan = result.plan;
  const updatedGoal = updatedPlan.goals.find((g) => g.id === 'goal_01');
  const updatedAction = updatedGoal.actions.find((a) => a.id === 'act_01_03');

  assert.equal(updatedAction.actionStatus, 'completed');
  assert(updatedAction.linkedEvidenceVaultIds.includes('ev_home_safety_walkthrough_01'));

  // All 3 actions in goal_01 are now completed -> progressScore = 100%, status = 'demonstrated'
  assert.equal(updatedGoal.progressScore, 100);
  assert.equal(updatedGoal.status, 'demonstrated');
});

test('toggleCaseTaskCompletion toggles completed boolean and timestamp', async () => {
  const tasksBefore = await getCaseTasks('demo_case');
  const task = tasksBefore.find((t) => t.id === 'task_01');
  assert.equal(task.isCompleted, false);

  const toggleRes = await toggleCaseTaskCompletion('demo_case', 'task_01');
  assert.equal(toggleRes.success, true);
  assert.equal(toggleRes.task.isCompleted, true);
  assert(toggleRes.task.completedAt);

  // Toggle back
  const toggleBackRes = await toggleCaseTaskCompletion('demo_case', 'task_01');
  assert.equal(toggleBackRes.success, true);
  assert.equal(toggleBackRes.task.isCompleted, false);
});

test('recordParentGoalPerspective attaches procedural view and flags disagreement', async () => {
  const result = await recordParentGoalPerspective({
    caseId: 'demo_case',
    goalId: 'goal_02',
    parentPerspective: 'Requesting weekend psychoeducation sessions as weekday shifts conflict with work hours.',
  });

  assert.equal(result.success, true);
  assert.equal(
    result.goal.parentDisagreement,
    'Requesting weekend psychoeducation sessions as weekday shifts conflict with work hours.'
  );

  const updatedPlan = await getCasePlan('demo_case');
  assert.equal(updatedPlan.familyDisagreementRecorded, true);
});

test('updateCasePlanActionStatus and recordParentGoalPerspective handle errors gracefully', async () => {
  const invalidAction = await updateCasePlanActionStatus({
    caseId: 'demo_case',
    goalId: 'goal_01',
    actionId: 'non_existent_action',
    newStatus: 'completed',
  });
  assert.equal(invalidAction.success, false);
  assert.match(invalidAction.error, /Action not found/i);

  const emptyPerspective = await recordParentGoalPerspective({
    caseId: 'demo_case',
    goalId: 'goal_01',
    parentPerspective: '   ',
  });
  assert.equal(emptyPerspective.success, false);
  assert.match(emptyPerspective.error, /cannot be empty/i);
});

test('pauseActionComplianceTimer pauses compliance clock for agency waitlist without penalizing overallPercentage', async () => {
  const planBefore = await getCasePlan('demo_case');
  const progressBefore = calculateCaseProgress(planBefore);

  const pauseRes = await pauseActionComplianceTimer({
    caseId: 'demo_case',
    goalId: 'goal_02',
    actionId: 'act_02_02',
    barrierReason: '14-week agency waitlist for trauma-informed ABC parenting coach',
  });

  assert.equal(pauseRes.success, true);
  const updatedGoal = pauseRes.plan.goals.find((g) => g.id === 'goal_02');
  const pausedAction = updatedGoal.actions.find((a) => a.id === 'act_02_02');

  assert.equal(pausedAction.actionStatus, 'blocked');
  assert.equal(pausedAction.complianceTimerPaused, true);
  assert.equal(pausedAction.systemicBarrierNote, '14-week agency waitlist for trauma-informed ABC parenting coach');

  const progressAfter = calculateCaseProgress(pauseRes.plan);
  assert.equal(progressAfter.pausedByBarrierActions, 1);
  // Active denominator shrinks by 1 uncompleted action, so overallPercentage does not drop
  assert(progressAfter.overallPercentage >= progressBefore.overallPercentage);
});
