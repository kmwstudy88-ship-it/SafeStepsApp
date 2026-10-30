/**
 * SafeSteps Case Plan & Progress Checklist Service (SS-PAR-001 - SS-PAR-005)
 *
 * Implements the canonical planning hierarchy:
 * case_plans -> case_plan_goals -> case_plan_actions -> case_tasks
 *
 * Strictly adheres to docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md.
 * Provides parent-facing progress calculations, procedural disagreement logging,
 * task scheduling, and evidence vault linking.
 */

export type CasePlanStatus = 'draft' | 'active' | 'under_review' | 'completed' | 'superseded';

export type GoalDomain =
  | 'parenting_skills'
  | 'child_safety'
  | 'emotional_regulation'
  | 'substance_recovery'
  | 'stable_housing'
  | 'family_relationships';

export type GoalPriority = 'essential' | 'high' | 'medium';

export type GoalStatus = 'not_started' | 'in_progress' | 'demonstrated' | 'completed';

export type ActionType =
  | 'curriculum_lesson'
  | 'evidence_milestone'
  | 'assessment'
  | 'appointment'
  | 'behavioural_routine';

export type AssignedToType = 'parent' | 'caseworker' | 'carer' | 'joint';

export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export type TaskCategory = 'program_lesson' | 'vault_proof' | 'appointment' | 'reflection';

export interface CasePlanAction {
  id: string;
  casePlanGoalId: string;
  actionReference: string;
  actionTitle: string;
  actionDescription: string;
  actionType: ActionType;
  assignedToType: AssignedToType;
  actionStatus: ActionStatus;
  dueAt?: string;
  completionEvidenceRequired: boolean;
  completionEvidenceSummary?: string;
  linkedEvidenceVaultIds?: string[];
  linkedRoute?: string;
  sequenceOrder: number;
  complianceTimerPaused?: boolean;
  systemicBarrierNote?: string;
}

export interface CasePlanGoal {
  id: string;
  casePlanId: string;
  goalReference: string;
  goalTitle: string;
  goalDescription?: string;
  goalDomain: GoalDomain;
  priorityLevel: GoalPriority;
  targetDate?: string;
  status: GoalStatus;
  progressScore: number; // 0 to 100 percentage
  childVoiceSummary?: string;
  parentViewSummary?: string;
  workerViewSummary?: string;
  parentDisagreement?: string;
  sequenceOrder: number;
  actions: CasePlanAction[];
}

export interface CasePlan {
  id: string;
  caseId: string;
  planTitle: string;
  planVersion: number;
  planStatus: CasePlanStatus;
  effectiveFrom?: string;
  reviewDueAt?: string;
  createdWithFamily: boolean;
  familyDisagreementRecorded: boolean;
  goals: CasePlanGoal[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseTask {
  id: string;
  caseId: string;
  actionId?: string;
  title: string;
  description?: string;
  category: TaskCategory;
  dueAt: string;
  isCompleted: boolean;
  completedAt?: string;
  linkedRoute?: string;
}

export interface CaseProgressSummary {
  overallPercentage: number;
  totalGoals: number;
  demonstratedGoals: number;
  totalActions: number;
  completedActions: number;
  pausedByBarrierActions?: number;
  domainProgress: Record<GoalDomain, { total: number; completed: number; percentage: number }>;
}

// In-memory store for active plans and tasks
const localCasePlans = new Map<string, CasePlan>();
const localCaseTasks = new Map<string, CaseTask[]>();

// Canonical default mock case plan
export const DEFAULT_MOCK_CASE_PLAN: CasePlan = {
  id: 'plan_reunification_01',
  caseId: 'demo_case',
  planTitle: 'SafeSteps Family Reunification & Safety Roadmap',
  planVersion: 1,
  planStatus: 'active',
  effectiveFrom: '2026-08-01',
  reviewDueAt: '2026-11-15T09:00:00Z',
  createdWithFamily: true,
  familyDisagreementRecorded: false,
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-10-28T12:00:00Z',
  goals: [
    {
      id: 'goal_01',
      casePlanId: 'plan_reunification_01',
      goalReference: 'G-SAFETY-01',
      goalTitle: 'Maintain Safe Home Environment & Routine Stability',
      goalDescription: 'Demonstrate safe household setup, bedtime routines, and secure medication storage.',
      goalDomain: 'child_safety',
      priorityLevel: 'essential',
      targetDate: '2026-11-01',
      status: 'in_progress',
      progressScore: 66,
      childVoiceSummary: 'Leo says he loves having his storybook read before bed.',
      parentViewSummary: 'Committed to structured evening routines and safe environment.',
      workerViewSummary: 'Good progress on sleeping setup; requires consistent routine logging.',
      sequenceOrder: 1,
      actions: [
        {
          id: 'act_01_01',
          casePlanGoalId: 'goal_01',
          actionReference: 'A-01-01',
          actionTitle: 'Lockable Medicine Cabinet Installation',
          actionDescription: 'Install secure medicine lockbox and deposit photo receipt in Evidence Vault.',
          actionType: 'evidence_milestone',
          assignedToType: 'parent',
          actionStatus: 'completed',
          dueAt: '2026-08-15',
          completionEvidenceRequired: true,
          completionEvidenceSummary: 'Photo proof verified in Vault (ev_01).',
          linkedEvidenceVaultIds: ['ev_01'],
          linkedRoute: '/evidence',
          sequenceOrder: 1,
        },
        {
          id: 'act_01_02',
          casePlanGoalId: 'goal_01',
          actionReference: 'A-01-02',
          actionTitle: 'Bedtime & Morning Routine Chart',
          actionDescription: 'Establish predictable 7:30 PM bedtime routine and track for 14 consecutive days.',
          actionType: 'behavioural_routine',
          assignedToType: 'parent',
          actionStatus: 'completed',
          dueAt: '2026-09-01',
          completionEvidenceRequired: true,
          completionEvidenceSummary: 'Routine chart completed and verified by contact supervisor.',
          linkedEvidenceVaultIds: ['ev_02'],
          linkedRoute: '/evidence',
          sequenceOrder: 2,
        },
        {
          id: 'act_01_03',
          casePlanGoalId: 'goal_01',
          actionReference: 'A-01-03',
          actionTitle: 'Environmental Safety Checklist Verification',
          actionDescription: 'Complete in-person home safety review with caseworker.',
          actionType: 'assessment',
          assignedToType: 'joint',
          actionStatus: 'pending',
          dueAt: '2026-11-05',
          completionEvidenceRequired: false,
          sequenceOrder: 3,
        },
      ],
    },
    {
      id: 'goal_02',
      casePlanId: 'plan_reunification_01',
      goalReference: 'G-REGUL-02',
      goalTitle: 'Parent Emotional Regulation & Conflict De-escalation',
      goalDescription: 'Complete psychoeducation program and practice box-breathing during stressful transitions.',
      goalDomain: 'emotional_regulation',
      priorityLevel: 'essential',
      targetDate: '2026-11-10',
      status: 'in_progress',
      progressScore: 50,
      childVoiceSummary: 'Leo wants calm handovers without arguing.',
      parentViewSummary: 'Practicing calming strategies daily with the voice coach.',
      workerViewSummary: 'Noticed improved composure during recent contact visit goodbyes.',
      sequenceOrder: 2,
      actions: [
        {
          id: 'act_02_01',
          casePlanGoalId: 'goal_02',
          actionReference: 'A-02-01',
          actionTitle: 'Family Conflict Psychoeducation Lesson Workbook',
          actionDescription: 'Complete 9-page workbook covering Taking Responsibility and Emotional Support.',
          actionType: 'curriculum_lesson',
          assignedToType: 'parent',
          actionStatus: 'completed',
          dueAt: '2026-09-15',
          completionEvidenceRequired: false,
          linkedRoute: '/lessons/family_conflict_psychoeducation_program',
          sequenceOrder: 1,
        },
        {
          id: 'act_02_02',
          casePlanGoalId: 'goal_02',
          actionReference: 'A-02-02',
          actionTitle: 'Daily Voice Reset & De-escalation Scenarios',
          actionDescription: 'Log 5 practice sessions on the interactive de-escalation simulator.',
          actionType: 'behavioural_routine',
          assignedToType: 'parent',
          actionStatus: 'in_progress',
          dueAt: '2026-11-08',
          completionEvidenceRequired: false,
          linkedRoute: '/scenarios',
          sequenceOrder: 2,
        },
      ],
    },
    {
      id: 'goal_03',
      casePlanId: 'plan_reunification_01',
      goalReference: 'G-VISIT-03',
      goalTitle: 'Consistent Positive Contact Visit Engagement',
      goalDescription: 'Attend 100% of scheduled visits on time and conduct child-led play activities.',
      goalDomain: 'parenting_skills',
      priorityLevel: 'high',
      targetDate: '2026-11-20',
      status: 'demonstrated',
      progressScore: 100,
      childVoiceSummary: 'Leo loves building lego and drawing during visits.',
      parentViewSummary: 'Arrive 15 minutes early for every contact session.',
      workerViewSummary: 'Attendance has been 100% over the past 6 weeks.',
      sequenceOrder: 3,
      actions: [
        {
          id: 'act_03_01',
          casePlanGoalId: 'goal_03',
          actionReference: 'A-03-01',
          actionTitle: 'Contact Visit Plan & Activity Bag Preparation',
          actionDescription: 'Plan age-appropriate co-play activities before each visit.',
          actionType: 'behavioural_routine',
          assignedToType: 'parent',
          actionStatus: 'completed',
          dueAt: '2026-10-01',
          completionEvidenceRequired: false,
          linkedRoute: '/contact-visit',
          sequenceOrder: 1,
        },
      ],
    },
  ],
};

export const DEFAULT_MOCK_TASKS: CaseTask[] = [
  {
    id: 'task_01',
    caseId: 'demo_case',
    actionId: 'act_01_03',
    title: 'Schedule In-Home Environmental Safety Review',
    description: 'Confirm date with caseworker Sarah for home walkthrough.',
    category: 'appointment',
    dueAt: '2026-11-05T10:00:00Z',
    isCompleted: false,
  },
  {
    id: 'task_02',
    caseId: 'demo_case',
    actionId: 'act_02_02',
    title: 'Complete Interactive De-escalation Scenario 3',
    description: 'Practice responding calmly to challenging handover delays.',
    category: 'program_lesson',
    dueAt: '2026-11-08T18:00:00Z',
    isCompleted: false,
    linkedRoute: '/scenarios',
  },
  {
    id: 'task_03',
    caseId: 'demo_case',
    actionId: 'act_01_01',
    title: 'Upload Medicine Lockbox Vault Receipt',
    description: 'Deposit live-captured photo into vault.',
    category: 'vault_proof',
    dueAt: '2026-08-15T12:00:00Z',
    isCompleted: true,
    completedAt: '2026-08-14T15:30:00Z',
    linkedRoute: '/evidence',
  },
];

// Initialize cache
localCasePlans.set('demo_case', JSON.parse(JSON.stringify(DEFAULT_MOCK_CASE_PLAN)));
localCaseTasks.set('demo_case', JSON.parse(JSON.stringify(DEFAULT_MOCK_TASKS)));

/**
 * Retrieves the active case plan for a given case.
 */
export async function getCasePlan(caseId: string): Promise<CasePlan | null> {
  const plan = localCasePlans.get(caseId) || localCasePlans.get('demo_case');
  if (!plan) return null;
  return JSON.parse(JSON.stringify(plan));
}

/**
 * Retrieves all operational tasks for a given case.
 */
export async function getCaseTasks(caseId: string): Promise<CaseTask[]> {
  const tasks = localCaseTasks.get(caseId) || localCaseTasks.get('demo_case') || [];
  return JSON.parse(JSON.stringify(tasks));
}

/**
 * Calculates overall case progress and per-domain breakdown.
 */
export function calculateCaseProgress(plan: CasePlan): CaseProgressSummary {
  let totalActions = 0;
  let completedActions = 0;
  let pausedByBarrierActions = 0;
  let demonstratedGoals = 0;

  const domainMap: Record<GoalDomain, { total: number; completed: number; percentage: number }> = {
    parenting_skills: { total: 0, completed: 0, percentage: 0 },
    child_safety: { total: 0, completed: 0, percentage: 0 },
    emotional_regulation: { total: 0, completed: 0, percentage: 0 },
    substance_recovery: { total: 0, completed: 0, percentage: 0 },
    stable_housing: { total: 0, completed: 0, percentage: 0 },
    family_relationships: { total: 0, completed: 0, percentage: 0 },
  };

  plan.goals.forEach((goal) => {
    if (goal.status === 'demonstrated' || goal.status === 'completed') {
      demonstratedGoals++;
    }

    const domain = goal.goalDomain;
    goal.actions.forEach((act) => {
      if (act.complianceTimerPaused) {
        pausedByBarrierActions++;
      }
      totalActions++;
      if (domainMap[domain]) {
        domainMap[domain].total++;
      }

      if (act.actionStatus === 'completed') {
        completedActions++;
        if (domainMap[domain]) {
          domainMap[domain].completed++;
        }
      }
    });
  });

  Object.keys(domainMap).forEach((key) => {
    const d = domainMap[key as GoalDomain];
    d.percentage = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
  });

  const effectiveTotal = Math.max(0, totalActions - pausedByBarrierActions);
  const overallPercentage =
    effectiveTotal > 0 ? Math.round((completedActions / effectiveTotal) * 100) : totalActions > 0 ? 100 : 0;

  return {
    overallPercentage: Math.min(100, overallPercentage),
    totalGoals: plan.goals.length,
    demonstratedGoals,
    totalActions,
    completedActions,
    pausedByBarrierActions,
    domainProgress: domainMap,
  };
}

export interface UpdateActionInput {
  caseId: string;
  goalId: string;
  actionId: string;
  newStatus: ActionStatus;
  evidenceVaultId?: string;
}

/**
 * Updates an action status, optionally linking evidence, and recalculates goal progress.
 */
export async function updateCasePlanActionStatus(
  input: UpdateActionInput
): Promise<{ success: boolean; plan?: CasePlan; error?: string }> {
  const plan = localCasePlans.get(input.caseId) || localCasePlans.get('demo_case');
  if (!plan) {
    return { success: false, error: 'Case plan not found' };
  }

  const goal = plan.goals.find((g) => g.id === input.goalId);
  if (!goal) {
    return { success: false, error: 'Goal not found' };
  }

  const action = goal.actions.find((a) => a.id === input.actionId);
  if (!action) {
    return { success: false, error: 'Action not found' };
  }

  action.actionStatus = input.newStatus;
  if (input.evidenceVaultId) {
    action.linkedEvidenceVaultIds = action.linkedEvidenceVaultIds || [];
    if (!action.linkedEvidenceVaultIds.includes(input.evidenceVaultId)) {
      action.linkedEvidenceVaultIds.push(input.evidenceVaultId);
    }
  }

  // Recalculate goal progress score
  const totalInGoal = goal.actions.length;
  const completedInGoal = goal.actions.filter((a) => a.actionStatus === 'completed').length;
  goal.progressScore = totalInGoal > 0 ? Math.round((completedInGoal / totalInGoal) * 100) : 0;

  if (goal.progressScore === 100) {
    goal.status = 'demonstrated';
  } else if (goal.progressScore > 0) {
    goal.status = 'in_progress';
  } else {
    goal.status = 'not_started';
  }

  plan.updatedAt = new Date().toISOString();
  localCasePlans.set(plan.caseId, plan);

  return { success: true, plan: JSON.parse(JSON.stringify(plan)) };
}

/**
 * Toggles completion status of a case task.
 */
export async function toggleCaseTaskCompletion(
  caseId: string,
  taskId: string
): Promise<{ success: boolean; task?: CaseTask; error?: string }> {
  const tasks = localCaseTasks.get(caseId) || localCaseTasks.get('demo_case');
  if (!tasks) {
    return { success: false, error: 'No tasks found for case' };
  }

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return { success: false, error: 'Task not found' };
  }

  task.isCompleted = !task.isCompleted;
  task.completedAt = task.isCompleted ? new Date().toISOString() : undefined;

  return { success: true, task: { ...task } };
}

export interface RecordParentGoalDisagreementInput {
  caseId: string;
  goalId: string;
  parentPerspective: string;
}

/**
 * Records parent procedural perspective / disagreement on a case plan goal.
 * Strictly non-destructive: preserved for court review.
 */
export async function recordParentGoalPerspective(
  input: RecordParentGoalDisagreementInput
): Promise<{ success: boolean; goal?: CasePlanGoal; error?: string }> {
  const plan = localCasePlans.get(input.caseId) || localCasePlans.get('demo_case');
  if (!plan) {
    return { success: false, error: 'Case plan not found' };
  }

  const goal = plan.goals.find((g) => g.id === input.goalId);
  if (!goal) {
    return { success: false, error: 'Goal not found' };
  }

  if (!input.parentPerspective.trim()) {
    return { success: false, error: 'Perspective statement cannot be empty' };
  }

  goal.parentDisagreement = input.parentPerspective.trim();
  plan.familyDisagreementRecorded = true;
  plan.updatedAt = new Date().toISOString();

  localCasePlans.set(plan.caseId, plan);
  return { success: true, goal: JSON.parse(JSON.stringify(goal)) };
}

export interface PauseActionComplianceTimerInput {
  caseId: string;
  goalId: string;
  actionId: string;
  barrierReason: string;
}

/**
 * Pauses the compliance clock on a case-plan action when an agency waitlist,
 * transport gap, or childcare shortage blocks completion, ensuring the parent
 * is not penalized for structural/agency capacity delays.
 */
export async function pauseActionComplianceTimer(
  input: PauseActionComplianceTimerInput
): Promise<{ success: boolean; plan?: CasePlan; action?: CasePlanAction; error?: string }> {
  const plan = localCasePlans.get(input.caseId) || localCasePlans.get('demo_case');
  if (!plan) {
    return { success: false, error: 'Case plan not found' };
  }
  const goal = plan.goals.find((g) => g.id === input.goalId);
  if (!goal) {
    return { success: false, error: 'Goal not found' };
  }
  const action = goal.actions.find((a) => a.id === input.actionId);
  if (!action) {
    return { success: false, error: 'Action not found' };
  }
  if (!input.barrierReason?.trim()) {
    return { success: false, error: 'Barrier reason cannot be empty' };
  }

  action.actionStatus = 'blocked';
  action.complianceTimerPaused = true;
  action.systemicBarrierNote = input.barrierReason.trim();
  plan.updatedAt = new Date().toISOString();

  localCasePlans.set(plan.caseId, plan);
  return {
    success: true,
    plan: JSON.parse(JSON.stringify(plan)),
    action: JSON.parse(JSON.stringify(action)),
  };
}
