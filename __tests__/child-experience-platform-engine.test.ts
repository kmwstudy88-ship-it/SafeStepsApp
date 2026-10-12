import {
  childExperiencePlatform,
  evaluateChildLessonCompletion,
  evaluateChildSharingReadiness,
  evaluateChildSupportRequestClosure,
  getChildExperienceReadinessSummary,
} from "../lib/engines/childExperiencePlatformEngine";

describe("childExperiencePlatformEngine", () => {
  it("tracks Volume 20 as implemented", () => {
    expect(getChildExperienceReadinessSummary()).toMatchObject({
      implemented: 1,
      total: 1,
      readyForRuntimeIntegration: true,
    });
    expect(childExperiencePlatform.modules).toEqual(
      expect.arrayContaining([
        "child_accounts",
        "privacy_profiles",
        "dashboard",
        "feelings",
        "support_requests",
        "safe_people",
        "my_story",
        "wishes_and_views",
        "visit_preparation",
        "visit_reflection",
        "child_learning",
        "games",
        "journals",
        "controlled_sharing",
        "complaints",
        "advocacy",
      ]),
    );
  });

  it("surfaces the production tables and runtime gates", () => {
    expect(childExperiencePlatform.tables.length).toBeGreaterThanOrEqual(40);
    expect(childExperiencePlatform.tables).toEqual(
      expect.arrayContaining([
        "child_accounts",
        "child_privacy_profiles",
        "child_support_requests",
        "child_storybooks",
        "child_storybook_pages",
        "child_wishes_views",
        "child_lesson_sessions",
        "child_daily_tasks",
        "child_journals",
        "child_content_sharing_requests",
        "child_experience_safety_signals",
        "child_complaints",
        "child_advocacy_requests",
      ]),
    );
    expect(childExperiencePlatform.runtimeGates).toEqual(
      expect.arrayContaining([
        "Child content sharing requires child approval unless a confirmed safety override applies.",
        "AI must not independently decide whether a child is truthful.",
      ]),
    );
  });

  it("blocks parent access when child privacy blocks it and no safety override applies", () => {
    const result = evaluateChildSharingReadiness({
      childApproved: false,
      parentAccessBlocked: true,
      safetyOverrideRequested: false,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Parent access is blocked by the child privacy profile.",
        "Child-controlled sharing requires child approval.",
      ]),
    );
  });

  it("requires child-friendly closure and human review for urgent child requests", () => {
    const result = evaluateChildSupportRequestClosure({
      hasChildFriendlyResponse: true,
      responseExplainsNextStep: false,
      childUnderstandingChecked: false,
      urgentRequest: true,
      humanReviewCompleted: false,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Response must explain the next step or outcome.",
        "Child understanding should be checked before closure.",
        "Urgent child requests require completed human review.",
      ]),
    );
  });

  it("allows lesson completion without grading emotional answers when participation and safety gates are met", () => {
    expect(
      evaluateChildLessonCompletion({
        activeTimeSeconds: 120,
        safetyConcernDetected: true,
        safetyConcernReviewed: true,
      }),
    ).toMatchObject({ ready: true, blockers: [] });
  });
});
