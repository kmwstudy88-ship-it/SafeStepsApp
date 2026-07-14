import { supabase } from "../supabase";
import { getSignedInUserId } from "../authSession";
import {
  evaluateSafetyAlerts,
  type GeneratedSafetyAlert,
} from "./safetyAlertEngine";

export type CaseSessionStatus = "scheduled" | "confirmed" | "completed" | "missed" | "cancelled";

export type CaseSessionType =
  | "intake"
  | "worker_session"
  | "supervision"
  | "home_visit"
  | "contact_review"
  | "exit_review";

export type CaseSessionAgendaItem = {
  title: string;
  purpose: string;
  source: "phase" | "course" | "risk" | "evidence" | "standing";
};

export type CaseSessionRecord = {
  id: string;
  case_id: string;
  parent_user_id: string | null;
  worker_user_id: string | null;
  session_type: CaseSessionType;
  scheduled_start_at: string;
  scheduled_end_at: string | null;
  status: CaseSessionStatus;
  phase: string | null;
  course_context: string | null;
  agenda: CaseSessionAgendaItem[];
  notes: string;
  parent_confirmed_at: string | null;
  audio_consent: boolean;
  audio_file_path: string | null;
  transcript_text: string | null;
  transcript_metadata: Record<string, unknown>;
  rubric_score: number | null;
  missed_reason: string | null;
  alert_generated: boolean;
  created_at: string;
};

export type ScheduleCaseSessionInput = {
  caseId: string;
  parentUserId?: string | null;
  workerUserId?: string | null;
  sessionType?: CaseSessionType;
  scheduledStartAt: string;
  scheduledEndAt?: string | null;
  phase?: string | null;
  courseContext?: string | null;
  currentRiskBand?: "Critical" | "High" | "Moderate" | "Ready";
};

export type CompleteCaseSessionInput = {
  sessionId: string;
  notes: string;
  rubricScore?: number | null;
  transcriptText?: string | null;
  audioConsent?: boolean;
};

export function generateSessionAgenda(input: {
  phase?: string | null;
  courseContext?: string | null;
  currentRiskBand?: "Critical" | "High" | "Moderate" | "Ready";
}): CaseSessionAgendaItem[] {
  const agenda: CaseSessionAgendaItem[] = [
    {
      title: "Check safety and immediate changes",
      purpose: "Confirm current safety context, urgent changes, and any child wellbeing concerns.",
      source: "standing",
    },
    {
      title: "Review evidence since last session",
      purpose: "Look at uploaded documents, reflections, visit notes, and unresolved evidence gaps.",
      source: "evidence",
    },
  ];

  if (input.phase) {
    agenda.push({
      title: `Phase focus: ${input.phase}`,
      purpose: "Keep the session aligned to the current reunification assessment phase.",
      source: "phase",
    });
  }

  if (input.courseContext) {
    agenda.push({
      title: `Course follow-up: ${input.courseContext}`,
      purpose: "Connect learning progress to practical behaviour, reflection, and evidence.",
      source: "course",
    });
  }

  if (input.currentRiskBand === "Critical" || input.currentRiskBand === "High") {
    agenda.push({
      title: "Risk and contradiction review",
      purpose: "Review critical overrides, contradictions, missed requirements, and supervisor actions.",
      source: "risk",
    });
  }

  agenda.push({
    title: "Next actions and accountability",
    purpose: "Agree on the next tasks, evidence requests, referrals, and review date.",
    source: "standing",
  });

  return agenda;
}

export function sessionIsMissed(session: Pick<CaseSessionRecord, "scheduled_start_at" | "status">, now = new Date()) {
  if (session.status !== "scheduled" && session.status !== "confirmed") return false;
  return new Date(session.scheduled_start_at).getTime() < now.getTime();
}

export function evaluateSessionAlerts(sessions: Pick<CaseSessionRecord, "scheduled_start_at" | "status">[]): GeneratedSafetyAlert[] {
  const missedCount = sessions.filter((session) => sessionIsMissed(session)).length;
  return missedCount > 0
    ? [
        evaluateSafetyAlerts({}).find((alert) => alert.type === "missed_session") ?? {
          type: "missed_session",
          title: "Missed session",
          trigger: "Scheduled session was not completed",
          audience: ["worker", "supervisor"],
          severity: "high",
          notificationType: "session_alert",
          body: `${missedCount} scheduled session${missedCount === 1 ? " is" : "s are"} overdue or missed.`,
          metadata: { missedSessionCount: missedCount },
        },
      ].map((alert) => ({
        ...alert,
        body: `${missedCount} scheduled session${missedCount === 1 ? " is" : "s are"} overdue or missed.`,
        metadata: { missedSessionCount: missedCount },
      }))
    : [];
}

export async function scheduleCaseSession(input: ScheduleCaseSessionInput) {
  const userId = await getSignedInUserId("scheduling a session");
  const agenda = generateSessionAgenda({
    phase: input.phase,
    courseContext: input.courseContext,
    currentRiskBand: input.currentRiskBand,
  });

  const { data, error } = await supabase
    .from("case_sessions")
    .insert({
      case_id: input.caseId,
      parent_user_id: input.parentUserId ?? null,
      worker_user_id: input.workerUserId ?? userId,
      session_type: input.sessionType ?? "worker_session",
      scheduled_start_at: input.scheduledStartAt,
      scheduled_end_at: input.scheduledEndAt ?? null,
      phase: input.phase ?? null,
      course_context: input.courseContext ?? null,
      agenda,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as CaseSessionRecord;
}

export async function listCaseSessions(caseId: string) {
  const { data, error } = await supabase
    .from("case_sessions")
    .select("*")
    .eq("case_id", caseId)
    .order("scheduled_start_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CaseSessionRecord[];
}

export async function completeCaseSession(input: CompleteCaseSessionInput) {
  const { data, error } = await supabase
    .from("case_sessions")
    .update({
      status: "completed",
      notes: input.notes,
      rubric_score: input.rubricScore ?? null,
      transcript_text: input.transcriptText ?? null,
      audio_consent: input.audioConsent ?? false,
      transcript_metadata: input.transcriptText
        ? {
            source: input.audioConsent ? "consented_audio_or_manual_transcript" : "manual_notes",
            reviewed: false,
          }
        : {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .select("*")
    .single();

  if (error) throw error;
  return data as CaseSessionRecord;
}
