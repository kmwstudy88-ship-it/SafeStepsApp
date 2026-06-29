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
};

export type ScenarioBlock = {
  situation?: string;
  question?: string;
  options?: string[];
  saferChoice?: string;
  explanation?: string;
};

export type PracticeBlock = {
  title?: string;
  instruction?: string;
  example?: string;
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
};

export type ReviewMetrics = Record<string, number | string | boolean | null>;

export type SnapshotComparison = {
  key: string;
  baseline: number | string | boolean | null;
  latest: number | string | boolean | null;
  difference: number | null;
};