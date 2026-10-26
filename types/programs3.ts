// types/program3.ts

export type ProgramId = 'back_on_track';

export interface Program {
  id: ProgramId;
  name: string;
  description: string;
  durationWeeks: number;
  modules: ProgramModuleMeta[];
}

export interface ProgramModuleMeta {
  id: string; // e.g. 'module_1'
  title: string;
  order: number;
  weeks: number[];
}

export interface LessonMeta {
  id: string; // 'back_on_track_day_1'
  programId: ProgramId;
  moduleId: string;
  weekNumber: number;
  dayNumber: number;
  globalDayIndex: number;
  title: string;
  requiresUpload: boolean;
  uploadType?: 'photo' | 'video' | 'text' | 'mixed';
  assessmentType?: 'monthly' | 'weekly_reflection';
}

export interface LessonContent extends LessonMeta {
  microLesson: RichBlock[];
  reflectionPrompt: RichBlock[];
  actionTask: RichBlock[];
  uploadRequirement?: UploadRequirement;
  caseworkerNoteTemplate?: string;
}

export type RichBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'info'; text: string };

export interface UploadRequirement {
  enabled: boolean;
  type: 'photo' | 'video' | 'text' | 'mixed';
  instructions: string;
}

export interface UserLessonProgress {
  userId: string;
  programId: ProgramId;
  lessonId: string;
  completedAt: number | null;
  reflectionAnswer?: string;
  actionNotes?: string;
  uploadId?: string;
  flags?: {
    riskConcern?: boolean;
    needsFollowUp?: boolean;
  };
}
