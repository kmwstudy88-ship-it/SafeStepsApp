import { sanitizeAuditMetadata } from "../lib/security/auditMetadata";

describe("sensitive audit metadata", () => {
  test("removes sensitive content fields", () => {
    expect(sanitizeAuditMetadata({
      message_text: "child message",
      answers: { one: "private" },
      transcript_text: "session transcript",
      notes: "private notes",
      status: "accepted",
      format: "pdf",
    })).toEqual({ status: "accepted", format: "pdf" });
  });

  test("caps strings and primitive arrays", () => {
    const result = sanitizeAuditMetadata({
      label: "x".repeat(500),
      flags: Array.from({ length: 30 }, (_, index) => `flag-${index}`),
      nested: { private: true },
    });

    expect(String(result.label)).toHaveLength(250);
    expect(result.flags).toHaveLength(20);
    expect(result.nested).toBeUndefined();
  });
});
