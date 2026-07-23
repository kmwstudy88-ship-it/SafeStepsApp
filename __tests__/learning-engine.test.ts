import {
  evaluateLearningCompletion,
  getLearningEngineReadinessSummary,
  learningEngineVolumes,
} from "../lib/engines/learningEngine";

describe("learningEngine", () => {
  it("tracks Volume 16 as the implemented learning platform foundation", () => {
    const summary = getLearningEngineReadinessSummary();

    expect(summary).toMatchObject({
      implemented: 1,
      total: 1,
      readyForRuntimeIntegration: true,
    });
    expect(summary.moduleCount).toBeGreaterThanOrEqual(20);
    expect(summary.tableCount).toBeGreaterThanOrEqual(80);
  });

  it("surfaces the Volume 16 learning modules and production tables", () => {
    const volume = learningEngineVolumes.find((item) => item.id === "parenting_child_development_learning");

    expect(volume?.modules).toEqual(
      expect.arrayContaining([
        "lesson_framework",
        "course_framework",
        "learning_catalogues",
        "learning_categories",
        "modules",
        "learning_weeks",
        "lesson_screens",
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
      ]),
    );

    expect(volume?.tables).toEqual(
      expect.arrayContaining([
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
        "learning_knowledge_checks",
        "learning_scenarios",
        "learning_lesson_scenarios",
        "learning_quizzes",
        "learning_quiz_questions",
        "learning_reflection_prompts",
        "learning_evidence_tasks",
        "learning_lesson_evidence_tasks",
        "learning_enrolments",
        "learning_lesson_attempts",
        "learning_activity_responses",
        "learning_reflection_responses",
        "learning_quiz_attempts",
        "learning_evidence_submissions",
        "learning_evidence_reviews",
        "learning_competency_progress",
        "learning_interactive_activities",
        "learning_challenge_templates",
        "learning_challenge_assignments",
        "learning_weekly_missions",
        "learning_monthly_programs",
        "learning_paths",
        "learning_recommendations",
        "learning_progression_rules",
        "learning_course_progress",
        "learning_program_progress",
        "learning_reflection_journals",
        "learning_video_lessons",
        "learning_videos",
        "learning_video_segments",
        "learning_storybooks",
        "learning_family_activities",
        "learning_badges",
        "learning_streaks",
        "learning_certificate_requirements",
        "learning_certificates",
        "learning_personalisation_profiles",
        "learning_journals",
        "learning_journal_entries",
        "learning_assignments",
        "learning_review_notes",
        "learning_cultural_profiles",
        "learning_content_adaptations",
        "learning_accessibility_profiles",
        "learning_lesson_quality_reviews",
        "learning_safety_reviews",
        "learning_audit_events",
      ]),
    );

    expect(volume?.runtimeGates).toEqual(
      expect.arrayContaining([
        "Lesson publication requires lesson screens and a publishable quality review.",
        "Lesson completion requires active learning time, required activities, quizzes, reflections, evidence tasks, and worker review when configured.",
        "Course and certificate completion require structured progress records rather than screen views alone.",
      ]),
    );
  });

  it("blocks completion when evidence, reflection, safety, or human-review requirements are missing", () => {
    const result = evaluateLearningCompletion({
      evidenceRequired: true,
      evidenceUploaded: false,
      reflectionRequired: true,
      reflectionSubmitted: false,
      safetyReviewRequired: true,
      safetyReviewCleared: false,
      humanReviewRequired: true,
      humanReviewCompleted: false,
    });

    expect(result.complete).toBe(false);
    expect(result.requiredAction).toBe("hold_completion");
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Required learning evidence has not been uploaded.",
        "Required reflection journal response is missing.",
        "Required safety review has not cleared.",
        "Required human review has not been completed.",
      ]),
    );
  });

  it("allows completion when all configured gates are satisfied", () => {
    expect(
      evaluateLearningCompletion({
        evidenceRequired: true,
        evidenceUploaded: true,
        reflectionRequired: true,
        reflectionSubmitted: true,
        safetyReviewRequired: true,
        safetyReviewCleared: true,
      }),
    ).toEqual({
      complete: true,
      blockers: [],
      requiredAction: "record_completion",
    });
  });
});
