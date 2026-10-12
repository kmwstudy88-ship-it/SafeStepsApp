import { getProgramById, type ProgramPathway } from "../data/programs";

export const PROGRAM_STREAM_TO_ID = {
  "24 Month Reunification": "intensive-reunification",
  "18 Month Keeping Families Together": "keeping-families-together",
  "12 Month Back on Track": "back-on-track",
  "6 Month Build Stronger Families": "build-stronger-families",
  "12 Week Child Safety Contact Program": "child-safety-contact",
  "Custom Program": "custom-program",
} as const;

export type ProgramRecommendation = {
  sourceStream: string;
  program: ProgramPathway;
  rationale: string;
  limitation: string;
};

export function getProgramRecommendationForStream(
  sourceStream?: string | null,
): ProgramRecommendation | null {
  const normalizedStream = sourceStream?.trim();
  if (!normalizedStream) return null;

  const programId =
    PROGRAM_STREAM_TO_ID[normalizedStream as keyof typeof PROGRAM_STREAM_TO_ID];
  if (!programId) return null;

  const program = getProgramById(programId);
  if (!program) return null;

  return {
    sourceStream: normalizedStream,
    program,
    rationale: `This matches the “${normalizedStream}” starting pathway saved in your completed intake.`,
    limitation:
      "This recommendation reflects your saved pathway choice. It is not an independent risk assessment, parenting-capacity finding, or court opinion.",
  };
}

export function programCanAcceptNewEnrollments(program: ProgramPathway): boolean {
  return program.launchStatus === "launch" || program.launchStatus === "custom";
}

export function recordMatchesRecommendedProgram(
  record: { program_id?: string | null } | null | undefined,
  recommendedProgramId: string,
): boolean {
  return record?.program_id === recommendedProgramId;
}

export function customPathwayAwaitsWorkerApproval(
  program: Pick<ProgramPathway, "launchStatus">,
  reviewerState: string,
): boolean {
  return program.launchStatus === "custom" && reviewerState !== "approved";
}
