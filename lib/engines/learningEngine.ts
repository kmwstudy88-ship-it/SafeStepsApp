import { supabase } from "../supabase";

export type LearningEngineVolumeId = "parenting_child_development_learning";

export type LearningEngineStatus = "implemented" | "requires_configuration" | "requires_review";

export type LearningEngineVolume = {
  id: LearningEngineVolumeId;
  title: string;
  purpose: string;
  status: LearningEngineStatus;
  modules: string[];
  tables: string[];
  runtimeGates: string[];
};

export type LearningCompletionCheck = {
  evidenceRequired?: boolean;
  evidenceUploaded?: boolean;
  safetyReviewRequired?: boolean;
  safetyReviewCleared?: boolean;
  reflectionRequired?: boolean;
  reflectionSubmitted?: boolean;
  humanReviewRequired?: boolean;
  humanReviewCompleted?: boolean;
};

export type LearningLiveMetric = {
  label: string;
  table: string;
  count: number | null;
  available: boolean;
  error?: string;
};

export const learningEngineVolumes: LearningEngineVolume[] = [
  {
    id: "parenting_child_development_learning",
    title: "Parenting, Child Development & Learning Engine",
    purpose:
      "Provides the production learning backbone for SafeSteps lessons, courses, pathways, parent and child challenges, daily challenges, missions, monthly programs, certificates, competencies, outcomes, checks, scenarios, activities, journals, video lessons, storybooks, family activities, rewards, streaks, and AI learning personalisation.",
    status: "implemented",
    modules: [
      "lesson_framework",
      "course_framework",
      "learning_catalogues",
      "learning_categories",
      "modules",
      "learning_weeks",
      "lesson_screens",
      "content_blocks",
      "learning_pathways",
      "parent_challenges",
      "child_challenges",
      "daily_challenges",
      "weekly_missions",
      "monthly_programs",
      "certificates",
      "competencies",
      "learning_outcomes",
      "knowledge_checks",
      "scenarios",
      "interactive_activities",
      "reflection_journals",
      "video_lessons",
      "video_segments",
      "interactive_storybooks",
      "family_activities",
      "evidence_tasks",
      "worker_reviews",
      "accessibility_profiles",
      "cultural_adaptation",
      "rewards_badges",
      "streaks",
      "ai_learning_personalisation",
    ],
    tables: [
      "learning_frameworks",
      "learning_course_frameworks",
      "learning_catalogues",
      "learning_categories",
      "learning_programs",
      "learning_courses",
      "learning_program_courses",
      "learning_modules",
      "learning_course_modules",
      "learning_weeks",
      "learning_module_weeks",
      "learning_lessons",
      "learning_week_lessons",
      "learning_lesson_screens",
      "learning_content_blocks",
      "learning_screen_content_blocks",
      "learning_pathways",
      "learning_pathway_items",
      "learning_outcomes",
      "learning_competencies",
      "learning_competency_levels",
      "learning_content_outcome_links",
      "learning_knowledge_checks",
      "learning_knowledge_check_items",
      "learning_knowledge_check_attempts",
      "learning_scenarios",
      "learning_scenario_steps",
      "learning_scenario_attempts",
      "learning_lesson_scenarios",
      "learning_quizzes",
      "learning_quiz_questions",
      "learning_lesson_quizzes",
      "learning_reflection_prompts",
      "learning_lesson_reflections",
      "learning_evidence_tasks",
      "learning_lesson_evidence_tasks",
      "learning_lesson_competencies",
      "learning_enrolments",
      "learning_enrolment_goals",
      "learning_lesson_attempts",
      "learning_screen_progress",
      "learning_activity_responses",
      "learning_reflection_responses",
      "learning_quiz_attempts",
      "learning_quiz_answers",
      "learning_interactive_activities",
      "learning_activity_completions",
      "learning_challenge_templates",
      "learning_challenge_assignments",
      "learning_challenge_evidence_requirements",
      "learning_weekly_missions",
      "learning_monthly_programs",
      "learning_paths",
      "learning_recommendations",
      "learning_progression_rules",
      "learning_completion_events",
      "learning_course_progress",
      "learning_program_progress",
      "learning_reflection_journals",
      "learning_video_lessons",
      "learning_videos",
      "learning_video_segments",
      "learning_lesson_videos",
      "learning_video_progress",
      "learning_evidence_submissions",
      "learning_evidence_reviews",
      "learning_competency_progress",
      "learning_daily_challenges",
      "learning_challenge_completions",
      "learning_storybooks",
      "learning_family_activities",
      "learning_badges",
      "learning_badge_awards",
      "learning_streaks",
      "learning_certificate_requirements",
      "learning_certificate_eligibility",
      "learning_certificates",
      "learning_personalisation_profiles",
      "learning_personalisation_recommendations",
      "learning_journals",
      "learning_journal_entries",
      "learning_assignments",
      "learning_review_notes",
      "learning_cultural_profiles",
      "learning_content_adaptations",
      "learning_accessibility_profiles",
      "learning_lesson_quality_reviews",
      "learning_safety_reviews",
      "learning_progress_snapshots",
      "learning_audit_events",
    ],
    runtimeGates: [
      "Challenge completion requires mandatory evidence when the challenge template or assignment requires it.",
      "Certificate issuing requires calculated eligibility, no blockers, and supervisor review when required.",
      "AI learning personalisation is opt-in and blocked by active safety constraints or required human review.",
      "Child-facing learning records remain child-safe and privacy-mediated.",
      "Lesson publication requires lesson screens and a publishable quality review.",
      "Lesson completion requires active learning time, required activities, quizzes, reflections, evidence tasks, and worker review when configured.",
      "Course and certificate completion require structured progress records rather than screen views alone.",
    ],
  },
];

export function evaluateLearningCompletion(check: LearningCompletionCheck) {
  const blockers: string[] = [];

  if (check.evidenceRequired && !check.evidenceUploaded) {
    blockers.push("Required learning evidence has not been uploaded.");
  }

  if (check.safetyReviewRequired && !check.safetyReviewCleared) {
    blockers.push("Required safety review has not cleared.");
  }

  if (check.reflectionRequired && !check.reflectionSubmitted) {
    blockers.push("Required reflection journal response is missing.");
  }

  if (check.humanReviewRequired && !check.humanReviewCompleted) {
    blockers.push("Required human review has not been completed.");
  }

  return {
    complete: blockers.length === 0,
    blockers,
    requiredAction: blockers.length > 0 ? "hold_completion" : "record_completion",
  };
}

export function getLearningEngineReadinessSummary() {
  const implemented = learningEngineVolumes.filter((volume) => volume.status === "implemented").length;
  const tableCount = new Set(learningEngineVolumes.flatMap((volume) => volume.tables)).size;
  const moduleCount = new Set(learningEngineVolumes.flatMap((volume) => volume.modules)).size;

  return {
    implemented,
    total: learningEngineVolumes.length,
    tableCount,
    moduleCount,
    readyForRuntimeIntegration: implemented === learningEngineVolumes.length,
  };
}

const liveMetricTables: { label: string; table: string }[] = [
  { label: "Learning pathways", table: "learning_pathways" },
  { label: "Learning catalogues", table: "learning_catalogues" },
  { label: "Learning lessons", table: "learning_lessons" },
  { label: "Lesson screens", table: "learning_lesson_screens" },
  { label: "Learning outcomes", table: "learning_outcomes" },
  { label: "Knowledge checks", table: "learning_knowledge_checks" },
  { label: "Quizzes", table: "learning_quizzes" },
  { label: "Lesson attempts", table: "learning_lesson_attempts" },
  { label: "Challenge assignments", table: "learning_challenge_assignments" },
  { label: "Video lessons", table: "learning_video_lessons" },
  { label: "Evidence submissions", table: "learning_evidence_submissions" },
  { label: "Badge awards", table: "learning_badge_awards" },
  { label: "Certificate eligibility", table: "learning_certificate_eligibility" },
  { label: "Learning safety reviews", table: "learning_safety_reviews" },
];

export async function getLearningEngineLiveSummary() {
  const metrics: LearningLiveMetric[] = await Promise.all(
    liveMetricTables.map(async (metric) => {
      try {
        const { count, error } = await supabase.from(metric.table).select("id", { count: "exact", head: true });

        if (error) {
          return {
            ...metric,
            count: null,
            available: false,
            error: error.message,
          };
        }

        return {
          ...metric,
          count: count ?? 0,
          available: true,
        };
      } catch (error) {
        return {
          ...metric,
          count: null,
          available: false,
          error: error instanceof Error ? error.message : "Unable to load learning metric.",
        };
      }
    }),
  );

  return {
    loadedAt: new Date().toISOString(),
    metrics,
    unavailableCount: metrics.filter((metric) => !metric.available).length,
  };
}
