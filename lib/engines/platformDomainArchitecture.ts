export type SafeStepsPlatformDomainId =
  | "identity_access"
  | "case_program_management"
  | "learning_platform"
  | "assessment_platform"
  | "evidence_platform"
  | "competency_platform"
  | "decision_support"
  | "reporting_analytics";

export type SafeStepsSharedServiceId =
  | "notifications"
  | "ai_services"
  | "file_storage"
  | "search"
  | "audit_logging"
  | "translation"
  | "accessibility"
  | "scheduling";

export type SafeStepsPlatformEventType =
  | "lesson_completed"
  | "assessment_created"
  | "evidence_stored"
  | "competency_updated"
  | "dashboard_refreshed"
  | "progress_report_updated";

export type SafeStepsUniversalIdType =
  | "person_id"
  | "case_id"
  | "program_id"
  | "lesson_id"
  | "activity_id"
  | "assessment_id"
  | "evidence_id"
  | "competency_id"
  | "review_id"
  | "report_id";

export type SafeStepsVersionedArtifactType =
  | "lesson_version"
  | "assessment_version"
  | "competency_definition_version"
  | "scoring_rule_version"
  | "report_template_version"
  | "ai_prompt_version"
  | "recommendation_rule_version";

export type SafeStepsPlatformDomain = {
  id: SafeStepsPlatformDomainId;
  name: string;
  responsibility: string;
  owns: string[];
  consumesEvents: SafeStepsPlatformEventType[];
  publishesEvents: SafeStepsPlatformEventType[];
  mustNot: string[];
};

export type SafeStepsSharedService = {
  id: SafeStepsSharedServiceId;
  name: string;
  usedBy: SafeStepsPlatformDomainId[];
};

export type SafeStepsPlatformEvent = {
  type: SafeStepsPlatformEventType;
  publishedBy: SafeStepsPlatformDomainId;
  consumedBy: SafeStepsPlatformDomainId[];
  auditPurpose: string;
};

export type SafeStepsImplementationBlueprint = {
  id: string;
  title: string;
  produces: string[];
  domainIds: SafeStepsPlatformDomainId[];
};

export const platformDomains: SafeStepsPlatformDomain[] = [
  {
    id: "identity_access",
    name: "Identity & Access",
    responsibility: "Owns identity, authentication, role, permission, consent, preference, and audit identity records.",
    owns: [
      "User accounts",
      "Authentication",
      "Roles",
      "Permissions",
      "Consent",
      "Privacy settings",
      "Accessibility preferences",
      "Language preferences",
      "Cultural preferences",
      "Audit identity",
    ],
    consumesEvents: [],
    publishesEvents: [],
    mustNot: ["Duplicate program, evidence, competency, or report data."],
  },
  {
    id: "case_program_management",
    name: "Programs & Case Management",
    responsibility: "Manages participation, enrolment, goals, milestones, timelines, reviews, and tasks.",
    owns: ["Programs", "Courses", "Enrolments", "Case plans", "Goals", "Reviews", "Milestones", "Tasks", "Program timelines"],
    consumesEvents: ["lesson_completed", "competency_updated"],
    publishesEvents: ["assessment_created"],
    mustNot: ["Decide competency or treat participation as proof of demonstrated skill."],
  },
  {
    id: "learning_platform",
    name: "Learning Platform",
    responsibility: "Delivers lessons, videos, activities, quizzes, practice exercises, pathways, and certificates.",
    owns: ["Lessons", "Videos", "Reading", "Activities", "Quizzes", "Practice exercises", "Certificates", "Learning pathways"],
    consumesEvents: [],
    publishesEvents: ["lesson_completed"],
    mustNot: ["Publish final conclusions about competency."],
  },
  {
    id: "assessment_platform",
    name: "Assessment Platform",
    responsibility: "Runs assessments, scenarios, simulations, adaptive testing, scoring rules, and competency mapping.",
    owns: ["Assessment templates", "Assessment sessions", "Question banks", "Scenario engines", "Simulation engines", "Adaptive testing", "Scoring rules", "Competency mapping"],
    consumesEvents: ["lesson_completed", "assessment_created"],
    publishesEvents: ["evidence_stored"],
    mustNot: ["Store evidence as its permanent source of truth or publish final conclusions."],
  },
  {
    id: "evidence_platform",
    name: "Evidence Platform",
    responsibility: "Stores, indexes, versions, secures, and exposes evidence records without interpreting them.",
    owns: ["Quiz result", "Reflection", "Worker observation", "Video", "Audio", "Daily log", "Child feedback", "Teacher feedback", "Home visit", "Uploaded documents", "AI conversation summary"],
    consumesEvents: ["evidence_stored"],
    publishesEvents: ["competency_updated"],
    mustNot: ["Interpret evidence or overwrite immutable evidence history."],
  },
  {
    id: "competency_platform",
    name: "Competency Platform",
    responsibility: "Consumes evidence and updates competency profiles, sufficiency, trends, and confidence estimates.",
    owns: ["Competencies", "Capabilities", "Behaviour indicators", "Progression levels", "Confidence estimates", "Evidence sufficiency", "Growth trends"],
    consumesEvents: ["evidence_stored", "competency_updated"],
    publishesEvents: ["competency_updated", "dashboard_refreshed"],
    mustNot: ["Redefine competencies inside courses or hide evidence gaps."],
  },
  {
    id: "decision_support",
    name: "Decision Support",
    responsibility: "Supports human reviewers by explaining evidence, contradictions, gaps, confidence, and next assessments.",
    owns: ["Evidence summaries", "Contradiction highlights", "Missing evidence prompts", "Confidence explanations", "Additional assessment suggestions", "Learning activity recommendations"],
    consumesEvents: ["competency_updated", "evidence_stored"],
    publishesEvents: ["dashboard_refreshed", "progress_report_updated"],
    mustNot: ["Replace professional judgment or make unattributed significant decisions."],
  },
  {
    id: "reporting_analytics",
    name: "Reporting & Analytics",
    responsibility: "Produces dashboards, reports, longitudinal views, quality metrics, exports, and analytics from other domains.",
    owns: ["Dashboards", "Parent reports", "Worker reports", "Program reports", "Trend analysis", "Longitudinal views", "Quality metrics", "Exported reports"],
    consumesEvents: ["dashboard_refreshed", "progress_report_updated", "competency_updated"],
    publishesEvents: [],
    mustNot: ["Modify source evidence, assessment, competency, or case records."],
  },
];

export const sharedServices: SafeStepsSharedService[] = [
  { id: "notifications", name: "Notifications", usedBy: platformDomains.map((domain) => domain.id) },
  { id: "ai_services", name: "AI Services", usedBy: ["learning_platform", "assessment_platform", "decision_support"] },
  { id: "file_storage", name: "File Storage", usedBy: ["evidence_platform", "learning_platform"] },
  { id: "search", name: "Search", usedBy: platformDomains.map((domain) => domain.id) },
  { id: "audit_logging", name: "Audit Logging", usedBy: platformDomains.map((domain) => domain.id) },
  { id: "translation", name: "Translation", usedBy: ["learning_platform", "reporting_analytics"] },
  { id: "accessibility", name: "Accessibility", usedBy: platformDomains.map((domain) => domain.id) },
  { id: "scheduling", name: "Scheduling", usedBy: ["case_program_management", "assessment_platform"] },
];

export const platformEventCatalogue: SafeStepsPlatformEvent[] = [
  {
    type: "lesson_completed",
    publishedBy: "learning_platform",
    consumedBy: ["case_program_management", "assessment_platform"],
    auditPurpose: "Records that learning progress occurred without treating it as competency proof.",
  },
  {
    type: "assessment_created",
    publishedBy: "case_program_management",
    consumedBy: ["assessment_platform"],
    auditPurpose: "Starts a reviewable assessment session from a case or program need.",
  },
  {
    type: "evidence_stored",
    publishedBy: "assessment_platform",
    consumedBy: ["evidence_platform", "competency_platform", "decision_support"],
    auditPurpose: "Moves assessment output into immutable evidence storage and downstream review.",
  },
  {
    type: "competency_updated",
    publishedBy: "competency_platform",
    consumedBy: ["case_program_management", "decision_support", "reporting_analytics"],
    auditPurpose: "Records profile updates derived from evidence and confidence calculations.",
  },
  {
    type: "dashboard_refreshed",
    publishedBy: "decision_support",
    consumedBy: ["reporting_analytics"],
    auditPurpose: "Signals that reviewer-facing summaries can be refreshed from current evidence.",
  },
  {
    type: "progress_report_updated",
    publishedBy: "decision_support",
    consumedBy: ["reporting_analytics"],
    auditPurpose: "Signals that report drafts can consume updated reasoning and recommendations.",
  },
];

export const universalIdTypes: SafeStepsUniversalIdType[] = [
  "person_id",
  "case_id",
  "program_id",
  "lesson_id",
  "activity_id",
  "assessment_id",
  "evidence_id",
  "competency_id",
  "review_id",
  "report_id",
];

export const versionedArtifactTypes: SafeStepsVersionedArtifactType[] = [
  "lesson_version",
  "assessment_version",
  "competency_definition_version",
  "scoring_rule_version",
  "report_template_version",
  "ai_prompt_version",
  "recommendation_rule_version",
];

export const platformPrinciples = [
  "Single source of truth for each type of data.",
  "Evidence is immutable; corrections create new versions rather than overwriting history.",
  "Conclusions are explainable and link back to supporting evidence.",
  "Competencies are stable while courses and lessons may change.",
  "Learning and competency remain separate.",
  "Important decisions remain reviewable and attributable to authorised people.",
] as const;

export const implementationBlueprints: SafeStepsImplementationBlueprint[] = [
  {
    id: "database_schema",
    title: "Complete database schema",
    produces: ["tables", "relationships", "constraints", "versioning", "audit history"],
    domainIds: platformDomains.map((domain) => domain.id),
  },
  {
    id: "domain_api_specifications",
    title: "API specification for each domain",
    produces: ["commands", "queries", "events", "permissions", "error contracts"],
    domainIds: platformDomains.map((domain) => domain.id),
  },
  {
    id: "event_catalogue",
    title: "Event catalogue",
    produces: ["event names", "payloads", "publishers", "consumers", "audit purpose"],
    domainIds: platformDomains.map((domain) => domain.id),
  },
  {
    id: "competency_framework",
    title: "Competency framework",
    produces: ["definitions", "capabilities", "behaviour indicators", "growth levels", "thresholds"],
    domainIds: ["competency_platform", "assessment_platform", "decision_support"],
  },
  {
    id: "assessment_library",
    title: "Reusable assessment library",
    produces: ["templates", "question banks", "scenario engines", "scoring rules", "competency mappings"],
    domainIds: ["assessment_platform", "competency_platform"],
  },
  {
    id: "evidence_schemas",
    title: "Evidence schemas for every evidence type",
    produces: ["evidence metadata", "attachments", "permissions", "review history", "retention rules"],
    domainIds: ["evidence_platform", "decision_support", "reporting_analytics"],
  },
  {
    id: "state_machines",
    title: "State machines",
    produces: ["lesson states", "assessment states", "review states", "program states"],
    domainIds: ["learning_platform", "assessment_platform", "case_program_management"],
  },
  {
    id: "permission_workflows",
    title: "Permission and workflow models",
    produces: ["parent permissions", "child privacy controls", "worker workflows", "supervisor approvals", "administrator controls"],
    domainIds: ["identity_access", "case_program_management", "evidence_platform", "reporting_analytics"],
  },
];

export function getDomainById(domainId: SafeStepsPlatformDomainId) {
  return platformDomains.find((domain) => domain.id === domainId);
}

export function getDomainEventFlow() {
  return platformEventCatalogue.map((event) => ({
    eventType: event.type,
    from: event.publishedBy,
    to: event.consumedBy,
  }));
}

export function validateDomainBoundary({
  domainId,
  attemptedOwnership,
}: {
  domainId: SafeStepsPlatformDomainId;
  attemptedOwnership: string;
}) {
  const domain = getDomainById(domainId);
  if (!domain) return { allowed: false, reason: "Unknown domain." };

  const normalized = attemptedOwnership.toLowerCase();
  const owns = domain.owns.some((item) => item.toLowerCase() === normalized);
  if (owns) return { allowed: true, reason: `${domain.name} owns ${attemptedOwnership}.` };

  return {
    allowed: false,
    reason: `${domain.name} should not own ${attemptedOwnership}; use stable IDs and route changes through the owning domain.`,
  };
}

export function listSharedServicesForDomain(domainId: SafeStepsPlatformDomainId) {
  return sharedServices.filter((service) => service.usedBy.includes(domainId));
}

export function getRequiredVersionedArtifactsForAssessment() {
  return versionedArtifactTypes.filter((artifact) =>
    [
      "lesson_version",
      "assessment_version",
      "competency_definition_version",
      "scoring_rule_version",
      "report_template_version",
      "ai_prompt_version",
      "recommendation_rule_version",
    ].includes(artifact),
  );
}
