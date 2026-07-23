export type BlueprintLayer =
  | "assessment_design"
  | "assessment_delivery"
  | "evidence_generation"
  | "competency_evaluation";

export type BlueprintPhaseId =
  | "assessment_fundamentals"
  | "scoring"
  | "competencies"
  | "evidence"
  | "claims_reporting";

export type BlueprintTableName =
  | "assessment_templates"
  | "assessment_sections"
  | "assessment_items"
  | "assessment_options"
  | "assessment_assignments"
  | "assessment_sessions"
  | "assessment_responses"
  | "scoring_rules"
  | "assessment_rubrics"
  | "rubric_criteria"
  | "rubric_levels"
  | "competencies"
  | "capabilities"
  | "behaviour_indicators"
  | "evidence_items"
  | "evidence_competency_links"
  | "observations"
  | "observation_indicator_ratings"
  | "findings"
  | "claims"
  | "claim_evidence_links"
  | "competency_profiles"
  | "competency_profile_history"
  | "assessment_reviews"
  | "evidence_reviews"
  | "review_disagreements"
  | "item_statistics"
  | "assessment_quality_flags"
  | "audit_events"
  | "content_versions";

export type BlueprintField = {
  name: string;
  type: string;
  purpose: string;
};

export type BlueprintTable = {
  name: BlueprintTableName;
  layer: BlueprintLayer | "scoring" | "framework" | "observation" | "claims" | "quality" | "audit";
  purpose: string;
  fields: BlueprintField[];
  immutable?: boolean;
  versioned?: boolean;
};

export type BlueprintBuildPhase = {
  id: BlueprintPhaseId;
  title: string;
  tables: BlueprintTableName[];
  builds: string[];
};

export type BlueprintAssessmentFlowStep = {
  step: number;
  level: string;
  activity: string;
  prompt: string;
  generatedEvidenceType: string;
};

export type BlueprintGeneratedResult = {
  knowledge: string;
  understanding: string;
  scenarioApplication: string;
  practicalDemonstration: string;
  reflection: string;
  realLifeApplication: string;
  retention: string;
  overallCompetency: string;
  confidence: string;
  additionalEvidenceRecommended: string[];
};

export const assessmentSystemLayers: { id: BlueprintLayer; label: string; purpose: string }[] = [
  {
    id: "assessment_design",
    label: "Assessment Design",
    purpose: "Defines reusable assessments, sections, items, options, scoring rules, and rubrics before delivery.",
  },
  {
    id: "assessment_delivery",
    label: "Assessment Delivery",
    purpose: "Tracks assignments, attempts, sessions, responses, scores, timing, and review status.",
  },
  {
    id: "evidence_generation",
    label: "Evidence Generation",
    purpose: "Converts assessment outputs, observations, uploads, and logs into structured evidence records.",
  },
  {
    id: "competency_evaluation",
    label: "Competency Evaluation",
    purpose: "Links evidence to capabilities, findings, claims, profiles, history, reviews, quality, and reports.",
  },
];

export const blueprintTables: BlueprintTable[] = [
  {
    name: "assessment_templates",
    layer: "assessment_design",
    purpose: "Stores reusable assessment definitions.",
    versioned: true,
    fields: [
      field("id", "uuid", "Assessment identifier"),
      field("title", "text", "Assessment name"),
      field("description", "text", "What it measures"),
      field("assessment_type", "text", "Quiz, scenario, observation, reflection, or other type"),
      field("target_role", "text", "Parent, child, worker, or reviewer role"),
      field("difficulty", "text", "Beginner, intermediate, or advanced"),
      field("estimated_minutes", "integer", "Expected duration"),
      field("scoring_method", "text", "Automatic, rubric, or human review"),
      field("version", "integer", "Assessment version"),
      field("status", "text", "Draft, published, or archived"),
      field("created_at", "timestamp", "Creation date"),
    ],
  },
  table("assessment_sections", "assessment_design", "Groups assessment items into ordered sections.", [
    field("id", "uuid", "Section identifier"),
    field("assessment_template_id", "uuid", "Parent assessment template"),
    field("title", "text", "Section title"),
    field("description", "text", "Section description"),
    field("section_order", "integer", "Display and scoring order"),
    field("required", "boolean", "Whether section completion is required"),
    field("scoring_weight", "numeric", "Section weighting"),
  ]),
  {
    name: "assessment_items",
    layer: "assessment_design",
    purpose: "Stores each question, task, prompt, scenario, or evidence request.",
    versioned: true,
    fields: [
      field("id", "uuid", "Item identifier"),
      field("assessment_section_id", "uuid", "Parent assessment section"),
      field("item_type", "text", "single_choice, scenario, sequencing, reflection, confidence_scale, observation, practical_task, evidence_upload, and related types"),
      field("prompt", "text", "Question or activity prompt"),
      field("instructions", "text", "Completion instructions"),
      field("difficulty", "text", "Item difficulty"),
      field("required", "boolean", "Whether response is required"),
      field("points_available", "numeric", "Maximum points"),
      field("item_order", "integer", "Item order"),
      field("competency_id", "uuid", "Mapped competency"),
      field("capability_id", "uuid", "Mapped capability"),
      field("version", "integer", "Item version"),
    ],
  },
  table("assessment_options", "assessment_design", "Stores selectable answers and branching targets.", [
    field("id", "uuid", "Option identifier"),
    field("assessment_item_id", "uuid", "Parent assessment item"),
    field("option_text", "text", "Visible option text"),
    field("option_order", "integer", "Option order"),
    field("is_correct", "boolean", "Whether option is correct when applicable"),
    field("score_value", "numeric", "Score value"),
    field("feedback", "text", "Feedback text"),
    field("branch_to_item_id", "uuid", "Optional branching scenario target"),
  ]),
  table("assessment_assignments", "assessment_delivery", "Stores which assessment has been assigned to whom.", [
    field("id", "uuid", "Assignment identifier"),
    field("assessment_template_id", "uuid", "Assessment template"),
    field("assigned_to_user_id", "uuid", "Assigned participant"),
    field("assigned_by_user_id", "uuid", "Assigning user"),
    field("case_id", "uuid", "Linked case"),
    field("program_id", "uuid", "Linked program"),
    field("due_date", "timestamp", "Due date"),
    field("status", "text", "assigned, available, started, submitted, under_review, completed, expired, cancelled"),
    field("attempt_limit", "integer", "Maximum attempts"),
  ]),
  table("assessment_sessions", "assessment_delivery", "Stores each assessment attempt.", [
    field("id", "uuid", "Session identifier"),
    field("assessment_assignment_id", "uuid", "Assignment"),
    field("user_id", "uuid", "Participant"),
    field("attempt_number", "integer", "Attempt number"),
    field("started_at", "timestamp", "Started time"),
    field("submitted_at", "timestamp", "Submitted time"),
    field("completed_at", "timestamp", "Completed time"),
    field("raw_score", "numeric", "Raw score"),
    field("percentage_score", "numeric", "Percentage score"),
    field("result_status", "text", "Result status"),
    field("time_spent_seconds", "integer", "Time spent"),
  ]),
  table("assessment_responses", "assessment_delivery", "Stores each response and confidence rating.", [
    field("id", "uuid", "Response identifier"),
    field("assessment_session_id", "uuid", "Assessment session"),
    field("assessment_item_id", "uuid", "Assessment item"),
    field("text_response", "text", "Free-text response"),
    field("numeric_response", "numeric", "Numeric response"),
    field("boolean_response", "boolean", "Boolean response"),
    field("selected_option_ids", "uuid[]", "Selected options"),
    field("confidence_rating", "numeric", "Participant confidence"),
    field("response_time_seconds", "integer", "Response time"),
    field("auto_score", "numeric", "Automatic score"),
    field("reviewer_score", "numeric", "Reviewer score"),
    field("final_score", "numeric", "Final score"),
    field("submitted_at", "timestamp", "Submission time"),
  ]),
  table("scoring_rules", "scoring", "Defines automatic and review scoring rules.", [
    field("id", "uuid", "Rule identifier"),
    field("assessment_item_id", "uuid", "Assessment item"),
    field("rule_type", "text", "Rule type"),
    field("rule_config", "jsonb", "Structured scoring configuration"),
    field("maximum_score", "numeric", "Maximum score"),
    field("minimum_score", "numeric", "Minimum score"),
    field("requires_review", "boolean", "Whether human review is required"),
  ]),
  table("assessment_rubrics", "scoring", "Defines rubrics for open answers, video, observation, and demonstrations.", [
    field("id", "uuid", "Rubric identifier"),
    field("title", "text", "Rubric title"),
    field("description", "text", "Rubric description"),
    field("competency_id", "uuid", "Linked competency"),
    field("maximum_score", "numeric", "Maximum score"),
    field("version", "integer", "Rubric version"),
  ], false, true),
  table("rubric_criteria", "scoring", "Stores weighted rubric criteria.", [
    field("id", "uuid", "Criterion identifier"),
    field("rubric_id", "uuid", "Rubric"),
    field("criterion_name", "text", "Criterion name"),
    field("criterion_description", "text", "Criterion description"),
    field("weighting", "numeric", "Criterion weighting"),
    field("criterion_order", "integer", "Criterion order"),
  ]),
  table("rubric_levels", "scoring", "Stores level descriptions from not demonstrated to advanced.", [
    field("id", "uuid", "Level identifier"),
    field("rubric_criterion_id", "uuid", "Rubric criterion"),
    field("level", "integer", "0 to 5"),
    field("meaning", "text", "Level meaning"),
    field("description", "text", "Criterion-specific level description"),
  ]),
  table("competencies", "framework", "Stores stable competency definitions.", [
    field("id", "uuid", "Competency identifier"),
    field("name", "text", "Competency name"),
    field("description", "text", "Competency description"),
    field("domain", "text", "Competency domain"),
    field("version", "integer", "Definition version"),
    field("active", "boolean", "Whether active"),
  ], false, true),
  table("capabilities", "framework", "Divides competencies into smaller skills.", [
    field("id", "uuid", "Capability identifier"),
    field("competency_id", "uuid", "Parent competency"),
    field("name", "text", "Capability name"),
    field("description", "text", "Capability description"),
    field("capability_order", "integer", "Order"),
  ]),
  table("behaviour_indicators", "framework", "Defines observable evidence indicators.", [
    field("id", "uuid", "Indicator identifier"),
    field("capability_id", "uuid", "Parent capability"),
    field("indicator_text", "text", "Observable behaviour"),
    field("context", "text", "Context"),
    field("evidence_strength", "text", "Expected evidence strength"),
    field("observable", "boolean", "Whether directly observable"),
  ]),
  table("evidence_items", "evidence_generation", "Stores every generated or uploaded evidence record.", [
    field("id", "uuid", "Evidence identifier"),
    field("person_id", "uuid", "Subject person"),
    field("case_id", "uuid", "Linked case"),
    field("evidence_type", "text", "quiz_result, reflection, observation, photo, video, document, log, simulation, practical_demonstration, and related types"),
    field("source_type", "text", "Source category"),
    field("source_id", "uuid", "Source object"),
    field("title", "text", "Evidence title"),
    field("description", "text", "Evidence description"),
    field("occurred_at", "timestamp", "When it happened"),
    field("submitted_at", "timestamp", "When submitted"),
    field("context", "text", "Context"),
    field("reliability_rating", "numeric", "Reliability"),
    field("relevance_rating", "numeric", "Relevance"),
    field("authenticity_status", "text", "Authenticity"),
    field("review_status", "text", "Review status"),
    field("visibility_level", "text", "Visibility"),
  ], false, true),
  table("evidence_competency_links", "evidence_generation", "Links one evidence item to one or more competencies.", [
    field("id", "uuid", "Link identifier"),
    field("evidence_item_id", "uuid", "Evidence item"),
    field("competency_id", "uuid", "Competency"),
    field("capability_id", "uuid", "Capability"),
    field("relationship", "text", "supports, challenges, neutral, or requires_context"),
    field("strength", "numeric", "Evidence strength"),
    field("confidence", "numeric", "Confidence"),
  ]),
  table("observations", "observation", "Describes what happened before interpretation.", [
    field("id", "uuid", "Observation identifier"),
    field("evidence_item_id", "uuid", "Evidence item"),
    field("observer_user_id", "uuid", "Observer"),
    field("observed_person_id", "uuid", "Observed person"),
    field("observation_text", "text", "Descriptive observation"),
    field("setting", "text", "Setting"),
    field("observation_method", "text", "Observation method"),
    field("started_at", "timestamp", "Start"),
    field("ended_at", "timestamp", "End"),
    field("structured", "boolean", "Whether structured"),
  ]),
  table("observation_indicator_ratings", "observation", "Rates observations against behaviour indicators.", [
    field("id", "uuid", "Rating identifier"),
    field("observation_id", "uuid", "Observation"),
    field("behaviour_indicator_id", "uuid", "Behaviour indicator"),
    field("rating", "numeric", "Rating"),
    field("notes", "text", "Notes"),
    field("confidence", "numeric", "Confidence"),
  ]),
  table("findings", "claims", "Groups related observations into descriptive findings.", [
    field("id", "uuid", "Finding identifier"),
    field("person_id", "uuid", "Person"),
    field("competency_id", "uuid", "Competency"),
    field("finding_text", "text", "Finding text"),
    field("period_start", "timestamp", "Period start"),
    field("period_end", "timestamp", "Period end"),
    field("evidence_count", "integer", "Evidence count"),
    field("confidence", "numeric", "Confidence"),
    field("status", "text", "Finding status"),
  ]),
  table("claims", "claims", "Stores testable competency claims.", [
    field("id", "uuid", "Claim identifier"),
    field("person_id", "uuid", "Person"),
    field("competency_id", "uuid", "Competency"),
    field("claim_text", "text", "Claim text"),
    field("scope", "text", "Claim scope"),
    field("status", "text", "proposed, supported, partially_supported, challenged, insufficient_evidence, under_review, superseded"),
    field("confidence", "numeric", "Confidence"),
    field("evidence_sufficiency", "text", "Evidence sufficiency"),
    field("generated_by", "text", "Generator"),
    field("reviewed_by", "uuid", "Reviewer"),
    field("reviewed_at", "timestamp", "Review time"),
  ], false, true),
  table("claim_evidence_links", "claims", "Links claims to supporting or challenging evidence.", [
    field("id", "uuid", "Link identifier"),
    field("claim_id", "uuid", "Claim"),
    field("evidence_item_id", "uuid", "Evidence"),
    field("relationship", "text", "Evidence relationship"),
    field("weight", "numeric", "Evidence weight"),
    field("reviewer_notes", "text", "Reviewer notes"),
  ]),
  table("competency_profiles", "competency_evaluation", "Stores a person's current competency position.", [
    field("id", "uuid", "Profile identifier"),
    field("person_id", "uuid", "Person"),
    field("competency_id", "uuid", "Competency"),
    field("current_level", "integer", "0 not assessed through 7 mastery"),
    field("knowledge_score", "numeric", "Knowledge score"),
    field("understanding_score", "numeric", "Understanding score"),
    field("application_score", "numeric", "Application score"),
    field("behaviour_score", "numeric", "Behaviour score"),
    field("consistency_score", "numeric", "Consistency score"),
    field("mastery_score", "numeric", "Mastery score"),
    field("confidence", "numeric", "Confidence"),
    field("evidence_sufficiency", "text", "Evidence sufficiency"),
    field("last_calculated_at", "timestamp", "Calculation time"),
  ]),
  {
    name: "competency_profile_history",
    layer: "competency_evaluation",
    purpose: "Preserves competency history without overwriting prior calculations.",
    immutable: true,
    fields: [
      field("id", "uuid", "History identifier"),
      field("competency_profile_id", "uuid", "Competency profile"),
      field("previous_level", "integer", "Previous level"),
      field("new_level", "integer", "New level"),
      field("confidence", "numeric", "Confidence"),
      field("calculation_version", "text", "Calculation version"),
      field("reason", "text", "Calculation reason"),
      field("calculated_at", "timestamp", "Calculation time"),
    ],
  },
  table("assessment_reviews", "competency_evaluation", "Stores human review of assessment sessions.", [
    field("id", "uuid", "Review identifier"),
    field("assessment_session_id", "uuid", "Assessment session"),
    field("reviewer_user_id", "uuid", "Reviewer"),
    field("review_status", "text", "Review status"),
    field("review_summary", "text", "Review summary"),
    field("total_score", "numeric", "Total score"),
    field("completed_at", "timestamp", "Completion time"),
  ]),
  table("evidence_reviews", "competency_evaluation", "Stores human review of evidence reliability and relevance.", [
    field("id", "uuid", "Evidence review identifier"),
    field("evidence_item_id", "uuid", "Evidence item"),
    field("reviewer_user_id", "uuid", "Reviewer"),
    field("decision", "text", "Decision"),
    field("reliability_rating", "numeric", "Reliability"),
    field("relevance_rating", "numeric", "Relevance"),
    field("notes", "text", "Notes"),
    field("reviewed_at", "timestamp", "Review time"),
  ]),
  table("review_disagreements", "competency_evaluation", "Allows authorised disagreement without deleting original records.", [
    field("id", "uuid", "Disagreement identifier"),
    field("review_id", "uuid", "Review"),
    field("raised_by_user_id", "uuid", "Person raising disagreement"),
    field("disagreement_reason", "text", "Reason"),
    field("supporting_information", "text", "Supporting information"),
    field("resolution_status", "text", "Resolution status"),
    field("resolved_by_user_id", "uuid", "Resolver"),
    field("resolution_notes", "text", "Resolution notes"),
  ], false, true),
  table("item_statistics", "quality", "Stores anonymous item performance and calibration data.", [
    field("assessment_item_id", "uuid", "Assessment item"),
    field("attempts", "integer", "Attempt count"),
    field("correct_rate", "numeric", "Correct rate"),
    field("average_score", "numeric", "Average score"),
    field("average_response_time", "numeric", "Average response time"),
    field("difficulty_index", "numeric", "Difficulty index"),
    field("discrimination_index", "numeric", "Discrimination index"),
    field("skip_rate", "numeric", "Skip rate"),
    field("last_calculated_at", "timestamp", "Calculation time"),
  ]),
  table("assessment_quality_flags", "quality", "Flags questions for discrimination, ambiguity, bias, accessibility, and answer-key review.", [
    field("id", "uuid", "Flag identifier"),
    field("assessment_item_id", "uuid", "Assessment item"),
    field("flag_type", "text", "poor_discrimination, high_skip_rate, ambiguous_wording, possible_bias, incorrect_answer_key, translation_problem, accessibility_problem, excessive_time_required"),
    field("severity", "text", "Flag severity"),
    field("description", "text", "Description"),
    field("status", "text", "Status"),
    field("reviewed_by", "uuid", "Reviewer"),
    field("resolved_at", "timestamp", "Resolution time"),
  ]),
  {
    name: "audit_events",
    layer: "audit",
    purpose: "Stores immutable audit events for important changes.",
    immutable: true,
    fields: [
      field("id", "uuid", "Audit event identifier"),
      field("actor_user_id", "uuid", "Actor"),
      field("action", "text", "Action"),
      field("entity_type", "text", "Entity type"),
      field("entity_id", "uuid", "Entity identifier"),
      field("previous_value", "jsonb", "Previous value"),
      field("new_value", "jsonb", "New value"),
      field("reason", "text", "Reason"),
      field("created_at", "timestamp", "Creation time"),
    ],
  },
  {
    name: "content_versions",
    layer: "audit",
    purpose: "Stores snapshots for anything that influences assessment.",
    immutable: true,
    fields: [
      field("id", "uuid", "Content version identifier"),
      field("entity_type", "text", "Entity type"),
      field("entity_id", "uuid", "Entity identifier"),
      field("version_number", "integer", "Version number"),
      field("content_snapshot", "jsonb", "Content snapshot"),
      field("created_by", "uuid", "Creator"),
      field("created_at", "timestamp", "Creation time"),
      field("change_reason", "text", "Change reason"),
    ],
  },
];

export const buildPhases: BlueprintBuildPhase[] = [
  {
    id: "assessment_fundamentals",
    title: "Phase 1 - Assessment Fundamentals",
    tables: [
      "assessment_templates",
      "assessment_sections",
      "assessment_items",
      "assessment_options",
      "assessment_assignments",
      "assessment_sessions",
      "assessment_responses",
    ],
    builds: ["Reusable assessment design", "Assignments", "Attempts", "Responses"],
  },
  {
    id: "scoring",
    title: "Phase 2 - Scoring",
    tables: ["scoring_rules", "assessment_rubrics", "rubric_criteria", "rubric_levels", "assessment_reviews"],
    builds: ["Automatic scoring", "Rubric scoring", "Reviewer scoring", "Confidence ratings", "Assessment results"],
  },
  {
    id: "competencies",
    title: "Phase 3 - Competencies",
    tables: ["competencies", "capabilities", "behaviour_indicators", "competency_profiles", "competency_profile_history"],
    builds: ["Competency framework", "Capability model", "Behaviour indicators", "Assessment-to-competency mapping", "Profile history"],
  },
  {
    id: "evidence",
    title: "Phase 4 - Evidence",
    tables: ["evidence_items", "evidence_competency_links", "observations", "observation_indicator_ratings", "evidence_reviews"],
    builds: ["Evidence records", "File attachments", "Evidence-to-competency links", "Evidence review", "Visibility permissions"],
  },
  {
    id: "claims_reporting",
    title: "Phase 5 - Claims and Reporting",
    tables: ["findings", "claims", "claim_evidence_links", "review_disagreements", "item_statistics", "assessment_quality_flags", "audit_events", "content_versions"],
    builds: ["Findings", "Claims", "Supporting and challenging evidence", "Evidence sufficiency", "Reports", "Disagreement process"],
  },
];

export const exampleAssessmentFlow: BlueprintAssessmentFlowStep[] = [
  {
    step: 1,
    level: "Knowledge",
    activity: "Multiple-choice question",
    prompt: "Which response is most likely to help a distressed child feel safe?",
    generatedEvidenceType: "quiz_result",
  },
  {
    step: 2,
    level: "Understanding",
    activity: "Short answer",
    prompt: "Explain why naming a child's emotion can help.",
    generatedEvidenceType: "short_answer",
  },
  {
    step: 3,
    level: "Application",
    activity: "Scenario",
    prompt: "Your child begins yelling after being told screen time is finished. What would you do first?",
    generatedEvidenceType: "scenario_result",
  },
  {
    step: 4,
    level: "Demonstration",
    activity: "Voice or video response",
    prompt: "Demonstrate how you would acknowledge the feeling and maintain the boundary.",
    generatedEvidenceType: "practical_demonstration",
  },
  {
    step: 5,
    level: "Reflection",
    activity: "Reflection",
    prompt: "Which part of this response would be hardest for you during a stressful moment?",
    generatedEvidenceType: "reflection",
  },
  {
    step: 6,
    level: "Home Practice",
    activity: "Home practice",
    prompt: "Complete one emotion-coaching interaction and record what happened.",
    generatedEvidenceType: "home_activity",
  },
  {
    step: 7,
    level: "Follow-Up",
    activity: "Seven-day follow-up",
    prompt: "Were you able to use the strategy again? What changed?",
    generatedEvidenceType: "retention_check",
  },
];

export const exampleGeneratedResult: BlueprintGeneratedResult = {
  knowledge: "Proficient",
  understanding: "Developing",
  scenarioApplication: "Proficient",
  practicalDemonstration: "Developing",
  reflection: "Strong",
  realLifeApplication: "Insufficient evidence",
  retention: "Not yet assessed",
  overallCompetency: "Developing",
  confidence: "Moderate",
  additionalEvidenceRecommended: ["One practical activity", "One follow-up assessment"],
};

export function getTablesForPhase(phaseId: BlueprintPhaseId) {
  const phase = buildPhases.find((item) => item.id === phaseId);
  if (!phase) return [];
  return blueprintTables.filter((tableItem) => phase.tables.includes(tableItem.name));
}

export function getTablesByLayer(layer: BlueprintTable["layer"]) {
  return blueprintTables.filter((tableItem) => tableItem.layer === layer);
}

export function findBlueprintTable(name: BlueprintTableName) {
  return blueprintTables.find((tableItem) => tableItem.name === name);
}

export function validateBlueprintCoverage() {
  const phaseTableNames = new Set(buildPhases.flatMap((phase) => phase.tables));
  const missingFromPhases = blueprintTables
    .filter((tableItem) => !phaseTableNames.has(tableItem.name))
    .map((tableItem) => tableItem.name);
  const unknownPhaseTables = buildPhases
    .flatMap((phase) => phase.tables)
    .filter((name) => !blueprintTables.some((tableItem) => tableItem.name === name));

  return {
    tableCount: blueprintTables.length,
    phaseCount: buildPhases.length,
    missingFromPhases,
    unknownPhaseTables,
    complete: missingFromPhases.length === 0 && unknownPhaseTables.length === 0,
  };
}

function field(name: string, type: string, purpose: string): BlueprintField {
  return { name, type, purpose };
}

function table(
  name: BlueprintTableName,
  layer: BlueprintTable["layer"],
  purpose: string,
  fields: BlueprintField[],
  versioned = false,
  immutable = false,
): BlueprintTable {
  return { name, layer, purpose, fields, versioned, immutable };
}
