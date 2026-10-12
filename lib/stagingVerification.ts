export const PROTECTED_LIVE_PROJECT_REF = "yzxotxbwgxnxemkzigse";

export const STAGING_ROLE_MATRIX = [
  { role: "parent", expected: ["own_case_read", "own_progress_read"], denied: ["other_case_read", "worker_review"] },
  { role: "child", expected: ["own_private_read", "explicit_share_create"], denied: ["parent_private_read", "report_admin"] },
  { role: "caseworker", expected: ["assigned_case_read", "evidence_review"], denied: ["unassigned_case_read", "independent_report_approval"] },
  { role: "supervisor", expected: ["assigned_case_read", "independent_report_approval"], denied: ["unrelated_tenant_read"] },
  { role: "court_viewer", expected: ["released_report_read"], denied: ["draft_report_read", "case_write"] },
  { role: "unrelated", expected: [], denied: ["case_read", "child_private_read", "report_read"] },
  { role: "anonymous", expected: ["delivery_challenge_only"], denied: ["case_read", "report_read", "challenge_table_read"] },
] as const;

export function assertSafeStagingTarget(url: string) {
  let host: string;
  try { host = new URL(url).host; } catch { throw new Error("A valid staging Supabase URL is required."); }
  if (host.includes(PROTECTED_LIVE_PROJECT_REF)) {
    throw new Error("Refusing to create or mutate verification records in the connected live SafeSteps project.");
  }
  if (!/^[a-z0-9-]+\.supabase\.co$/i.test(host)) {
    throw new Error("The staging target must be a Supabase project URL.");
  }
  return host.split(".")[0];
}
