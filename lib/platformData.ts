import { supabase } from "./supabaseClient";
import { appLessons } from "./lessonContent";

export type SafeStepsProgram = {
  id: string;
  title: string;
  description: string;
  weeks: number;
  programModel?: "monthly-pathway";
  durationLabel?: string;
  pathwayType?: "set-program" | "custom-built";
  audience?: string[];
  focusAreas?: string[];
  evidenceCadence?: {
    dailyCheckIns: boolean | "configured";
    weeklyUploads: boolean;
    monthlyQuestionnaires: boolean | "configured";
    reassessmentEveryWeeks: number | "configured";
  };
};

export type ProgramWeekPlan = {
  id: string;
  monthNumber: number;
  monthTopic: string;
  monthReflectionPrompt: string;
  weekNumber: number;
  weekInMonth: number;
  title: string;
  focus: string;
  weeklyReflectionPrompt: string;
  evidencePrompt: string;
  lessonIds: string[];
  dailyLessons: {
    dayNumber: number;
    title: string;
    durationMinutes: number;
    meaningPrompt: string;
    checkpoint: string;
    practiceTask: string;
  }[];
};

export type LearningCourse = {
  id: string;
  title: string;
  category: string;
  length: "4 hours" | "1 week" | "2 weeks" | "4 weeks";
  access: {
    publicLearningMode: boolean;
    evidenceModeForEnrolledParents: boolean;
  };
  outcomes: string[];
  lessons: {
    id: string;
    title: string;
    reassessmentWeekOffset: number;
    scoringDomains: string[];
  }[];
};

export type SafeStepsResource = {
  id: string;
  title: string;
  category: "Guide" | "Checklist" | "Template" | "Worksheet" | "Emergency";
  description: string;
  useWhen: string;
};

export type SafeStepsTask = {
  id: string;
  title: string;
  description: string;
  status: "ready" | "in_progress" | "completed";
  completed_at: string | null;
  due_at: string | null;
  priority: "low" | "medium" | "high";
  related_lesson_id: string | null;
  evidence_required: boolean;
  category: string;
};

export type TaskBulkTemplate = Omit<SafeStepsTask, "id" | "status" | "completed_at" | "due_at"> & {
  dueInDays: number | null;
};

export type EvidenceItem = {
  id: string;
  title: string;
  notes: string;
  file_path: string | null;
  status: "draft" | "stored" | "shared";
  created_at: string;
};

export type DailyHomeEvidenceCategory = "inside_home" | "outside_home";

export type DailyHomeEvidenceStatus = {
  dateKey: string;
  insideComplete: boolean;
  outsideComplete: boolean;
  complete: boolean;
  items: EvidenceItem[];
};

export type DailyHomeEvidenceHistory = {
  days: DailyHomeEvidenceStatus[];
  completeDays: number;
  missingDays: number;
};

export type EvidenceBulkTemplate = {
  title: string;
  notes: string;
};

export type ProgramWeekBulkPlan = {
  tasks: TaskBulkTemplate[];
  evidence: EvidenceBulkTemplate[];
};

export type SafeStepsBulkSetupBundle = {
  id: string;
  title: string;
  description: string;
  taskTemplates: TaskBulkTemplate[];
  evidenceTemplates: EvidenceBulkTemplate[];
};

export type ProgramMeaningReflectionInput = {
  programId: string;
  programTitle: string;
  week: ProgramWeekPlan;
  monthResponse: string;
  weeklyResponse: string;
  dailyResponses: Record<number, string>;
};

export type WeeklyGrowthNotesInput = {
  programId: string;
  programTitle: string;
  week: ProgramWeekPlan;
  familyWin: string;
  toolboxSkill: string;
  futureLetter: string;
};

export type DailyProgramLessonCompletionInput = {
  programId: string;
  programTitle: string;
  week: ProgramWeekPlan;
  dayNumber: number;
  meaningResponse: string;
  checkpointResponse: string;
  scenarioResponse: string;
  practiceResponse: string;
  endReflection: string;
};

export type ProgramReflection = {
  id: string;
  program_id: string;
  program_title: string;
  reflection_type:
    | "monthly_meaning"
    | "weekly_meaning"
    | "daily_meaning"
    | "weekly_family_win"
    | "toolbox_skill"
    | "child_future_letter"
    | "end_reflection";
  month_number: number | null;
  month_topic: string | null;
  week_number: number | null;
  week_in_month: number | null;
  day_number: number | null;
  lesson_title: string | null;
  prompt: string;
  response: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type ProgramEnrollment = {
  id: string;
  program_id: string;
  status: "active" | "paused" | "completed";
  started_at: string;
  completed_at: string | null;
};

export type ProgressEvent = {
  id: string;
  event_type: string;
  label: string;
  metadata?: {
    lessonId?: string;
    [key: string]: unknown;
  };
  created_at: string;
};

export type DailyCheckInInput = {
  mood: "steady" | "stressed" | "overwhelmed";
  safety: "safe" | "watching" | "unsafe";
  note: string;
};

export type AssessmentQuestion = {
  id: string;
  assessment_id: string;
  question_number: number;
  question_text: string;
  question_type: string;
};

export type AssessmentDefinition = {
  id: string;
  name: string;
  description: string;
  questions: AssessmentQuestion[];
};

export type AssessmentResponse = {
  id: string;
  assessment_id: string;
  responses: Record<string, unknown>;
  created_at: string;
};

export const SAFESTEPS_INTAKE_ASSESSMENT_ID = "22222222-2222-4222-8222-222222222222";
export const SAFESTEPS_PROGRESS_CHECK_ASSESSMENT_ID = "11111111-1111-4111-8111-111111111111";

export const intakeAssessmentQuestions: AssessmentQuestion[] = [
  {
    id: "intake-consent",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 1,
    question_text: "I understand SafeSteps will use my intake answers, reflections, evidence, sessions, and progress records to support program planning and review.",
    question_type: "yes_no",
  },
  {
    id: "intake-personal-details",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 2,
    question_text: "Parent/carer personal details, contact details, and preferred name have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-child-family-details",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 3,
    question_text: "Child, family, placement, and reunification details have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-child-protection-history",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 4,
    question_text: "Child protection history, current concerns, orders, and safety requirements have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-psychosocial-history",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 5,
    question_text: "Housing, education, employment, finances, transport, culture, and daily stability needs have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-mental-health",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 6,
    question_text: "Mental health, wellbeing, stress, diagnosis, treatment, and support needs have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-substance-use",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 7,
    question_text: "Alcohol and other drug history, current use, treatment, relapse risks, and safety planning needs have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-dfv-safety",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 8,
    question_text: "Domestic and family violence, coercive control, victim-survivor needs, perpetration concerns, and safety planning needs have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-parenting-capacity",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 9,
    question_text: "Parenting capacity, routines, attachment, insight, accountability, child safety, and protective capacity baseline have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-support-network",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 10,
    question_text: "Support network, professional contacts, referrals, and practical support needs have been recorded.",
    question_type: "completion_check",
  },
  {
    id: "intake-risk-gaming",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 11,
    question_text: "Risk, minimisation, avoidance, disguised compliance, and program participation concerns have been considered.",
    question_type: "completion_check",
  },
  {
    id: "intake-consent-plan",
    assessment_id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
    question_number: 12,
    question_text: "Consent, immediate safety actions, first referrals, and the starting SafeSteps plan have been recorded.",
    question_type: "completion_check",
  },
];

export type ReportSummary = {
  tasks: SafeStepsTask[];
  evidence: EvidenceItem[];
  reflections: ProgramReflection[];
  dailyHomeEvidence: EvidenceItem[];
  dailyHomeEvidenceHistory: DailyHomeEvidenceHistory;
  enrollments: ProgramEnrollment[];
  events: ProgressEvent[];
  profile: SafeStepsProfile | null;
};

export type SafeStepsProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "parent" | "worker" | "admin";
  story_goal: string;
  strengths: string;
  support_notes: string;
};

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000000";
const REPORT_SUMMARY_TASK_LIMIT = 500;
const REPORT_SUMMARY_EVIDENCE_LIMIT = 500;
const REPORT_SUMMARY_REFLECTION_LIMIT = 250;
const REPORT_SUMMARY_ENROLLMENT_LIMIT = 100;

const demoState: {
  tasks: SafeStepsTask[];
  evidence: EvidenceItem[];
  reflections: ProgramReflection[];
  enrollments: ProgramEnrollment[];
  events: ProgressEvent[];
  profile: SafeStepsProfile;
} = {
  tasks: [],
  evidence: [],
  reflections: [],
  enrollments: [],
  events: [],
  profile: {
    id: DEMO_USER_ID,
    email: "demo@safesteps.local",
    display_name: "Demo parent",
    role: "parent",
    story_goal: "Build a clear, evidence-backed SafeSteps plan.",
    strengths: "Willingness to practise routines and reflect on progress.",
    support_notes: "Demo mode uses local in-memory data for testing.",
  },
};

function isDemoUser(userId: string) {
  return userId === DEMO_USER_ID;
}

function demoId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addDemoEvent(event_type: string, label: string, metadata: ProgressEvent["metadata"] = {}) {
  demoState.events.unshift({
    id: demoId("event"),
    event_type,
    label,
    metadata,
    created_at: new Date().toISOString(),
  });
}

function getDateKey(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

const dailyHomeEvidenceLabels: Record<DailyHomeEvidenceCategory, string> = {
  inside_home: "Inside house",
  outside_home: "Outside house",
};

function dailyHomeEvidenceTitle(category: DailyHomeEvidenceCategory, dateKey: string, mediaType: "photo" | "video") {
  return `Daily home evidence - ${dailyHomeEvidenceLabels[category]} - ${dateKey} - ${mediaType}`;
}

function dailyHomeEvidenceNotes(category: DailyHomeEvidenceCategory, dateKey: string, mediaType: "photo" | "video", notes: string) {
  return [
    `Daily hard evidence`,
    `date=${dateKey}`,
    `category=${category}`,
    `media=${mediaType}`,
    notes.trim() ? `notes=${notes.trim()}` : "notes=",
  ].join("\n");
}

function isDailyHomeEvidence(item: EvidenceItem) {
  return item.title.startsWith("Daily home evidence - ") || item.notes.includes("Daily hard evidence");
}

function hasDailyHomeCategory(item: EvidenceItem, category: DailyHomeEvidenceCategory, dateKey: string) {
  return item.notes.includes(`date=${dateKey}`) && item.notes.includes(`category=${category}`);
}

export const fallbackPrograms: SafeStepsProgram[] = [
  {
    id: "intensive-reunification",
    title: "Intensive Reunification Program",
    description: "A 24-month pathway for parents working toward long-term reunification after serious child safety concerns.",
    weeks: 96,
    durationLabel: "24 months",
    pathwayType: "set-program",
    audience: ["Parents working toward long-term reunification", "Families with serious child safety concerns"],
    focusAreas: ["Parenting capacity", "Safety awareness", "Accountability", "Emotional regulation", "Stable routines", "Protective factors", "Court-ready evidence"],
    evidenceCadence: { dailyCheckIns: true, weeklyUploads: true, monthlyQuestionnaires: true, reassessmentEveryWeeks: 4 },
  },
  {
    id: "home-again",
    title: "Home Again Program",
    description: "A 6-12 month transition pathway for rebuilding safe routines, home stability, and child adjustment.",
    weeks: 52,
    durationLabel: "6-12 months",
    pathwayType: "set-program",
    audience: ["Families transitioning children safely back home", "Parents rebuilding home stability"],
    focusAreas: ["Reunification readiness", "Home routines", "Safety planning", "Child adjustment", "Repair", "Consistency"],
    evidenceCadence: { dailyCheckIns: true, weeklyUploads: true, monthlyQuestionnaires: true, reassessmentEveryWeeks: 3 },
  },
  {
    id: "building-stronger-families",
    title: "Building Stronger Families",
    description: "An 18-month pathway for families at very high risk of removal who need structured, measurable intervention.",
    weeks: 78,
    durationLabel: "18 months",
    pathwayType: "set-program",
    audience: ["Families at very high risk of removal"],
    focusAreas: ["Risk reduction", "Protective parenting", "Family stability", "Insight", "AOD and MH needs", "DFV-informed safety"],
    evidenceCadence: { dailyCheckIns: true, weeklyUploads: true, monthlyQuestionnaires: true, reassessmentEveryWeeks: 4 },
  },
  {
    id: "keeping-families-together",
    title: "Keeping Families Together",
    description: "A 12-month early intervention pathway for families at risk of removal.",
    weeks: 52,
    durationLabel: "12 months",
    pathwayType: "set-program",
    audience: ["Families at risk of removal", "Parents needing structured intervention before escalation"],
    focusAreas: ["Early intervention", "Parenting capacity", "Routines", "Communication", "Stress management", "Protective factors"],
    evidenceCadence: { dailyCheckIns: true, weeklyUploads: true, monthlyQuestionnaires: true, reassessmentEveryWeeks: 4 },
  },
  {
    id: "back-on-track",
    title: "Back on Track Program",
    description: "A 6-month focused reset for lower to moderate risk families who need practical behaviour change support.",
    weeks: 26,
    durationLabel: "6 months",
    pathwayType: "set-program",
    audience: ["Lower to moderate risk families", "Parents needing a focused reset"],
    focusAreas: ["Practical parenting", "Routine repair", "Conflict reduction", "Self-awareness", "Short-term behaviour goals"],
    evidenceCadence: { dailyCheckIns: true, weeklyUploads: true, monthlyQuestionnaires: true, reassessmentEveryWeeks: 2 },
  },
  {
    id: "custom-family-program",
    title: "Custom Family Program",
    description: "A tailored pathway built around each parent, family, young person, carer, or client and their needs.",
    weeks: 0,
    durationLabel: "Assessment-based",
    pathwayType: "custom-built",
    audience: ["Parents", "Families", "Carers", "Young people", "Clients with unique needs"],
    focusAreas: ["Assessment-based goals", "Family-specific risks", "Strengths", "Court requirements", "Agency concerns", "Personal growth"],
    evidenceCadence: { dailyCheckIns: "configured", weeklyUploads: true, monthlyQuestionnaires: "configured", reassessmentEveryWeeks: "configured" },
  },
];

export const learningCourses: LearningCourse[] = [
  {
    id: "accountability-and-self-awareness-for-parents",
    title: "Accountability and Self-Awareness for Parents",
    category: "Accountability and self-awareness",
    length: "1 week",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Recognise patterns", "Take responsibility without blame", "Build evidence of insight"],
    lessons: [
      { id: "accountability-1", title: "Understanding accountability", reassessmentWeekOffset: 2, scoringDomains: ["Insight and accountability", "Safety awareness"] },
      { id: "accountability-2", title: "Practising ownership", reassessmentWeekOffset: 3, scoringDomains: ["Skill adoption", "Consistency"] },
      { id: "accountability-3", title: "Applying self-awareness under pressure", reassessmentWeekOffset: 4, scoringDomains: ["Insight and accountability", "Reliability"] },
    ],
  },
  {
    id: "emotional-regulation-for-parents",
    title: "Emotional Regulation for Parents",
    category: "Emotional regulation",
    length: "2 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Notice stress signals", "Use calm-down strategies", "Reduce reactive parenting moments"],
    lessons: [
      { id: "regulation-1", title: "Recognising escalation", reassessmentWeekOffset: 2, scoringDomains: ["Emotional stability", "Safety awareness"] },
      { id: "regulation-2", title: "Calming before responding", reassessmentWeekOffset: 3, scoringDomains: ["Skill adoption", "Consistency"] },
      { id: "regulation-3", title: "Repair after conflict", reassessmentWeekOffset: 4, scoringDomains: ["Insight and accountability", "Protective factors"] },
    ],
  },
  {
    id: "safety-planning-with-children",
    title: "Safety Planning with Children",
    category: "Safety planning",
    length: "1 week",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Build safer routines", "Create child-aware plans", "Upload verifiable safety evidence"],
    lessons: [
      { id: "safety-1", title: "What safety means at home", reassessmentWeekOffset: 2, scoringDomains: ["Safety awareness", "Risk reduction"] },
      { id: "safety-2", title: "Making a practical plan", reassessmentWeekOffset: 3, scoringDomains: ["Skill adoption", "Protective factors"] },
      { id: "safety-3", title: "Testing the plan in real life", reassessmentWeekOffset: 4, scoringDomains: ["Consistency", "Reliability"] },
    ],
  },
  {
    id: "dfv-accountability-and-child-safety",
    title: "DFV Accountability and Child Safety",
    category: "Domestic and family violence",
    length: "4 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Understand child impact", "Reduce minimising and blaming", "Practise safer choices"],
    lessons: [
      { id: "dfv-1", title: "Understanding impact", reassessmentWeekOffset: 2, scoringDomains: ["Insight and accountability", "Safety awareness"] },
      { id: "dfv-2", title: "Recognising harmful patterns", reassessmentWeekOffset: 3, scoringDomains: ["Risk reduction", "Self-awareness"] },
      { id: "dfv-3", title: "Building safer responses", reassessmentWeekOffset: 4, scoringDomains: ["Skill adoption", "Consistency"] },
    ],
  },
  {
    id: "aod-recovery-and-parenting-stability",
    title: "AOD Recovery and Parenting Stability",
    category: "Alcohol and other drugs",
    length: "4 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Track sobriety patterns", "Plan relapse prevention", "Protect routines"],
    lessons: [
      { id: "aod-1", title: "Substance use and parenting capacity", reassessmentWeekOffset: 2, scoringDomains: ["Risk reduction", "Reliability"] },
      { id: "aod-2", title: "Triggers and support plans", reassessmentWeekOffset: 3, scoringDomains: ["Self-awareness", "Protective factors"] },
      { id: "aod-3", title: "Evidence of stability", reassessmentWeekOffset: 4, scoringDomains: ["Consistency", "Reliability"] },
    ],
  },
  {
    id: "mental-health-stress-and-parenting",
    title: "Mental Health, Stress, and Parenting",
    category: "Mental health",
    length: "2 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Name stress patterns", "Use supports earlier", "Track emotional stability"],
    lessons: [
      { id: "mh-1", title: "Stress and parenting responses", reassessmentWeekOffset: 2, scoringDomains: ["Emotional stability", "Self-awareness"] },
      { id: "mh-2", title: "Support planning", reassessmentWeekOffset: 3, scoringDomains: ["Protective factors", "Reliability"] },
      { id: "mh-3", title: "Keeping routines through hard weeks", reassessmentWeekOffset: 4, scoringDomains: ["Consistency", "Skill adoption"] },
    ],
  },
  {
    id: "child-development-foundations",
    title: "Child Development Foundations",
    category: "Parenting",
    length: "4 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Understand developmental stages", "Recognise milestone concerns", "Support age-appropriate growth"],
    lessons: [
      { id: "cd-001", title: "What is child development?", reassessmentWeekOffset: 2, scoringDomains: ["Child development knowledge", "Parenting confidence"] },
      { id: "cd-002", title: "Understanding child milestones", reassessmentWeekOffset: 3, scoringDomains: ["Observation", "Support planning"] },
      { id: "cd-003", title: "Supporting healthy development", reassessmentWeekOffset: 4, scoringDomains: ["Practical application", "Consistency"] },
    ],
  },
  {
    id: "positive-parenting-foundations",
    title: "Positive Parenting Foundations",
    category: "Parenting",
    length: "4 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Use positive guidance", "Set clear expectations", "Build confidence and cooperation"],
    lessons: [
      { id: "pp-001", title: "What is positive parenting?", reassessmentWeekOffset: 2, scoringDomains: ["Parenting confidence", "Insight and accountability"] },
      { id: "pp-002", title: "Positive reinforcement", reassessmentWeekOffset: 3, scoringDomains: ["Skill adoption", "Consistency"] },
      { id: "pp-003", title: "Creating a positive family culture", reassessmentWeekOffset: 4, scoringDomains: ["Protective factors", "Family stability"] },
    ],
  },
  {
    id: "attachment-and-bonding-foundations",
    title: "Attachment and Bonding Foundations",
    category: "Parenting",
    length: "2 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Understand secure attachment", "Build trust and emotional safety", "Repair connection after rupture"],
    lessons: [
      { id: "ab-001", title: "What is attachment?", reassessmentWeekOffset: 2, scoringDomains: ["Attachment knowledge", "Parent-child connection"] },
      { id: "ab-002", title: "Building trust through daily care", reassessmentWeekOffset: 3, scoringDomains: ["Consistency", "Emotional safety"] },
      { id: "ab-003", title: "Repairing attachment ruptures", reassessmentWeekOffset: 4, scoringDomains: ["Repair", "Insight and accountability"] },
    ],
  },
  {
    id: "behaviour-management-foundations",
    title: "Behaviour Management Foundations",
    category: "Parenting",
    length: "4 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Understand behaviour as communication", "Use predictable boundaries", "Reduce power struggles"],
    lessons: [
      { id: "bm-001", title: "Behaviour as communication", reassessmentWeekOffset: 2, scoringDomains: ["Behaviour insight", "Child development knowledge"] },
      { id: "bm-002", title: "Boundaries and routines", reassessmentWeekOffset: 3, scoringDomains: ["Consistency", "Practical application"] },
      { id: "bm-003", title: "Responding without escalation", reassessmentWeekOffset: 4, scoringDomains: ["Emotional regulation", "Safety awareness"] },
    ],
  },
  {
    id: "child-safety-foundations",
    title: "Child Safety Foundations",
    category: "Safety planning",
    length: "2 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Recognise safety needs", "Build safer home routines", "Create practical safety evidence"],
    lessons: [
      { id: "cs-001", title: "Everyday child safety", reassessmentWeekOffset: 2, scoringDomains: ["Safety awareness", "Risk reduction"] },
      { id: "cs-002", title: "Home safety routines", reassessmentWeekOffset: 3, scoringDomains: ["Consistency", "Protective factors"] },
      { id: "cs-003", title: "Showing safety over time", reassessmentWeekOffset: 4, scoringDomains: ["Evidence of practice", "Reliability"] },
    ],
  },
  {
    id: "family-routines-and-structure",
    title: "Family Routines and Structure",
    category: "Parenting",
    length: "2 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Build predictable routines", "Reduce daily stress", "Support children's sense of safety"],
    lessons: [
      { id: "fr-001", title: "Why routines matter", reassessmentWeekOffset: 2, scoringDomains: ["Routine stability", "Child wellbeing"] },
      { id: "fr-002", title: "Morning, meal, and bedtime routines", reassessmentWeekOffset: 3, scoringDomains: ["Consistency", "Practical application"] },
      { id: "fr-003", title: "Keeping routines during hard weeks", reassessmentWeekOffset: 4, scoringDomains: ["Reliability", "Protective factors"] },
    ],
  },
  {
    id: "reunification-parenting-foundations",
    title: "Reunification Parenting Foundations",
    category: "Parenting",
    length: "4 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Understand reunification expectations", "Practise repair and consistency", "Prepare evidence of safe change"],
    lessons: [
      { id: "rp-001", title: "What reunification asks of parents", reassessmentWeekOffset: 2, scoringDomains: ["Insight and accountability", "Safety awareness"] },
      { id: "rp-002", title: "Repairing relationships after separation", reassessmentWeekOffset: 3, scoringDomains: ["Repair", "Parent-child connection"] },
      { id: "rp-003", title: "Evidence of reunification readiness", reassessmentWeekOffset: 4, scoringDomains: ["Evidence of practice", "Reliability"] },
    ],
  },
  {
    id: "trauma-informed-parenting-foundations",
    title: "Trauma-Informed Parenting Foundations",
    category: "Parenting",
    length: "4 weeks",
    access: { publicLearningMode: true, evidenceModeForEnrolledParents: true },
    outcomes: ["Understand trauma responses", "Respond with emotional safety", "Support recovery through consistency"],
    lessons: [
      { id: "tip-001", title: "Trauma and child behaviour", reassessmentWeekOffset: 2, scoringDomains: ["Trauma awareness", "Child development knowledge"] },
      { id: "tip-002", title: "Creating emotional safety", reassessmentWeekOffset: 3, scoringDomains: ["Emotional safety", "Protective factors"] },
      { id: "tip-003", title: "Repair, rhythm, and recovery", reassessmentWeekOffset: 4, scoringDomains: ["Consistency", "Parent-child connection"] },
    ],
  },
];

export const safeStepsResources: SafeStepsResource[] = [
  {
    id: "family-mission-template",
    title: "Family Mission Statement",
    category: "Template",
    description: "A reusable prompt for writing and updating the family's shared purpose.",
    useWhen: "Use during month one and revisit after major reviews.",
  },
  {
    id: "weekly-family-wins",
    title: "Weekly Family Wins",
    category: "Worksheet",
    description: "A simple record of what went well, what felt easier, and what the parent wants to repeat.",
    useWhen: "Use at the end of each program week.",
  },
  {
    id: "my-toolbox",
    title: "My Toolbox",
    category: "Checklist",
    description: "A running list of skills the parent has practised, such as active listening, emotional coaching, routines, and repair.",
    useWhen: "Use after each lesson to build a personalised skill bank.",
  },
  {
    id: "evidence-upload-guide",
    title: "Evidence Upload Guide",
    category: "Guide",
    description: "Plain language guidance for photos, documents, journals, worksheets, logs, and optional media.",
    useWhen: "Use before uploading evidence so the parent understands why it is being requested.",
  },
  {
    id: "child-future-letter",
    title: "Child's Future Letter",
    category: "Worksheet",
    description: "A monthly reflection asking what the parent wants their child to know about the effort they are making today.",
    useWhen: "Use during monthly reviews and program completion.",
  },
  {
    id: "urgent-support-directory",
    title: "Urgent Support Directory",
    category: "Emergency",
    description: "A place for emergency contacts, services, and immediate safety information.",
    useWhen: "Use any time safety or urgent support is needed.",
  },
  {
    id: "daily-meaning-prompt-sheet",
    title: "Daily Meaning Prompt Sheet",
    category: "Worksheet",
    description: "A simple page for answering what each daily 30-minute lesson means before learning starts.",
    useWhen: "Use when the parent wants to write responses offline before entering them into SafeSteps.",
  },
  {
    id: "real-world-practice-log",
    title: "Real-World Practice Log",
    category: "Template",
    description: "A structured record of one skill practised, what happened, what was difficult, and what changed.",
    useWhen: "Use after any lesson that asks the parent to practise a skill at home.",
  },
  {
    id: "facilitator-review-checklist",
    title: "Facilitator Review Checklist",
    category: "Checklist",
    description: "A review aid for checking reflections, objective evidence, open tasks, risk flags, strengths, and next steps.",
    useWhen: "Use before a support session, case review, or report update.",
  },
  {
    id: "growth-timeline-guide",
    title: "Growth Timeline Guide",
    category: "Guide",
    description: "Explains how reflections, lessons, practice tasks, evidence, check-ins, and reports form an evidence-of-change timeline.",
    useWhen: "Use when explaining SafeSteps progress to parents, workers, or reviewers.",
  },
  {
    id: "home-routine-checklist",
    title: "Home Routine Checklist",
    category: "Checklist",
    description: "A practical checklist for morning, meal, bedtime, school, health, and home safety routines.",
    useWhen: "Use in Family Routines and Structure, reunification preparation, or home stability planning.",
  },
  {
    id: "next-session-plan",
    title: "Next Session Plan",
    category: "Template",
    description: "A short structure for naming one strength, one barrier, one evidence gap, and one next small step.",
    useWhen: "Use from the Facilitator Workspace after reviewing the parent's current progress.",
  },
];

export const safeStepsGrowthDimensions = [
  "Knowledge",
  "Reflection history",
  "Practical application",
  "Consistency",
  "Objective evidence",
  "Family strengths",
  "Home evidence rhythm",
] as const;

export const safeStepsProgramEngines = [
  "Program engine",
  "Reflection engine",
  "Learning engine",
  "Practice engine",
  "Evidence engine",
  "Growth timeline engine",
  "Reporting engine",
  "Facilitator workspace",
] as const;

export const starterTasks = [
  {
    title: "Choose a program pathway",
    description: "Pick the SafeSteps pathway you are working through first.",
    priority: "high",
    category: "setup",
    related_lesson_id: "understanding-weekly-goals",
    evidence_required: false,
  },
  {
    title: "Complete the first lesson reflection",
    description: "Capture one thing you learned and one thing you will try.",
    priority: "high",
    category: "lesson",
    related_lesson_id: "safety-planning-basics",
    evidence_required: false,
  },
  {
    title: "Upload one supporting evidence item",
    description: "Add a certificate, note, appointment record, photo, or document.",
    priority: "medium",
    category: "evidence",
    related_lesson_id: "building-evidence-for-progress",
    evidence_required: true,
  },
  {
    title: "Review your progress summary",
    description: "Check that your work is being recorded clearly.",
    priority: "medium",
    category: "review",
    related_lesson_id: null,
    evidence_required: false,
  },
] as const;

export const taskBulkTemplates: TaskBulkTemplate[] = [
  {
    title: "Complete daily check-ins for the next 7 days",
    description: "Record mood, safety, and support notes each day so progress is visible over time.",
    priority: "high",
    category: "check-in",
    related_lesson_id: null,
    evidence_required: false,
    dueInDays: 7,
  },
  {
    title: "Upload weekly routine evidence",
    description: "Add a photo, document, or note showing one safer routine used this week.",
    priority: "high",
    category: "evidence",
    related_lesson_id: "building-evidence-for-progress",
    evidence_required: true,
    dueInDays: 7,
  },
  {
    title: "Write a parenting reflection",
    description: "Capture what happened, what you noticed, and what you will do differently next time.",
    priority: "medium",
    category: "reflection",
    related_lesson_id: "accountability-1",
    evidence_required: false,
    dueInDays: 3,
  },
  {
    title: "Update My Story goals",
    description: "Review your current goal, strengths, and support notes so your report stays accurate.",
    priority: "medium",
    category: "profile",
    related_lesson_id: null,
    evidence_required: false,
    dueInDays: 14,
  },
  {
    title: "Prepare one support contact record",
    description: "Save a note from a service, appointment, worker, school, or support person.",
    priority: "medium",
    category: "support",
    related_lesson_id: null,
    evidence_required: true,
    dueInDays: 10,
  },
  {
    title: "Review the progress report",
    description: "Open the report screen and check whether the current evidence tells the full story.",
    priority: "low",
    category: "review",
    related_lesson_id: null,
    evidence_required: false,
    dueInDays: 14,
  },
] as const;

export const evidenceBulkTemplates: EvidenceBulkTemplate[] = [
  {
    title: "Weekly routine note",
    notes: "Briefly describe the routine used, when it happened, and what made it safer or more consistent.",
  },
  {
    title: "Service appointment record",
    notes: "Record the service, appointment date, who attended, and any next steps.",
  },
  {
    title: "Parenting reflection",
    notes: "Describe the situation, what you noticed, how you responded, and what you are practising next.",
  },
  {
    title: "Child safety or home safety update",
    notes: "Summarise the safety step, the reason it matters, and how it will be maintained.",
  },
  {
    title: "School, daycare, or health contact",
    notes: "Record contact with a child-focused service and any relevant progress, concerns, or actions.",
  },
] as const;

export const safeStepsBulkSetupBundles: SafeStepsBulkSetupBundle[] = [
  {
    id: "reflection-engine",
    title: "Reflection Engine Setup",
    description: "Creates prompts and evidence drafts for monthly, weekly, daily, and end-of-week reflections.",
    taskTemplates: [
      {
        title: "Complete current monthly meaning reflection",
        description: "Answer what this month's topic means to you before starting the learning activities.",
        priority: "high",
        category: "reflection",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 1,
      },
      {
        title: "Complete current weekly meaning reflection",
        description: "Answer what this week's sub topic means to you before starting daily lessons.",
        priority: "high",
        category: "reflection",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 2,
      },
      {
        title: "Complete five daily lesson meaning responses",
        description: "Record the before-learning answer for each 30-minute daily lesson this week.",
        priority: "medium",
        category: "reflection",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 7,
      },
    ],
    evidenceTemplates: [
      {
        title: "Monthly meaning reflection draft",
        notes: "What does this monthly topic mean to you? There are no right or wrong answers.",
      },
      {
        title: "Weekly meaning reflection draft",
        notes: "What does this weekly sub topic mean to you? Capture your current understanding before learning starts.",
      },
    ],
  },
  {
    id: "practice-engine",
    title: "Practice Engine Setup",
    description: "Creates practical tasks that turn lessons into real-world parenting actions.",
    taskTemplates: [
      {
        title: "Complete one real-world practice activity",
        description: "Use one lesson skill with your child or family and write what happened.",
        priority: "high",
        category: "practice",
        related_lesson_id: null,
        evidence_required: true,
        dueInDays: 7,
      },
      {
        title: "Record one family win",
        description: "Capture something that went well this week, even if it was small.",
        priority: "medium",
        category: "strengths",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 7,
      },
      {
        title: "Add one skill to My Toolbox",
        description: "Name one skill you practised and want to keep using.",
        priority: "medium",
        category: "toolbox",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 7,
      },
    ],
    evidenceTemplates: [
      {
        title: "Real-world practice activity",
        notes: "Describe the skill, where you used it, what went well, what was difficult, and what you would try next.",
      },
      {
        title: "Weekly family win",
        notes: "Record one positive moment, routine, conversation, repair, or safer choice from this week.",
      },
    ],
  },
  {
    id: "evidence-of-change-engine",
    title: "Evidence of Change Engine Setup",
    description: "Creates report-ready evidence drafts for growth, consistency, and change over time.",
    taskTemplates: [
      {
        title: "Review the growth timeline",
        description: "Open the timeline and check whether your actions and reflections show the change you are working on.",
        priority: "medium",
        category: "timeline",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 7,
      },
      {
        title: "Prepare one report-ready evidence item",
        description: "Choose one item that objectively shows effort, participation, practice, or follow-through.",
        priority: "high",
        category: "evidence",
        related_lesson_id: null,
        evidence_required: true,
        dueInDays: 7,
      },
    ],
    evidenceTemplates: [
      {
        title: "Evidence of change summary",
        notes: "Summarise what changed, what helped, and which evidence item supports it.",
      },
      {
        title: "Consistency record",
        notes: "Record repeated action over time, such as check-ins, routine practice, appointments, or lesson completion.",
      },
    ],
  },
  {
    id: "family-strengths-engine",
    title: "Family Strengths Engine Setup",
    description: "Creates tasks and drafts for strengths, family mission, and the child's future letter.",
    taskTemplates: [
      {
        title: "Write or update the family mission statement",
        description: "Create a short statement about the safe, respectful home your family is working toward.",
        priority: "medium",
        category: "strengths",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 14,
      },
      {
        title: "Write the child's future letter",
        description: "Write what you would like your child to know about the effort you are making today.",
        priority: "medium",
        category: "reflection",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 14,
      },
    ],
    evidenceTemplates: [
      {
        title: "Family mission statement",
        notes: "Our family is working toward...",
      },
      {
        title: "Child's future letter",
        notes: "Imagine your child reads this in ten years. What would you like them to know?",
      },
    ],
  },
  {
    id: "facilitator-review-engine",
    title: "Facilitator Review Setup",
    description: "Creates review tasks that help facilitators focus on reflection quality, evidence, risk, and next steps.",
    taskTemplates: [
      {
        title: "Review facilitator workspace",
        description: "Check review priority, reflection records, objective evidence, and suggested next conversation.",
        priority: "medium",
        category: "facilitator-review",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 7,
      },
      {
        title: "Prepare next-session discussion points",
        description: "Identify one strength, one barrier, one evidence gap, and one next small step.",
        priority: "medium",
        category: "facilitator-review",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 7,
      },
    ],
    evidenceTemplates: [
      {
        title: "Next-session discussion points",
        notes: "Strength noticed, barrier to discuss, evidence gap, next small step.",
      },
    ],
  },
] as const;

export async function getPrograms() {
  return fallbackPrograms;
}

export function getProgramById(programId: string) {
  return fallbackPrograms.find((program) => program.id === programId) ?? null;
}

const weekFocusCycle = [
  {
    focus: "Understanding the topic",
    evidencePrompt: "Save one note or document showing a safer routine, plan, or completed weekly action.",
  },
  {
    focus: "Practising the skill",
    evidencePrompt: "Record one strength in action and one support or routine you used during the week.",
  },
  {
    focus: "Using the skill under pressure",
    evidencePrompt: "Attach a reflection or example showing what changed after a difficult moment.",
  },
  {
    focus: "Reviewing growth and next steps",
    evidencePrompt: "Complete a check-in and save one item that helps explain progress over time.",
  },
];

const monthlyProgramTopics = [
  "Communication",
  "Child Development",
  "Positive Parenting",
  "Attachment and Bonding",
  "Emotional Regulation",
  "Behaviour Management",
  "Child Safety",
  "Protective Parenting",
  "Family Relationships",
  "Family Routines and Structure",
  "Co-Parenting",
  "Reunification Parenting",
  "Trauma-Informed Parenting",
  "Mental Health and Parenting",
  "Parenting Through Crisis",
];

const intensiveReunificationMonthTopics = [
  "Beginning the Reunification Journey",
  "Safety, Accountability, and Trust",
  "Repairing Parent-Child Connection",
  "Predictable Parenting Time",
  "Preparing for Increased Contact",
  "Parenting Time Transitions",
  "Re-Establishing Family Identity",
  "Full-Time Family Adjustment",
  "Long-Term Family Stability",
  "Family Communication Practice",
  "Problem-Solving Skills",
  "Sustaining Reunification Progress",
  "Strengthening Trust After Reunification",
  "Building Long-Term Routines",
  "Supporting Emotional Development",
  "Guiding Behaviour With Safety",
  "Managing Stress and Setbacks",
  "Deepening Parent-Child Connection",
  "Strengthening Long-Term Safety",
  "Supporting Family Growth",
  "Long-Term Emotional Stability",
  "Life Skills and Independence",
  "Future-Focused Family Planning",
  "Celebrating the Reunification Journey",
];

const intensiveReunificationWeekFocusCycle = [
  {
    focus: "Safety, accountability, and case-plan clarity",
    evidencePrompt: "Upload or write one factual note showing how this week's safety expectation was understood, practised, or reviewed.",
  },
  {
    focus: "Child experience, attachment, and repair",
    evidencePrompt: "Record one child-centred reflection or worker-approved observation about connection, repair, or contact preparation.",
  },
  {
    focus: "Regulation, routines, and parenting under pressure",
    evidencePrompt: "Document one routine, regulation tool, or support action used before stress escalated.",
  },
  {
    focus: "Evidence review, support coordination, and next steps",
    evidencePrompt: "Summarise what changed this month, what evidence supports it, and what still needs worker or support-service review.",
  },
];

const dailyLessonFocus = [
  "What this means to my family",
  "What I already do well",
  "What gets difficult",
  "A safer way to practise",
  "What changed this week",
];

const intensiveReunificationDailyLessonFocus = [
  "Understand the current reunification expectation",
  "Name what this means for my child",
  "Practise one safe parenting behaviour",
  "Prepare for contact, transition, or home routine",
  "Use support before stress escalates",
  "Record factual evidence of safe change",
  "Reflect on progress, repair, and next steps",
];

function getMonthlyTopic(weekNumber: number, programId?: string) {
  const monthNumber = Math.ceil(weekNumber / 4);
  if (programId === "intensive-reunification") {
    return intensiveReunificationMonthTopics[monthNumber - 1] ?? `Reunification Month ${monthNumber}`;
  }

  return monthlyProgramTopics[(monthNumber - 1) % monthlyProgramTopics.length];
}

function getReflectionPrompt(level: "monthly" | "weekly" | "daily", topic: string) {
  const label = level === "monthly" ? "monthly topic" : level === "weekly" ? "weekly sub topic" : "today's lesson";

  return `What does this ${label}, ${topic}, mean to you? There are no right or wrong answers. This helps SafeSteps understand your current thoughts, experience, and starting point.`;
}

function getDailyProgramLessons(monthTopic: string, weekFocus: string) {
  return dailyLessonFocus.map((focus, index) => ({
    dayNumber: index + 1,
    title: `${monthTopic}: ${focus}`,
    durationMinutes: 30,
    meaningPrompt: getReflectionPrompt("daily", focus),
    checkpoint: `Name one idea from ${weekFocus.toLowerCase()} that could help at home.`,
    practiceTask: `Try one small ${monthTopic.toLowerCase()} action and write what happened.`,
  }));
}

function getIntensiveReunificationDailyLessons(monthTopic: string, weekFocus: string) {
  return intensiveReunificationDailyLessonFocus.map((focus, index) => ({
    dayNumber: index + 1,
    title: `${monthTopic}: ${focus}`,
    durationMinutes: 30,
    meaningPrompt: getReflectionPrompt("daily", focus),
    checkpoint: `Name one ${weekFocus.toLowerCase()} action that protects your child, follows the current plan, or builds safer contact.`,
    practiceTask: `Practise one small ${monthTopic.toLowerCase()} action that is safe, observable, and aligned with your current case or support plan. Record what happened factually.`,
  }));
}

export function getProgramWeekPlan(programId: string, weekId: string | number) {
  const program = getProgramById(programId);
  if (!program) return null;

  const weekNumber = Number(weekId);
  if (!Number.isInteger(weekNumber) || weekNumber < 1) return null;
  if (program.weeks > 0 && weekNumber > program.weeks) return null;

  const isIntensiveReunification = program.id === "intensive-reunification";
  const cycle = isIntensiveReunification
    ? intensiveReunificationWeekFocusCycle[(weekNumber - 1) % intensiveReunificationWeekFocusCycle.length]
    : weekFocusCycle[(weekNumber - 1) % weekFocusCycle.length];
  const monthNumber = Math.ceil(weekNumber / 4);
  const weekInMonth = ((weekNumber - 1) % 4) + 1;
  const monthTopic = getMonthlyTopic(weekNumber, program.id);
  const focus = `${monthTopic}: ${cycle.focus}`;
  const weekLessons = appLessons.filter((lesson) => lesson.week === weekNumber).map((lesson) => lesson.id);

  return {
    id: `${program.id}-week-${weekNumber}`,
    monthNumber,
    monthTopic,
    monthReflectionPrompt: getReflectionPrompt("monthly", monthTopic),
    weekNumber,
    weekInMonth,
    title: program.weeks > 0 ? `Month ${monthNumber}, Week ${weekInMonth}` : "Custom plan setup",
    focus,
    weeklyReflectionPrompt: getReflectionPrompt("weekly", focus),
    evidencePrompt: cycle.evidencePrompt,
    lessonIds: weekLessons,
    dailyLessons: isIntensiveReunification
      ? getIntensiveReunificationDailyLessons(monthTopic, cycle.focus)
      : getDailyProgramLessons(monthTopic, cycle.focus),
  } satisfies ProgramWeekPlan;
}

export function getProgramWeekPlans(programId: string, count = 6) {
  const program = getProgramById(programId);
  if (!program) return [];

  const totalWeeks = program.weeks > 0 ? Math.min(program.weeks, count) : 1;

  return Array.from({ length: totalWeeks }, (_, index) => getProgramWeekPlan(program.id, index + 1)).filter(
    (week): week is ProgramWeekPlan => Boolean(week),
  );
}

export function getProgramWeekBulkPlan(programId: string, weekId: string | number): ProgramWeekBulkPlan | null {
  const program = getProgramById(programId);
  const week = getProgramWeekPlan(programId, weekId);

  if (!program || !week) return null;

  const lessonTask = week.lessonIds[0]
    ? {
        title: `Complete ${week.title} linked lesson`,
        description: `Work through the linked lesson for ${program.title} and record one reflection.`,
        priority: "high" as const,
        category: "lesson",
        related_lesson_id: week.lessonIds[0],
        evidence_required: false,
        dueInDays: 7,
      }
    : {
        title: `Complete ${week.title} learning activity`,
        description: `Use the learning library to complete one activity connected to ${week.focus.toLowerCase()}.`,
        priority: "high" as const,
        category: "lesson",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 7,
      };

  return {
    tasks: [
      {
        title: `Start ${program.title} ${week.title}`,
        description: week.focus,
        priority: "high",
        category: "program",
        related_lesson_id: week.lessonIds[0] ?? null,
        evidence_required: false,
        dueInDays: 1,
      },
      lessonTask,
      {
        title: `Upload ${week.title} evidence`,
        description: week.evidencePrompt,
        priority: "high",
        category: "evidence",
        related_lesson_id: week.lessonIds[0] ?? null,
        evidence_required: true,
        dueInDays: 7,
      },
      {
        title: `Review ${week.title} progress`,
        description: "Check completed tasks, saved evidence, and report notes before moving to the next week.",
        priority: "medium",
        category: "review",
        related_lesson_id: null,
        evidence_required: false,
        dueInDays: 7,
      },
    ],
    evidence: [
      {
        title: `${program.title} ${week.title} evidence draft`,
        notes: week.evidencePrompt,
      },
      {
        title: `${week.title} reflection draft`,
        notes: `Write what changed this week, what was hard, what helped, and what support is needed next. Focus: ${week.focus}`,
      },
    ],
  };
}

export async function getLearningCourses() {
  return learningCourses;
}

export function getEvidenceSystemSummary() {
  return {
    pillars: ["Assessment engine", "Behaviour change program", "Proof-of-evidence system"],
    components: [
      "Baseline, midpoint, and final assessments",
      "Daily micro-check-ins",
      "Weekly evidence uploads",
      "Skill demonstration tasks",
      "Monthly deep-dive questionnaires",
      "Behaviour change scoring",
      "Court-ready reports",
      "Spiral reassessments every few weeks",
    ],
    scoringDomains: [
      "Parenting capacity",
      "Safety awareness",
      "Emotional regulation",
      "Insight and accountability",
      "Co-parenting behaviour",
      "Stress and triggers",
      "Protective factors",
      "Skill adoption",
      "Consistency and reliability",
      "Risk reduction",
    ],
  };
}

export async function getProfile(userId: string, email?: string | null) {
  if (isDemoUser(userId)) return demoState.profile;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,display_name,role,story_goal,strengths,support_notes")
    .eq("id", userId)
    .maybeSingle();

  if (!error && data) {
    return data as SafeStepsProfile;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email: email ?? null,
      role: "parent",
    })
    .select("id,email,display_name,role,story_goal,strengths,support_notes")
    .single();

  if (insertError) throw insertError;

  return inserted as SafeStepsProfile;
}

export async function updateProfile(
  userId: string,
  values: Pick<SafeStepsProfile, "display_name" | "story_goal" | "strengths" | "support_notes">,
) {
  if (isDemoUser(userId)) {
    demoState.profile = {
      ...demoState.profile,
      display_name: values.display_name?.trim() || null,
      story_goal: values.story_goal.trim(),
      strengths: values.strengths.trim(),
      support_notes: values.support_notes.trim(),
    };
    addDemoEvent("profile_updated", "My Story updated");
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: values.display_name?.trim() || null,
      story_goal: values.story_goal.trim(),
      strengths: values.strengths.trim(),
      support_notes: values.support_notes.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "profile_updated",
    label: "My Story updated",
  });
}

export async function enrollInProgram(userId: string, programId: string) {
  if (isDemoUser(userId)) {
    if (!demoState.enrollments.some((item) => item.program_id === programId)) {
      demoState.enrollments.unshift({
        id: demoId("enrollment"),
        program_id: programId,
        status: "active",
        started_at: new Date().toISOString(),
        completed_at: null,
      });
      addDemoEvent("program_enrolled", `${getProgramTitle(programId)} selected`, { programId });
    }
    return;
  }

  const { error } = await supabase.from("program_enrollments").upsert(
    {
      owner_id: userId,
      program_id: programId,
      status: "active",
    },
    { onConflict: "owner_id,program_id" },
  );

  if (error) throw error;
}

export async function getTasks(userId: string) {
  if (isDemoUser(userId)) {
    if (demoState.tasks.length === 0) {
      demoState.tasks = starterTasks.map((task, index) => ({
        id: demoId(`task-${index}`),
        status: "ready",
        completed_at: null,
        due_at: null,
        ...task,
      }));
    }
    return demoState.tasks;
  }

  const { data, error } = await supabase
    .from("user_tasks")
    .select("id,title,description,status,completed_at,due_at,priority,related_lesson_id,evidence_required,category")
    .eq("owner_id", userId)
    .order("priority", { ascending: false })
    .order("created_at");

  if (error) {
    return starterTasks.map((task, index) => ({
      id: `fallback-${index}`,
      status: "ready" as const,
      completed_at: null,
      due_at: null,
      ...task,
    }));
  }

  if (data.length === 0) {
    const { data: inserted, error: insertError } = await supabase
      .from("user_tasks")
      .insert(starterTasks.map((task) => ({ ...task, owner_id: userId })))
      .select("id,title,description,status,completed_at,due_at,priority,related_lesson_id,evidence_required,category");

    if (!insertError && inserted) {
      return inserted as SafeStepsTask[];
    }
  }

  return data as SafeStepsTask[];
}

export async function setTaskCompleted(userId: string, task: SafeStepsTask, completed: boolean) {
  if (isDemoUser(userId)) {
    await setTaskStatus(userId, task, completed ? "completed" : "ready");
    return;
  }

  if (task.id.startsWith("fallback-")) return;

  const nextStatus = completed ? "completed" : "ready";
  const completedAt = completed ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("user_tasks")
    .update({ status: nextStatus, completed_at: completedAt })
    .eq("id", task.id)
    .eq("owner_id", userId);

  if (error) throw error;

  if (completed) {
    await supabase.from("progress_events").insert({
      owner_id: userId,
      event_type: "task_completed",
      label: task.title,
      metadata: { taskId: task.id },
    });
  }
}

export async function setTaskStatus(userId: string, task: SafeStepsTask, status: SafeStepsTask["status"]) {
  if (isDemoUser(userId)) {
    demoState.tasks = demoState.tasks.map((item) =>
      item.id === task.id
        ? {
            ...item,
            status,
            completed_at: status === "completed" ? new Date().toISOString() : null,
          }
        : item,
    );
    addDemoEvent("task_status_updated", `${task.title}: ${status.replace("_", " ")}`, { taskId: task.id, status });
    return;
  }

  if (task.id.startsWith("fallback-")) return;

  const completedAt = status === "completed" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("user_tasks")
    .update({ status, completed_at: completedAt })
    .eq("id", task.id)
    .eq("owner_id", userId);

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "task_status_updated",
    label: `${task.title}: ${status.replace("_", " ")}`,
    metadata: { taskId: task.id, status },
  });
}

export async function bulkSetTaskStatus(userId: string, tasks: SafeStepsTask[], status: SafeStepsTask["status"]) {
  const realTasks = tasks.filter((task) => !task.id.startsWith("fallback-") && task.status !== status);

  if (realTasks.length === 0) return { updatedCount: 0 };

  const completedAt = status === "completed" ? new Date().toISOString() : null;

  if (isDemoUser(userId)) {
    const taskIds = new Set(realTasks.map((task) => task.id));
    demoState.tasks = demoState.tasks.map((task) =>
      taskIds.has(task.id)
        ? {
            ...task,
            status,
            completed_at: completedAt,
          }
        : task,
    );
    addDemoEvent("tasks_bulk_status_updated", `${realTasks.length} tasks marked ${status.replace("_", " ")}`, {
      taskIds: realTasks.map((task) => task.id),
      taskTitles: realTasks.map((task) => task.title),
      status,
    });
    return { updatedCount: realTasks.length };
  }

  const { error } = await supabase
    .from("user_tasks")
    .update({ status, completed_at: completedAt })
    .eq("owner_id", userId)
    .in("id", realTasks.map((task) => task.id));

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "tasks_bulk_status_updated",
    label: `${realTasks.length} tasks marked ${status.replace("_", " ")}`,
    metadata: {
      taskIds: realTasks.map((task) => task.id),
      taskTitles: realTasks.map((task) => task.title),
      status,
    },
  });

  return { updatedCount: realTasks.length };
}

function dateInDays(days: number | null) {
  if (days === null) return null;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate.toISOString();
}

export async function bulkAddTasks(userId: string, templates: TaskBulkTemplate[]) {
  if (templates.length === 0) return { addedCount: 0, skippedCount: 0 };

  if (isDemoUser(userId)) {
    const existingTitles = new Set(demoState.tasks.map((task) => task.title));
    const templatesToAdd = templates.filter((template) => !existingTitles.has(template.title));
    demoState.tasks.unshift(
      ...templatesToAdd.map((template) => ({
        id: demoId("task"),
        title: template.title,
        description: template.description,
        status: "ready" as const,
        completed_at: null,
        due_at: dateInDays(template.dueInDays),
        priority: template.priority,
        related_lesson_id: template.related_lesson_id,
        evidence_required: template.evidence_required,
        category: template.category,
      })),
    );
    addDemoEvent(
      templatesToAdd.length > 0 ? "tasks_bulk_added" : "tasks_bulk_skipped",
      templatesToAdd.length > 0 ? `${templatesToAdd.length} tasks added` : "Bulk task plan already exists",
      { taskTitles: templatesToAdd.map((template) => template.title) },
    );
    return { addedCount: templatesToAdd.length, skippedCount: templates.length - templatesToAdd.length };
  }

  const { data: existingTasks, error: existingError } = await supabase
    .from("user_tasks")
    .select("title")
    .eq("owner_id", userId)
    .in("title", templates.map((template) => template.title));

  if (existingError) throw existingError;

  const existingTitles = new Set((existingTasks ?? []).map((task) => task.title));
  const templatesToAdd = templates.filter((template) => !existingTitles.has(template.title));

  if (templatesToAdd.length === 0) {
    await supabase.from("progress_events").insert({
      owner_id: userId,
      event_type: "tasks_bulk_skipped",
      label: "Bulk task plan already exists",
      metadata: { taskTitles: templates.map((template) => template.title) },
    });

    return { addedCount: 0, skippedCount: templates.length };
  }

  const { error } = await supabase.from("user_tasks").insert(
    templatesToAdd.map((template) => ({
      owner_id: userId,
      title: template.title,
      description: template.description,
      priority: template.priority,
      category: template.category,
      related_lesson_id: template.related_lesson_id,
      evidence_required: template.evidence_required,
      due_at: dateInDays(template.dueInDays),
    })),
  );

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "tasks_bulk_added",
    label: `${templatesToAdd.length} tasks added`,
    metadata: {
      taskTitles: templatesToAdd.map((template) => template.title),
      skippedTitles: templates.filter((template) => existingTitles.has(template.title)).map((template) => template.title),
    },
  });

  return { addedCount: templatesToAdd.length, skippedCount: templates.length - templatesToAdd.length };
}

export async function getEvidence(userId: string) {
  if (isDemoUser(userId)) return demoState.evidence;

  const { data, error } = await supabase
    .from("evidence_items")
    .select("id,title,notes,file_path,status,created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];

  return data as EvidenceItem[];
}

function buildDailyHomeEvidenceStatus(items: EvidenceItem[], dateKey: string): DailyHomeEvidenceStatus {
  const matchingItems = items.filter(
    (item) => isDailyHomeEvidence(item) && item.notes.includes(`date=${dateKey}`),
  );

  const insideComplete = matchingItems.some((item) => hasDailyHomeCategory(item, "inside_home", dateKey));
  const outsideComplete = matchingItems.some((item) => hasDailyHomeCategory(item, "outside_home", dateKey));

  return {
    dateKey,
    insideComplete,
    outsideComplete,
    complete: insideComplete && outsideComplete,
    items: matchingItems,
  };
}

export async function getDailyHomeEvidenceStatus(userId: string, dateKey = getDateKey()): Promise<DailyHomeEvidenceStatus> {
  return buildDailyHomeEvidenceStatus(await getEvidence(userId), dateKey);
}

export async function getDailyHomeEvidenceHistory(userId: string, dayCount = 7): Promise<DailyHomeEvidenceHistory> {
  const evidenceItems = await getEvidence(userId);
  const days = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return buildDailyHomeEvidenceStatus(evidenceItems, getDateKey(date));
  });
  const completeDays = days.filter((day) => day.complete).length;

  return {
    days,
    completeDays,
    missingDays: days.length - completeDays,
  };
}

export async function getDailyHomeEvidenceTaskTemplates(userId: string, dateKey = getDateKey()) {
  const status = await getDailyHomeEvidenceStatus(userId, dateKey);
  const templates: TaskBulkTemplate[] = [];

  if (!status.insideComplete) {
    templates.push({
      title: `Daily hard evidence - Inside house - ${dateKey}`,
      description: "Add today's required inside house photo or video evidence.",
      priority: "high",
      category: "daily-evidence",
      related_lesson_id: null,
      evidence_required: true,
      dueInDays: 0,
    });
  }

  if (!status.outsideComplete) {
    templates.push({
      title: `Daily hard evidence - Outside house - ${dateKey}`,
      description: "Add today's required outside house photo or video evidence.",
      priority: "high",
      category: "daily-evidence",
      related_lesson_id: null,
      evidence_required: true,
      dueInDays: 0,
    });
  }

  return templates;
}

export async function createDailyHomeEvidenceTasks(userId: string, dateKey = getDateKey()) {
  const templates = await getDailyHomeEvidenceTaskTemplates(userId, dateKey);
  return bulkAddTasks(userId, templates);
}

export async function addEvidenceNote(userId: string, title: string, notes: string, filePath?: string) {
  if (isDemoUser(userId)) {
    demoState.evidence.unshift({
      id: demoId("evidence"),
      title: title.trim(),
      notes: notes.trim(),
      file_path: filePath ?? null,
      status: "stored",
      created_at: new Date().toISOString(),
    });
    addDemoEvent("evidence_added", title.trim());
    return;
  }

  const { error } = await supabase.from("evidence_items").insert({
    owner_id: userId,
    title: title.trim(),
    notes: notes.trim(),
    file_path: filePath ?? null,
    status: "stored",
  });

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "evidence_added",
    label: title.trim(),
  });
}

export async function saveProgramMeaningReflections(userId: string, input: ProgramMeaningReflectionInput) {
  const base = {
    program_id: input.programId,
    program_title: input.programTitle,
    month_number: input.week.monthNumber,
    month_topic: input.week.monthTopic,
    week_number: input.week.weekNumber,
    week_in_month: input.week.weekInMonth,
  };

  const rows = [
    {
      ...base,
      reflection_type: "monthly_meaning" as const,
      day_number: null,
      lesson_title: null,
      prompt: input.week.monthReflectionPrompt,
      response: input.monthResponse.trim(),
      metadata: { source: "program_week" },
    },
    {
      ...base,
      reflection_type: "weekly_meaning" as const,
      day_number: null,
      lesson_title: null,
      prompt: input.week.weeklyReflectionPrompt,
      response: input.weeklyResponse.trim(),
      metadata: { source: "program_week" },
    },
    ...input.week.dailyLessons.map((lesson) => ({
      ...base,
      reflection_type: "daily_meaning" as const,
      day_number: lesson.dayNumber,
      lesson_title: lesson.title,
      prompt: lesson.meaningPrompt,
      response: input.dailyResponses[lesson.dayNumber]?.trim() ?? "",
      metadata: {
        source: "program_week",
        durationMinutes: lesson.durationMinutes,
        checkpoint: lesson.checkpoint,
        practiceTask: lesson.practiceTask,
      },
    })),
  ];

  if (isDemoUser(userId)) {
    demoState.reflections.unshift(
      ...rows.map((row) => ({
        id: demoId("reflection"),
        ...row,
        created_at: new Date().toISOString(),
      })),
    );
    addDemoEvent("meaning_reflections_saved", `${input.programTitle} ${input.week.title} meaning reflections`, {
      programId: input.programId,
      programTitle: input.programTitle,
      weekNumber: input.week.weekNumber,
      monthNumber: input.week.monthNumber,
    });
    return;
  }

  const { error } = await supabase.from("program_reflections").insert(
    rows.map((row) => ({
      owner_id: userId,
      ...row,
    })),
  );

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "meaning_reflections_saved",
    label: `${input.programTitle} ${input.week.title} meaning reflections`,
    metadata: {
      programId: input.programId,
      programTitle: input.programTitle,
      weekNumber: input.week.weekNumber,
      monthNumber: input.week.monthNumber,
    },
  });
}

export async function saveWeeklyGrowthNotes(userId: string, input: WeeklyGrowthNotesInput) {
  const base = {
    program_id: input.programId,
    program_title: input.programTitle,
    month_number: input.week.monthNumber,
    month_topic: input.week.monthTopic,
    week_number: input.week.weekNumber,
    week_in_month: input.week.weekInMonth,
    day_number: null,
    lesson_title: null,
  };
  const rows = [
    {
      ...base,
      reflection_type: "weekly_family_win" as const,
      prompt: "What went well for your family this week?",
      response: input.familyWin.trim(),
      metadata: { source: "weekly_growth_notes" },
    },
    {
      ...base,
      reflection_type: "toolbox_skill" as const,
      prompt: "What skill are you adding to My Toolbox?",
      response: input.toolboxSkill.trim(),
      metadata: { source: "weekly_growth_notes" },
    },
    {
      ...base,
      reflection_type: "child_future_letter" as const,
      prompt: "Imagine your child reads this in ten years. What would you like them to know about the effort you are making today?",
      response: input.futureLetter.trim(),
      metadata: { source: "weekly_growth_notes" },
    },
  ];

  if (isDemoUser(userId)) {
    demoState.reflections.unshift(
      ...rows.map((row) => ({
        id: demoId("reflection"),
        ...row,
        created_at: new Date().toISOString(),
      })),
    );
    addDemoEvent("weekly_growth_notes_saved", `${input.programTitle} ${input.week.title} weekly growth notes`, {
      programId: input.programId,
      weekNumber: input.week.weekNumber,
      monthNumber: input.week.monthNumber,
    });
    return;
  }

  const { error } = await supabase.from("program_reflections").insert(
    rows.map((row) => ({
      owner_id: userId,
      ...row,
    })),
  );

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "weekly_growth_notes_saved",
    label: `${input.programTitle} ${input.week.title} weekly growth notes`,
    metadata: {
      programId: input.programId,
      weekNumber: input.week.weekNumber,
      monthNumber: input.week.monthNumber,
    },
  });
}

export async function saveDailyProgramLessonCompletion(userId: string, input: DailyProgramLessonCompletionInput) {
  const lesson = input.week.dailyLessons.find((item) => item.dayNumber === input.dayNumber);
  if (!lesson) throw new Error("Daily program lesson not found.");

  const base = {
    program_id: input.programId,
    program_title: input.programTitle,
    month_number: input.week.monthNumber,
    month_topic: input.week.monthTopic,
    week_number: input.week.weekNumber,
    week_in_month: input.week.weekInMonth,
    day_number: lesson.dayNumber,
    lesson_title: lesson.title,
  };

  const rows = [
    {
      ...base,
      reflection_type: "daily_meaning" as const,
      prompt: lesson.meaningPrompt,
      response: input.meaningResponse.trim(),
      metadata: { source: "daily_lesson_player", durationMinutes: lesson.durationMinutes },
    },
    {
      ...base,
      reflection_type: "end_reflection" as const,
      prompt: "What did you learn, practise, or notice after today's lesson?",
      response: input.endReflection.trim(),
      metadata: {
        source: "daily_lesson_player",
        checkpointResponse: input.checkpointResponse.trim(),
        scenarioResponse: input.scenarioResponse.trim(),
        practiceResponse: input.practiceResponse.trim(),
        checkpoint: lesson.checkpoint,
        practiceTask: lesson.practiceTask,
      },
    },
  ];

  if (isDemoUser(userId)) {
    demoState.reflections.unshift(
      ...rows.map((row) => ({
        id: demoId("reflection"),
        ...row,
        created_at: new Date().toISOString(),
      })),
    );
    addDemoEvent("daily_program_lesson_completed", `${input.programTitle} ${lesson.title}`, {
      programId: input.programId,
      weekNumber: input.week.weekNumber,
      dayNumber: lesson.dayNumber,
    });
    return;
  }

  const { error } = await supabase.from("program_reflections").insert(
    rows.map((row) => ({
      owner_id: userId,
      ...row,
    })),
  );

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "daily_program_lesson_completed",
    label: `${input.programTitle} ${lesson.title}`,
    metadata: {
      programId: input.programId,
      weekNumber: input.week.weekNumber,
      dayNumber: lesson.dayNumber,
    },
  });
}

export async function addDailyHomeEvidence(
  userId: string,
  category: DailyHomeEvidenceCategory,
  mediaType: "photo" | "video",
  notes: string,
  filePath?: string,
  dateKey = getDateKey(),
) {
  const title = dailyHomeEvidenceTitle(category, dateKey, mediaType);
  const evidenceNotes = dailyHomeEvidenceNotes(category, dateKey, mediaType, notes);

  if (isDemoUser(userId)) {
    demoState.evidence.unshift({
      id: demoId("daily-evidence"),
      title,
      notes: evidenceNotes,
      file_path: filePath ?? `demo/${dateKey}/${category}-${mediaType}`,
      status: "stored",
      created_at: new Date().toISOString(),
    });
    addDemoEvent("daily_home_evidence_added", `${dailyHomeEvidenceLabels[category]} ${mediaType} added`, {
      category,
      dateKey,
      mediaType,
    });
    return;
  }

  const { error } = await supabase.from("evidence_items").insert({
    owner_id: userId,
    title,
    notes: evidenceNotes,
    file_path: filePath ?? null,
    status: "stored",
  });

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "daily_home_evidence_added",
    label: `${dailyHomeEvidenceLabels[category]} ${mediaType} added`,
    metadata: { category, dateKey, mediaType },
  });
}

export async function setEvidenceStatus(userId: string, item: EvidenceItem, status: EvidenceItem["status"]) {
  if (isDemoUser(userId)) {
    demoState.evidence = demoState.evidence.map((evidenceItem) =>
      evidenceItem.id === item.id ? { ...evidenceItem, status } : evidenceItem,
    );
    addDemoEvent("evidence_status_updated", `${item.title}: ${status}`, { evidenceId: item.id, status });
    return;
  }

  const { error } = await supabase
    .from("evidence_items")
    .update({ status })
    .eq("id", item.id)
    .eq("owner_id", userId);

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "evidence_status_updated",
    label: `${item.title}: ${status}`,
    metadata: { evidenceId: item.id, status },
  });
}

export async function bulkSetEvidenceStatus(
  userId: string,
  items: EvidenceItem[],
  status: EvidenceItem["status"],
) {
  const itemsToUpdate = items.filter((item) => item.status !== status);

  if (itemsToUpdate.length === 0) return { updatedCount: 0 };

  if (isDemoUser(userId)) {
    const itemIds = new Set(itemsToUpdate.map((item) => item.id));
    demoState.evidence = demoState.evidence.map((item) => (itemIds.has(item.id) ? { ...item, status } : item));
    addDemoEvent("evidence_bulk_status_updated", `${itemsToUpdate.length} evidence items marked ${status}`, {
      evidenceIds: itemsToUpdate.map((item) => item.id),
      evidenceTitles: itemsToUpdate.map((item) => item.title),
      status,
    });
    return { updatedCount: itemsToUpdate.length };
  }

  const { error } = await supabase
    .from("evidence_items")
    .update({ status })
    .eq("owner_id", userId)
    .in("id", itemsToUpdate.map((item) => item.id));

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "evidence_bulk_status_updated",
    label: `${itemsToUpdate.length} evidence items marked ${status}`,
    metadata: {
      evidenceIds: itemsToUpdate.map((item) => item.id),
      evidenceTitles: itemsToUpdate.map((item) => item.title),
      status,
    },
  });

  return { updatedCount: itemsToUpdate.length };
}

export async function bulkAddEvidenceNotes(userId: string, templates: EvidenceBulkTemplate[]) {
  if (templates.length === 0) return { addedCount: 0, skippedCount: 0 };

  if (isDemoUser(userId)) {
    const existingTitles = new Set(demoState.evidence.map((item) => item.title));
    const templatesToAdd = templates.filter((template) => !existingTitles.has(template.title));
    demoState.evidence.unshift(
      ...templatesToAdd.map((template) => ({
        id: demoId("evidence"),
        title: template.title,
        notes: template.notes,
        file_path: null,
        status: "draft" as const,
        created_at: new Date().toISOString(),
      })),
    );
    addDemoEvent(
      templatesToAdd.length > 0 ? "evidence_bulk_added" : "evidence_bulk_skipped",
      templatesToAdd.length > 0
        ? `${templatesToAdd.length} evidence drafts added`
        : "Bulk evidence drafts already exist",
      { evidenceTitles: templatesToAdd.map((template) => template.title) },
    );
    return { addedCount: templatesToAdd.length, skippedCount: templates.length - templatesToAdd.length };
  }

  const { data: existingEvidence, error: existingError } = await supabase
    .from("evidence_items")
    .select("title")
    .eq("owner_id", userId)
    .in("title", templates.map((template) => template.title));

  if (existingError) throw existingError;

  const existingTitles = new Set((existingEvidence ?? []).map((item) => item.title));
  const templatesToAdd = templates.filter((template) => !existingTitles.has(template.title));

  if (templatesToAdd.length === 0) {
    await supabase.from("progress_events").insert({
      owner_id: userId,
      event_type: "evidence_bulk_skipped",
      label: "Bulk evidence drafts already exist",
      metadata: { evidenceTitles: templates.map((template) => template.title) },
    });

    return { addedCount: 0, skippedCount: templates.length };
  }

  const { error } = await supabase.from("evidence_items").insert(
    templatesToAdd.map((template) => ({
      owner_id: userId,
      title: template.title,
      notes: template.notes,
      status: "draft",
    })),
  );

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "evidence_bulk_added",
    label: `${templatesToAdd.length} evidence drafts added`,
    metadata: {
      evidenceTitles: templatesToAdd.map((template) => template.title),
      skippedTitles: templates.filter((template) => existingTitles.has(template.title)).map((template) => template.title),
    },
  });

  return { addedCount: templatesToAdd.length, skippedCount: templates.length - templatesToAdd.length };
}

export async function uploadEvidenceMedia(userId: string, uri: string, fileName?: string, mimeType?: string) {
  if (isDemoUser(userId)) {
    const fallbackExtension = mimeType?.startsWith("video/") ? "mp4" : "jpg";
    const extension = fileName?.split(".").pop() ?? mimeType?.split("/").pop() ?? fallbackExtension;
    const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || fallbackExtension;
    return `${userId}/demo-${Date.now()}.${safeExtension}`;
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const fallbackExtension = mimeType?.startsWith("video/") ? "mp4" : "jpg";
  const extension = fileName?.split(".").pop() ?? mimeType?.split("/").pop() ?? fallbackExtension;
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || fallbackExtension;
  const path = `${userId}/${Date.now()}.${safeExtension}`;

  const { error } = await supabase.storage.from("evidence").upload(path, blob, {
    contentType: mimeType ?? blob.type ?? (fallbackExtension === "mp4" ? "video/mp4" : "image/jpeg"),
    upsert: false,
  });

  if (error) throw error;

  return path;
}

export async function uploadEvidenceImage(userId: string, uri: string, fileName?: string, mimeType?: string) {
  return uploadEvidenceMedia(userId, uri, fileName, mimeType);
}

export async function getDashboardCounts(userId: string) {
  if (isDemoUser(userId)) {
    const activeEnrollment = demoState.enrollments[0] ?? null;
    const latestCheckIn = demoState.events.find((event) => event.event_type === "daily_check_in") ?? null;

    return {
      taskCount: demoState.tasks.length,
      completedTaskCount: demoState.tasks.filter((task) => task.status === "completed").length,
      evidenceCount: demoState.evidence.length,
      dailyHomeEvidenceComplete: (await getDailyHomeEvidenceStatus(userId)).complete,
      enrollmentCount: demoState.enrollments.length,
      completedLessonCount: demoState.events.filter((event) => event.event_type === "lesson_completed").length,
      activeProgramId: activeEnrollment?.program_id ?? null,
      activeProgramTitle: activeEnrollment?.program_id ? getProgramTitle(activeEnrollment.program_id) : null,
      latestCheckInAt: latestCheckIn?.created_at ?? null,
      setupPending: false,
    };
  }

  const [tasks, evidence, enrollments, lessons, checkIns] = await Promise.all([
    supabase.from("user_tasks").select("id,status").eq("owner_id", userId),
    supabase
      .from("evidence_items")
      .select("id,title,notes,file_path,status,created_at")
      .eq("owner_id", userId),
    supabase
      .from("program_enrollments")
      .select("id,program_id,started_at")
      .eq("owner_id", userId)
      .order("started_at", { ascending: false }),
    supabase.from("progress_events").select("id").eq("owner_id", userId).eq("event_type", "lesson_completed"),
    supabase
      .from("progress_events")
      .select("id,label,created_at,metadata")
      .eq("owner_id", userId)
      .eq("event_type", "daily_check_in")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const taskRows = tasks.data ?? [];
  const evidenceRows = (evidence.data ?? []) as EvidenceItem[];
  const activeEnrollment = enrollments.data?.[0] ?? null;
  const latestCheckIn = checkIns.data?.[0] ?? null;
  const dailyHomeEvidence = buildDailyHomeEvidenceStatus(evidenceRows, getDateKey());

  return {
    taskCount: taskRows.length,
    completedTaskCount: taskRows.filter((task) => task.status === "completed").length,
    evidenceCount: evidenceRows.length,
    dailyHomeEvidenceComplete: dailyHomeEvidence.complete,
    enrollmentCount: enrollments.data?.length ?? 0,
    completedLessonCount: lessons.data?.length ?? 0,
    activeProgramId: activeEnrollment?.program_id ?? null,
    activeProgramTitle: activeEnrollment?.program_id ? getProgramTitle(activeEnrollment.program_id) : null,
    latestCheckInAt: latestCheckIn?.created_at ?? null,
    setupPending: Boolean(tasks.error || evidence.error || enrollments.error || lessons.error || checkIns.error),
  };
}

export async function getReportSummary(userId: string): Promise<ReportSummary> {
  if (isDemoUser(userId)) {
    return {
      tasks: demoState.tasks,
      evidence: demoState.evidence,
      reflections: demoState.reflections,
      dailyHomeEvidence: demoState.evidence.filter(isDailyHomeEvidence),
      dailyHomeEvidenceHistory: await getDailyHomeEvidenceHistory(userId),
      enrollments: demoState.enrollments,
      events: demoState.events,
      profile: demoState.profile,
    };
  }

  const [tasks, evidence, reflections, enrollments, events, profile, dailyHomeEvidenceHistory] = await Promise.all([
    supabase
      .from("user_tasks")
      .select("id,title,description,status,completed_at,due_at,priority,related_lesson_id,evidence_required,category")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(REPORT_SUMMARY_TASK_LIMIT),
    supabase
      .from("evidence_items")
      .select("id,title,notes,file_path,status,created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(REPORT_SUMMARY_EVIDENCE_LIMIT),
    supabase
      .from("program_reflections")
      .select("id,program_id,program_title,reflection_type,month_number,month_topic,week_number,week_in_month,day_number,lesson_title,prompt,response,metadata,created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(REPORT_SUMMARY_REFLECTION_LIMIT),
    supabase
      .from("program_enrollments")
      .select("id,program_id,status,started_at,completed_at")
      .eq("owner_id", userId)
      .order("started_at", { ascending: false })
      .limit(REPORT_SUMMARY_ENROLLMENT_LIMIT),
    supabase
      .from("progress_events")
      .select("id,event_type,label,metadata,created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("profiles")
      .select("id,email,display_name,role,story_goal,strengths,support_notes")
      .eq("id", userId)
      .maybeSingle(),
    getDailyHomeEvidenceHistory(userId),
  ]);

  return {
    tasks: (tasks.data ?? []) as SafeStepsTask[],
    evidence: (evidence.data ?? []) as EvidenceItem[],
    reflections: (reflections.data ?? []) as ProgramReflection[],
    dailyHomeEvidence: ((evidence.data ?? []) as EvidenceItem[]).filter(isDailyHomeEvidence),
    dailyHomeEvidenceHistory,
    enrollments: (enrollments.data ?? []) as ProgramEnrollment[],
    events: (events.data ?? []) as ProgressEvent[],
    profile: (profile.data ?? null) as SafeStepsProfile | null,
  };
}

export function getProgramTitle(programId: string) {
  return fallbackPrograms.find((program) => program.id === programId)?.title ?? programId;
}

export async function getCompletedLessonIds(userId: string) {
  if (isDemoUser(userId)) {
    return new Set(
      demoState.events
        .filter((event) => event.event_type === "lesson_completed")
        .map((event) => event.metadata?.lessonId)
        .filter((lessonId): lessonId is string => Boolean(lessonId)),
    );
  }

  const { data, error } = await supabase
    .from("progress_events")
    .select("metadata")
    .eq("owner_id", userId)
    .eq("event_type", "lesson_completed");

  if (error) return new Set<string>();

  return new Set(
    (data ?? [])
      .map((event) => {
        const metadata = event.metadata as { lessonId?: string } | null;
        return metadata?.lessonId;
      })
      .filter((lessonId): lessonId is string => Boolean(lessonId)),
  );
}

export async function completeLesson(userId: string, lessonId: string, title: string) {
  if (isDemoUser(userId)) {
    if (!demoState.events.some((event) => event.event_type === "lesson_completed" && event.metadata?.lessonId === lessonId)) {
      addDemoEvent("lesson_completed", title, { lessonId });
    }
    return;
  }

  const completedLessonIds = await getCompletedLessonIds(userId);

  if (completedLessonIds.has(lessonId)) return;

  const { error } = await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "lesson_completed",
    label: title,
    metadata: { lessonId },
  });

  if (error) throw error;
}

export async function completeInteractiveVideoLesson(
  userId: string,
  title: string,
  metadata: Record<string, unknown>,
) {
  const lessonId = typeof metadata.lessonId === "string" ? metadata.lessonId : null;

  if (isDemoUser(userId)) {
    if (lessonId && !demoState.events.some((event) => event.event_type === "lesson_completed" && event.metadata?.lessonId === lessonId)) {
      addDemoEvent("lesson_completed", title, { lessonId, source: "interactive_video_lesson" });
    }
    addDemoEvent("interactive_video_lesson_completed", title, metadata);
    return;
  }

  const completedLessonIds = lessonId ? await getCompletedLessonIds(userId) : new Set<string>();
  const rows = [
    {
      owner_id: userId,
      event_type: "interactive_video_lesson_completed",
      label: title,
      metadata,
    },
    ...(lessonId && !completedLessonIds.has(lessonId)
      ? [
          {
            owner_id: userId,
            event_type: "lesson_completed",
            label: title,
            metadata: { lessonId, source: "interactive_video_lesson" },
          },
        ]
      : []),
  ];

  const { error } = await supabase.from("progress_events").insert(rows);

  if (error) throw error;
}

export async function startProgramWeek(userId: string, programId: string, week: ProgramWeekPlan) {
  if (isDemoUser(userId)) {
    addDemoEvent("program_week_started", `${getProgramTitle(programId)} ${week.title}`, {
      programId,
      weekNumber: week.weekNumber,
    });
    return;
  }

  const { error } = await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "program_week_started",
    label: `${getProgramTitle(programId)} ${week.title}`,
    metadata: { programId, weekNumber: week.weekNumber },
  });

  if (error) throw error;
}

export async function startProgramWeekWithBulkAdds(userId: string, programId: string, week: ProgramWeekPlan) {
  const bulkPlan = getProgramWeekBulkPlan(programId, week.weekNumber);

  await startProgramWeek(userId, programId, week);

  if (!bulkPlan) return { taskCount: 0, evidenceCount: 0 };

  const [taskResult, evidenceResult] = await Promise.all([
    bulkAddTasks(userId, bulkPlan.tasks),
    bulkAddEvidenceNotes(userId, bulkPlan.evidence),
  ]);

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "program_week_bulk_added",
    label: `${getProgramTitle(programId)} ${week.title} bulk plan added`,
    metadata: {
      programId,
      weekNumber: week.weekNumber,
      taskCount: taskResult.addedCount,
      evidenceCount: evidenceResult.addedCount,
      skippedTaskCount: taskResult.skippedCount,
      skippedEvidenceCount: evidenceResult.skippedCount,
    },
  });

  return {
    taskCount: taskResult.addedCount,
    evidenceCount: evidenceResult.addedCount,
    skippedTaskCount: taskResult.skippedCount,
    skippedEvidenceCount: evidenceResult.skippedCount,
  };
}

export async function saveDailyCheckIn(userId: string, input: DailyCheckInInput) {
  const moodLabel = {
    steady: "steady",
    stressed: "stressed",
    overwhelmed: "overwhelmed",
  }[input.mood];

  const safetyLabel = {
    safe: "feeling safe",
    watching: "watching warning signs",
    unsafe: "needs support",
  }[input.safety];

  if (isDemoUser(userId)) {
    addDemoEvent("daily_check_in", `Daily check-in: ${moodLabel}, ${safetyLabel}`, {
      mood: input.mood,
      safety: input.safety,
      note: input.note.trim(),
    });
    return;
  }

  const { error } = await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "daily_check_in",
    label: `Daily check-in: ${moodLabel}, ${safetyLabel}`,
    metadata: {
      mood: input.mood,
      safety: input.safety,
      note: input.note.trim(),
    },
  });

  if (error) throw error;
}

export async function getProgressCheckAssessment(): Promise<AssessmentDefinition | null> {
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id,name,description")
    .eq("id", SAFESTEPS_PROGRESS_CHECK_ASSESSMENT_ID)
    .maybeSingle();

  if (assessmentError || !assessment) return null;

  const { data: questions, error: questionsError } = await supabase
    .from("assessment_questions")
    .select("id,assessment_id,question_number,question_text,question_type")
    .eq("assessment_id", assessment.id)
    .order("question_number");

  if (questionsError) return null;

  return {
    ...assessment,
    questions: (questions ?? []) as AssessmentQuestion[],
  };
}

export async function getIntakeAssessment(): Promise<AssessmentDefinition> {
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id,name,description")
    .eq("id", SAFESTEPS_INTAKE_ASSESSMENT_ID)
    .maybeSingle();

  if (assessmentError || !assessment) {
    return {
      id: SAFESTEPS_INTAKE_ASSESSMENT_ID,
      name: "SafeSteps Intake Assessment",
      description: "Pre-entry baseline assessment. This must be completed before any program can be started.",
      questions: intakeAssessmentQuestions,
    };
  }

  const { data: questions, error: questionsError } = await supabase
    .from("assessment_questions")
    .select("id,assessment_id,question_number,question_text,question_type")
    .eq("assessment_id", assessment.id)
    .order("question_number");

  return {
    ...assessment,
    questions: questionsError || !questions?.length ? intakeAssessmentQuestions : (questions as AssessmentQuestion[]),
  };
}

export async function getAssessmentResponses(userId: string, assessmentId: string) {
  if (isDemoUser(userId)) {
    return demoState.events
      .filter((event) => event.event_type === "assessment_submitted" && event.metadata?.assessmentId === assessmentId)
      .map((event) => ({
        id: event.id,
        assessment_id: assessmentId,
        responses: event.metadata ?? {},
        created_at: event.created_at,
      })) as AssessmentResponse[];
  }

  const { data, error } = await supabase
    .from("assessment_responses")
    .select("id,assessment_id,responses,created_at")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: false });

  if (error) return [];

  return data as AssessmentResponse[];
}

export async function hasCompletedIntakeAssessment(userId: string) {
  if (isDemoUser(userId)) {
    return demoState.events.some(
      (event) => event.event_type === "assessment_submitted" && event.metadata?.assessmentId === SAFESTEPS_INTAKE_ASSESSMENT_ID,
    );
  }

  const { data, error } = await supabase
    .from("assessment_responses")
    .select("id")
    .eq("user_id", userId)
    .eq("assessment_id", SAFESTEPS_INTAKE_ASSESSMENT_ID)
    .limit(1);

  if (error) return false;

  return (data ?? []).length > 0;
}

export async function submitAssessmentResponse(
  userId: string,
  assessment: AssessmentDefinition,
  responses: Record<string, number>,
) {
  const score = Object.values(responses).reduce((sum, value) => sum + value, 0);
  const maxScore = assessment.questions.length * 5;

  const { error } = await supabase.from("assessment_responses").insert({
    assessment_id: assessment.id,
    user_id: userId,
    responses: {
      answers: responses,
      score,
      maxScore,
    },
  });

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "assessment_submitted",
    label: `${assessment.name}: ${score}/${maxScore}`,
  });

  return { score, maxScore };
}

export async function submitIntakeAssessmentResponse(
  userId: string,
  responses: Record<string, string>,
) {
  const assessment = await getIntakeAssessment();
  const missingQuestion = assessment.questions.find((question) => !responses[question.id]?.trim());

  if (missingQuestion) {
    throw new Error("Complete every intake section before starting a program.");
  }

  const completedSections = assessment.questions.length;

  if (isDemoUser(userId)) {
    addDemoEvent("assessment_submitted", "SafeSteps Intake Assessment completed", {
      assessmentId: assessment.id,
      assessmentName: assessment.name,
      completedSections,
      responses,
      intakeComplete: true,
    });
    return { completedSections };
  }

  const { error } = await supabase.from("assessment_responses").insert({
    assessment_id: assessment.id,
    user_id: userId,
    responses: {
      assessmentType: "intake",
      completedSections,
      answers: responses,
      intakeComplete: true,
    },
  });

  if (error) throw error;

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "assessment_submitted",
    label: "SafeSteps Intake Assessment completed",
    metadata: {
      assessmentId: assessment.id,
      assessmentName: assessment.name,
      completedSections,
      intakeComplete: true,
    },
  });

  return { completedSections };
}
