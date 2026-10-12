import { findMatchingCertificate, type CertificateRecord } from "../lib/platform/certificates";

const certificate: CertificateRecord = {
  id: "certificate-1",
  user_id: "user-1",
  enrolment_id: null,
  course_id: null,
  program_id: null,
  certificate_type: "standalone_course",
  level_title: "SafeSteps completion record",
  certificate_number: "SAFE-20260630000000-ABCDE",
  issued_at: "2026-06-30T00:00:00.000Z",
};

describe("certificate helpers", () => {
  test("finds an existing completion certificate without case sensitivity", () => {
    expect(
      findMatchingCertificate(
        [certificate],
        "standalone_course",
        "safesteps completion record",
      ),
    ).toBe(certificate);
  });

  test("does not match another certificate type", () => {
    expect(findMatchingCertificate([certificate], "program_completion", certificate.level_title)).toBeUndefined();
  });

  test("can match within a specific course scope", () => {
    const courseCertificate = { ...certificate, course_id: "course-1" };

    expect(
      findMatchingCertificate(
        [courseCertificate],
        "standalone_course",
        certificate.level_title,
        { courseId: "course-1" },
      ),
    ).toBe(courseCertificate);
    expect(
      findMatchingCertificate(
        [courseCertificate],
        "standalone_course",
        certificate.level_title,
        { courseId: "course-2" },
      ),
    ).toBeUndefined();
  });
});
