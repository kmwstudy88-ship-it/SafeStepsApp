import { type CurriculumInput } from "./curriculumTypes";

export function validateCurriculumInput(data: unknown): CurriculumInput {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid curriculum input: must be an object");
  }

  const record = data as Record<string, unknown>;
  const childAge = record.childAge;
  const riskLevel = record.riskLevel;
  const goals = record.goals;

  if (typeof childAge !== "number" || !Number.isFinite(childAge) || childAge < 0 || childAge > 25) {
    throw new Error("Invalid curriculum input: childAge must be a valid age number (0-25)");
  }

  if (typeof riskLevel !== "string" || !["low", "medium", "high"].includes(riskLevel)) {
    throw new Error("Invalid curriculum input: riskLevel must be 'low', 'medium', or 'high'");
  }

  if (!Array.isArray(goals) || !goals.every((g) => typeof g === "string")) {
    throw new Error("Invalid curriculum input: goals must be an array of strings");
  }

  return {
    childAge,
    riskLevel: riskLevel as CurriculumInput["riskLevel"],
    goals,
  };
}
