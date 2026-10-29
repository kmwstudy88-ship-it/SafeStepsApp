import { cacheData, getCachedData } from "../offline/offlineSyncService";

export type CertificateType = "standalone_course" | "program_level" | "program_completion";

export type CertificateRecord = {
  id: string;
  certificate_number: string;
  certificate_type: CertificateType;
  level_title: string;
  course_id?: string | null;
  program_id?: string | null;
  issued_at: string;
};

const CERTIFICATES_CACHE_KEY = "safesteps_issued_certificates";

export async function listMyCertificates(): Promise<CertificateRecord[]> {
  return (await getCachedData<CertificateRecord[]>(CERTIFICATES_CACHE_KEY)) ?? [];
}

export function findMatchingCertificate(
  certificates: CertificateRecord[],
  certificateType: CertificateType,
  levelTitle: string,
  options?: { courseId?: string | null; programId?: string | null },
): CertificateRecord | null {
  return (
    certificates.find((cert) => {
      if (cert.certificate_type !== certificateType) return false;
      if (options?.courseId && cert.course_id === options.courseId) return true;
      if (options?.programId && cert.program_id === options.programId) return true;
      return cert.level_title.toLowerCase() === levelTitle.toLowerCase();
    }) ?? null
  );
}

export async function issueCertificate(input: {
  courseId?: string | null;
  programId?: string | null;
  certificateType: CertificateType;
  levelTitle: string;
}): Promise<CertificateRecord> {
  const existing = await listMyCertificates();
  const match = findMatchingCertificate(existing, input.certificateType, input.levelTitle, {
    courseId: input.courseId,
    programId: input.programId,
  });
  if (match) return match;

  const created: CertificateRecord = {
    id: `cert_${Date.now()}`,
    certificate_number: `SS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    certificate_type: input.certificateType,
    level_title: input.levelTitle,
    course_id: input.courseId ?? null,
    program_id: input.programId ?? null,
    issued_at: new Date().toISOString(),
  };

  await cacheData(CERTIFICATES_CACHE_KEY, [created, ...existing]);
  return created;
}
