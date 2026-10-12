import { supabase } from "../supabase";
import { getOptionalUserId, getSignedInUserId } from "../authSession";
import type { CertificateType } from "./types";

export type CertificateRecord = {
  id: string;
  user_id: string;
  enrolment_id: string | null;
  course_id: string | null;
  program_id: string | null;
  certificate_type: CertificateType;
  level_title: string;
  certificate_number: string;
  issued_at: string;
};

export function findMatchingCertificate(
  certificates: CertificateRecord[],
  certificateType: CertificateType,
  levelTitle: string,
  scope: {
    enrolmentId?: string | null;
    courseId?: string | null;
    programId?: string | null;
  } = {},
) {
  return certificates.find(
    (certificate) =>
      certificate.certificate_type === certificateType &&
      certificate.level_title.trim().toLowerCase() === levelTitle.trim().toLowerCase() &&
      (scope.enrolmentId === undefined || certificate.enrolment_id === scope.enrolmentId) &&
      (scope.courseId === undefined || certificate.course_id === scope.courseId) &&
      (scope.programId === undefined || certificate.program_id === scope.programId),
  );
}

async function currentUserId() {
  return getSignedInUserId("using certificates");
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
  await supabase.from("progress_events").insert({
    owner_id: input.userId ?? fallbackUserId,
    event_type: "certificate_issued",
    label: `Certificate issued: ${input.levelTitle}`,
    metadata: {
      certificate_id: data.id,
      certificate_number: data.certificate_number,
      certificate_type: data.certificate_type,
      course_id: data.course_id,
      program_id: data.program_id,
      enrolment_id: data.enrolment_id,
      level_title: data.level_title,
    },
  });
  return data;
}

export async function listMyCertificates() {
  const userId = await getOptionalUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CertificateRecord[];
}
