const PROHIBITED_METADATA_KEYS = new Set([
  "body",
  "message_text",
  "assessment_answers",
  "answers",
  "notes",
  "file_content",
  "transcript",
  "transcript_text",
  "response",
  "responses",
]);

export function sanitizeAuditMetadata(input: Record<string, unknown> = {}): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (PROHIBITED_METADATA_KEYS.has(key.toLowerCase())) continue;
    if (value === null || typeof value === "boolean" || typeof value === "number") {
      output[key] = value;
      continue;
    }
    if (typeof value === "string") {
      output[key] = value.slice(0, 250);
      continue;
    }
    if (Array.isArray(value)) {
      output[key] = value
        .filter((item) => ["string", "number", "boolean"].includes(typeof item))
        .slice(0, 20)
        .map((item) => (typeof item === "string" ? item.slice(0, 100) : item));
    }
  }

  return output;
}
