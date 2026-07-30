import { supabase } from "../supabase/client";
import { resolveSingleActiveCaseId } from "../security/caseAccess";
import {
  getProgramRecommendationForStream,
  type ProgramRecommendation,
} from "./programRecommendationPolicy";
import {
  getMyIntakeProgress,
  type IntakeProgress,
} from "./programStartGateEngine";

export type ProgramRecommendationConfirmation = {
  id: string;
  case_id: string;
  parent_user_id: string;
  program_id: string;
  source_stream: string;
  status: "confirmed";
  confirmed_at: string;
};

export type ProgramRecommendationJourney = {
  caseId: string;
  recommendation: ProgramRecommendation;
  confirmation: ProgramRecommendationConfirmation | null;
  activeEnrollmentId: string | null;
  intakeProgress: IntakeProgress;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);

  const userId = data.user?.id;
  if (!userId) {
    throw new Error("Sign in before reviewing a program recommendation.");
  }

  return userId;
}

export async function fetchMyProgramRecommendation(): Promise<ProgramRecommendationJourney> {
  const userId = await getCurrentUserId();
  const caseId = await resolveSingleActiveCaseId();

  const { data: caseRecord, error: caseError } = await supabase
    .from("reunification_cases")
    .select("program_stream")
    .eq("id", caseId)
    .maybeSingle();

  if (caseError) throw new Error(caseError.message);

  const recommendation = getProgramRecommendationForStream(
    caseRecord?.program_stream,
  );

  if (!recommendation) {
    throw new Error(
      "Complete the intake starting-pathway selection before reviewing a recommendation.",
    );
  }

  const [confirmationResult, enrollmentResult, intakeProgress] =
    await Promise.all([
      supabase
        .from("program_recommendations")
        .select("id,case_id,parent_user_id,program_id,source_stream,status,confirmed_at")
        .eq("case_id", caseId)
        .eq("parent_user_id", userId)
        .eq("program_id", recommendation.program.id)
        .eq("status", "confirmed")
        .maybeSingle(),
      supabase
        .from("program_enrollments")
        .select("id")
        .eq("case_id", caseId)
        .eq("owner_id", userId)
        .eq("program_id", recommendation.program.id)
        .eq("status", "active")
        .limit(1),
      getMyIntakeProgress(recommendation.program.id),
    ]);

  if (confirmationResult.error) {
    throw new Error(confirmationResult.error.message);
  }
  if (enrollmentResult.error) {
    throw new Error(enrollmentResult.error.message);
  }

  return {
    caseId,
    recommendation,
    confirmation:
      (confirmationResult.data as ProgramRecommendationConfirmation | null) ??
      null,
    activeEnrollmentId: enrollmentResult.data?.[0]?.id
      ? String(enrollmentResult.data[0].id)
      : null,
    intakeProgress,
  };
}

export async function confirmMyProgramRecommendation(
  caseId: string,
  programId: string,
): Promise<ProgramRecommendationConfirmation> {
  const { data, error } = await supabase.rpc("confirm_program_recommendation", {
    target_case_id: caseId,
    target_program_id: programId,
  });

  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error("The program recommendation could not be confirmed.");
  }

  return row as ProgramRecommendationConfirmation;
}
