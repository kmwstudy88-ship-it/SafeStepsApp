export type AppRole = "parent" | "facilitator" | "admin" | "caseworker" | "court_viewer";

export type LessonFlowStep =
  | "reflection"
  | "content"
  | "checkpoint"
  | "scenario"
  | "practice"
  | "end_reflection";

export type EnrolmentState = "invited" | "active" | "paused" | "completed" | "withdrawn";
export type LessonProgressStatus = "locked" | "unlocked" | "in_progress" | "completed";
export type ReviewType = "baseline" | "month_review" | "final_review";
export type CertificateType = "standalone_course" | "program_level" | "program_completion";

export type CheckpointBlock = {
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  definitionGate?: Record<string, unknown>;
  progressionRules?: Record<string, unknown>;
  fullQuiz?: ProductionQuiz;
};

export type ScenarioBlock = {
  title?: string;
  situation?: string;
  question?: string;
  options?: string[];
  saferChoice?: string;
  explanation?: string;
  modelResponse?: string;
  completionRule?: string;
};

export type PracticeBlock = {
  title?: string;
  instruction?: string;
  example?: string;
  evidenceOptions?: string[];
  privacyReminder?: string;
};

export type ProductionPostVideoInteraction = {
  Type?: string;
  Prompt?: string;
  MinimumCharacters?: number;
  MinimumVoiceSeconds?: number;
};

export type ProductionLessonVideo = {
  VideoId?: string;
  Title?: string;
  EstimatedDuration?: string;
  Mandatory?: boolean;
  MinimumWatchPercent?: number;
  Purpose?: string;
  VisualDirection?: string;
  NarrationScript?: string;
  OnScreenText?: string[];
  CaptionsRequired?: boolean;
  TranscriptIncluded?: boolean;
  AudioDescriptionRequired?: boolean;
  PostVideoInteraction?: ProductionPostVideoInteraction;
  ProductionNotes?: string[];
  AssetStatus?: string;
  VideoUrl?: string;
  MediaUrl?: string;
  Url?: string;
};

export type ProductionKnowledgeCheck = {
  Prompt?: string;
  Options?: string[];
  CorrectAnswer?: string;
  CorrectAnswers?: string[];
  Feedback?: string;
  Explanation?: string;
};

export type ProductionTeachingSection = {
  SectionId?: string;
  Title?: string;
  EstimatedMinutes?: number;
  Content?: string;
  KeyTakeaways?: string[];
  KnowledgeCheck?: ProductionKnowledgeCheck;
};

export type ProductionActivityItem = {
  Field?: string;
  Component?: string;
  Prompt?: string;
};

export type ProductionActivity = {
  ActivityId?: string;
  Title?: string;
  Type?: string;
  EstimatedMinutes?: number;
  Instructions?: string;
  Items?: ProductionActivityItem[];
  ModelGuidance?: string;
  CompletionRule?: string;
};

export type ProductionCaseStudy = {
  Title?: string;
  Scenario?: string;
  LearnerQuestions?: string[];
  ModelResponse?: string;
  CompletionRule?: string;
};

export type ProductionHomePracticeTask = {
  TaskId?: string;
  Title?: string;
  Duration?: string;
  Instructions?: string[];
  EvidenceOptions?: string[];
  SuccessCriteria?: string[];
  PrivacyReminder?: string;
};

export type ProductionRubricCriterion = {
  Criterion?: string;
  WeightPercent?: number;
  HighStandard?: string;
};

export type ProductionFormalAssessment = {
  AssessmentId?: string;
  Title?: string;
  FormatOptions?: string[];
  Prompt?: string;
  Rubric?: ProductionRubricCriterion[];
  PassPercent?: number;
  CriticalFailConditions?: string[];
  AssessorFlags?: string[];
};

export type ProductionQuizQuestion = {
  QuestionId?: string;
  Type?: string;
  Prompt?: string;
  Options?: string[];
  CorrectAnswer?: string;
  CorrectAnswers?: string[];
  Explanation?: string;
  Objective?: string;
  Points?: number;
  CriticalSafetyQuestion?: boolean;
};

export type ProductionQuiz = {
  QuizId?: string;
  Title?: string;
  PassPercent?: number;
  RandomiseQuestions?: boolean;
  RandomiseOptions?: boolean;
  Questions?: ProductionQuizQuestion[];
  FeedbackByScore?: Record<string, string>;
};

export type ProductionFinalReflection = {
  Prompt?: string;
  MinimumCharacters?: number;
  AllowVoiceResponse?: boolean;
  MinimumVoiceSeconds?: number;
  CompletionMessage?: string;
};

export type ProductionDefinitionGate = {
  ScreenTitle?: string;
  Prompt?: string;
  WhyItMatters?: string;
  MinimumCharacters?: number;
  MaximumCharacters?: number;
  AllowVoiceResponse?: boolean;
  MinimumVoiceSeconds?: number;
  ExampleShownAfterSubmission?: string;
  CompletionRequiredBeforeVideo?: boolean;
};

export type ProductionLessonContent = {
  SchemaVersion?: string;
  LessonNumber?: string;
  CourseSequence?: number;
  Title: string;
  Subtitle?: string;
  Category?: string;
  Module?: string;
  Course?: string;
  Audience?: string;
  Level?: string;
  EstimatedDuration?: string;
  ProductionStatus?: string;
  LearningObjectives?: string[];
  SafetyAndScope?: Record<string, unknown>;
  DefinitionGate?: ProductionDefinitionGate;
  ProgressionRules?: Record<string, unknown>;
  Accessibility?: Record<string, unknown>;
  Introduction?: string;
  Videos?: ProductionLessonVideo[];
  TeachingSections?: ProductionTeachingSection[];
  InteractiveActivities?: ProductionActivity[];
  CaseStudy?: ProductionCaseStudy;
  HomePracticeTask?: ProductionHomePracticeTask;
  FormalAssessment?: ProductionFormalAssessment;
  Quiz?: ProductionQuiz;
  FinalReflection?: ProductionFinalReflection;
  ScreenSequence?: string[];
  AnalyticsEvents?: string[];
  References?: string[];
};

export type ProductionLessonResponse = {
  id?: string;
  user_id?: string;
  enrolment_id?: string | null;
  lesson_id?: string;
  current_step?: string;
  completed_steps?: string[];
  response_data?: Record<string, unknown>;
  quiz_score?: number | null;
  quiz_passed?: boolean;
  assessment_status?: "not_started" | "draft" | "submitted" | "reviewed";
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LessonRecord = {
  id: string;
  course_id?: string | null;
  title: string;
  day_number: number;
  summary?: string | null;
  content_markdown?: string | null;
  checkpoint?: CheckpointBlock;
  scenario?: ScenarioBlock;
  practice?: PracticeBlock;
  estimated_minutes?: number;
  status?: string;
  content_key?: string | null;
  course_sequence?: number | null;
  global_lesson_number?: number | null;
  subtitle?: string | null;
  module?: string | null;
  level?: string | null;
  learning_objectives?: string[];
  progression_rules?: Record<string, unknown>;
  accessibility_spec?: Record<string, unknown>;
  production_content: ProductionLessonContent;
  screen_sequence?: string[];
  analytics_events?: string[];
  source_schema_version?: string | null;
  source_pack_version?: string | null;
};

export type ReviewMetrics = Record<string, number | string | boolean | null>;

export type SnapshotComparison = {
  key: string;
  baseline: number | string | boolean | null;
  latest: number | string | boolean | null;
  difference: number | null;
};
