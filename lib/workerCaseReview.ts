import { getSignedInUserId } from "./authSession";
import { getReportSummary, type ReportSummary } from "./platformData";
import {
  listReportReadyCaseDocuments,
  type ReportReadyCaseDocument,
} from "./reportReadyCaseDocuments";
import { supabase } from "./supabase";

export type WorkerCaseContext = {
  id: string;
  parentUserId: string;
  parentCarerName: string | null;
  caseNumber: string | null;
  familyLabel: string | null;
  status: string;
  programStream: string | null;
  reviewDueDate: string | null;
  courtDate: string | null;
};

export type WorkerCaseReview = {
  case: WorkerCaseContext;
  parentSummary: ReportSummary;
  reportReadyDocuments: ReportReadyCaseDocument[];
};

export type ContactSessionEntryContext = {
  caseId: string;
  parentProfileId: string;
  facilitatorProfileId: string;
  parentCarerName: string | null;
  caseNumber: string | null;
  familyLabel: string | null;
};

export type ContactProgressionReviewContext = {
  caseId: string;
  parentProfileId: string;
  actorProfileId: string;
  parentCarerName: string | null;
  caseNumber: string | null;
  familyLabel: string | null;
};

type WorkerCaseRow = {
  id: string;
  parent_user_id: string | null;
  parent_carer_name: string | null;
  case_number: string | null;
  family_label: string | null;
  status: string;
  program_stream: string | null;
  review_due_date: string | null;
  court_date: string | null;
};

export function workerCaseContextFromRow(row: WorkerCaseRow): WorkerCaseContext {
  if (!row.parent_user_id) {
    throw new Error("This SafeSteps case does not have a parent participant assigned.");
  }

  return {
    id: row.id,
    parentUserId: row.parent_user_id,
    parentCarerName: row.parent_carer_name,
    caseNumber: row.case_number,
    familyLabel: row.family_label,
    status: row.status,
    programStream: row.program_stream,
    reviewDueDate: row.review_due_date,
    courtDate: row.court_date,
  };
}

export function contactSessionEntryContextFromRow(
  row: WorkerCaseRow,
  facilitatorProfileId: string,
): ContactSessionEntryContext {
  const caseContext = workerCaseContextFromRow(row);
  if (!facilitatorProfileId) {
    throw new Error("A signed-in facilitator profile is required to record contact sessions.");
  }

  return {
    caseId: caseContext.id,
    parentProfileId: caseContext.parentUserId,
    facilitatorProfileId,
    parentCarerName: caseContext.parentCarerName,
    caseNumber: caseContext.caseNumber,
    familyLabel: caseContext.familyLabel,
  };
}

export function contactProgressionReviewContextFromRow(
  row: WorkerCaseRow,
  actorProfileId: string,
): ContactProgressionReviewContext {
  const caseContext = workerCaseContextFromRow(row);
  if (!actorProfileId) {
    throw new Error("A signed-in worker profile is required to review contact progression.");
  }

  return {
    caseId: caseContext.id,
    parentProfileId: caseContext.parentUserId,
    actorProfileId,
    parentCarerName: caseContext.parentCarerName,
    caseNumber: caseContext.caseNumber,
    familyLabel: caseContext.familyLabel,
  };
}

async function loadWorkerCaseRow(caseId: string): Promise<WorkerCaseRow> {
  const { data, error } = await supabase
    .from("reunification_cases")
    .select(
      "id,parent_user_id,parent_carer_name,case_number,family_label,status,program_stream,review_due_date,court_date",
    )
    .eq("id", caseId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("The selected SafeSteps case could not be loaded.");
  return data as WorkerCaseRow;
}

export async function loadWorkerCaseReview(caseId: string): Promise<WorkerCaseReview> {
  const caseContext = workerCaseContextFromRow(await loadWorkerCaseRow(caseId));
  const [parentSummary, reportReadyDocuments] = await Promise.all([
    getReportSummary(caseContext.parentUserId),
    listReportReadyCaseDocuments(caseId),
  ]);

  return {
    case: caseContext,
    parentSummary,
    reportReadyDocuments,
  };
}

export async function loadContactSessionEntryContext(
  caseId: string,
): Promise<ContactSessionEntryContext> {
  const [row, facilitatorProfileId] = await Promise.all([
    loadWorkerCaseRow(caseId),
    getSignedInUserId("recording a contact session"),
  ]);

  return contactSessionEntryContextFromRow(row, facilitatorProfileId);
}

export async function loadContactProgressionReviewContext(
  caseId: string,
): Promise<ContactProgressionReviewContext> {
  const [row, actorProfileId] = await Promise.all([
    loadWorkerCaseRow(caseId),
    getSignedInUserId("reviewing contact progression"),
  ]);

  return contactProgressionReviewContextFromRow(row, actorProfileId);
}
