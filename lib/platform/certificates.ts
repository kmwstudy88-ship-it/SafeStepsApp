import { supabase } from "../supabase";
import type { CertificateType } from "./types";

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("You must be signed in.");
  return data.user.id;
}

export function makeCertificateNumber(prefix = "SAFE") {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

export async function issueCertificate(input: {
  userId?: string;
  enrolmentId?: string | null;
  courseId?: string | null;
  programId?: string | null;
  certificateType: CertificateType;
  levelTitle: string;
}) {
  const fallbackUserId = await currentUserId();
  const { data, error } = await supabase
    .from("certificates")
    .insert({
      user_id: input.userId ?? fallbackUserId,
      enrolment_id: input.enrolmentId ?? null,
      course_id: input.courseId ?? null,
      program_id: input.programId ?? null,
      certificate_type: input.certificateType,
      level_title: input.levelTitle,
      certificate_number: makeCertificateNumber(),
      created_by: fallbackUserId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listMyCertificates() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}