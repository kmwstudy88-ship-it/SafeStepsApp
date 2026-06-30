import { supabase } from "../supabase";
import { assertCanCreateFacilitatorNote, assertCanManageContent } from "./permissions";
import type { AppRole, LessonRecord } from "./types";

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("You must be signed in.");
  return data.user.id;
}

function firstRole(roles: Array<{ role: AppRole }>): AppRole {
  if (roles.some((item) => item.role === "admin")) return "admin";
  if (roles.some((item) => item.role === "facilitator")) return "facilitator";
  if (roles.some((item) => item.role === "caseworker")) return "caseworker";
  if (roles.some((item) => item.role === "court_viewer")) return "court_viewer";
  return "parent";
}

export async function getMyRole(programId?: string | null): Promise<AppRole> {
  const userId = await currentUserId();
  let query = supabase.from("user_roles").select("role").eq("user_id", userId);
  if (programId) query = query.or(`program_id.eq.${programId},program_id.is.null`);
  const { data, error } = await query;
  if (error) throw error;
  return firstRole((data ?? []) as Array<{ role: AppRole }>);
}

export async function listPrograms() {
  const { data, error } = await supabase.from("programs").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listCourses(programId?: string) {
  let query = supabase.from("courses").select("*").order("created_at", { ascending: false });
  if (programId) query = query.eq("program_id", programId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function listLessons(courseId?: string) {
  let query = supabase.from("lessons").select("*").order("day_number", { ascending: true });
  if (courseId) query = query.eq("course_id", courseId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LessonRecord[];
}

export async function getLesson(lessonId: string) {
  const { data, error } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
  if (error) throw error;
  return data as LessonRecord;
}

export async function listResources() {
  const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyEnrolments() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("enrolments")
    .select("*, programs(title), courses(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveProgram(input: { id?: string; title: string; description?: string; riskLevel?: string; durationWeeks?: number; status?: string }) {
  const role = await getMyRole();
  assertCanManageContent(role);
  const userId = await currentUserId();
  const payload = {
    title: input.title,
    description: input.description ?? null,
    risk_level: input.riskLevel ?? "custom",
    duration_weeks: input.durationWeeks ?? 12,
    status: input.status ?? "draft",
    created_by: userId,
  };

  const request = input.id
    ? supabase.from("programs").update(payload).eq("id", input.id).select("*").single()
    : supabase.from("programs").insert(payload).select("*").single();
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export async function saveCourse(input: { id?: string; programId?: string; title: string; description?: string; standalone?: boolean; status?: string }) {
  const role = await getMyRole(input.programId);
  assertCanManageContent(role);
  const userId = await currentUserId();
  const payload = {
    program_id: input.programId || null,
    title: input.title,
    description: input.description ?? null,
    standalone: input.standalone ?? false,
    status: input.status ?? "draft",
    created_by: userId,
  };

  const request = input.id
    ? supabase.from("courses").update(payload).eq("id", input.id).select("*").single()
    : supabase.from("courses").insert(payload).select("*").single();
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export async function saveLesson(input: {
  id?: string;
  courseId?: string;
  title: string;
  dayNumber?: number;
  summary?: string;
  contentMarkdown?: string;
  checkpoint?: unknown;
  scenario?: unknown;
  practice?: unknown;
  estimatedMinutes?: number;
  status?: string;
}) {
  const role = await getMyRole();
  assertCanManageContent(role);
  const userId = await currentUserId();
  const payload = {
    course_id: input.courseId || null,
    title: input.title,
    day_number: input.dayNumber ?? 1,
    summary: input.summary ?? null,
    content_markdown: input.contentMarkdown ?? null,
    checkpoint: input.checkpoint ?? {},
    scenario: input.scenario ?? {},
    practice: input.practice ?? {},
    estimated_minutes: input.estimatedMinutes ?? 20,
    status: input.status ?? "draft",
    created_by: userId,
  };

  const request = input.id
    ? supabase.from("lessons").update(payload).eq("id", input.id).select("*").single()
    : supabase.from("lessons").insert(payload).select("*").single();
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export async function saveResource(input: {
  id?: string;
  programId?: string;
  courseId?: string;
  title: string;
  description?: string;
  resourceType?: string;
  url?: string;
  bodyMarkdown?: string;
  status?: string;
}) {
  const role = await getMyRole(input.programId);
  assertCanManageContent(role);
  const userId = await currentUserId();
  const payload = {
    program_id: input.programId || null,
    course_id: input.courseId || null,
    title: input.title,
    description: input.description ?? null,
    resource_type: input.resourceType ?? "article",
    url: input.url ?? null,
    body_markdown: input.bodyMarkdown ?? null,
    status: input.status ?? "draft",
    created_by: userId,
  };

  const request = input.id
    ? supabase.from("resources").update(payload).eq("id", input.id).select("*").single()
    : supabase.from("resources").insert(payload).select("*").single();
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export async function saveReflection(input: {
  enrolmentId?: string | null;
  lessonId?: string | null;
  phase: "start" | "end" | "review" | "standalone";
  prompt: string;
  answer: string;
  privateToParticipant?: boolean;
}) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("reflections")
    .insert({
      user_id: userId,
      enrolment_id: input.enrolmentId ?? null,
      lesson_id: input.lessonId ?? null,
      phase: input.phase,
      prompt: input.prompt,
      answer: input.answer,
      private_to_participant: input.privateToParticipant ?? false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function saveFacilitatorNote(input: {
  programId?: string | null;
  enrolmentId?: string | null;
  learnerId: string;
  note: string;
  noteType?: string;
  visibility?: "private_facilitator" | "shared_with_parent" | "admin_only";
}) {
  const role = await getMyRole(input.programId);
  assertCanCreateFacilitatorNote(role);
  const authorId = await currentUserId();
  const { data, error } = await supabase
    .from("facilitator_notes")
    .insert({
      program_id: input.programId ?? null,
      enrolment_id: input.enrolmentId ?? null,
      learner_id: input.learnerId,
      author_id: authorId,
      note: input.note,
      note_type: input.noteType ?? "general",
      visibility: input.visibility ?? "private_facilitator",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}