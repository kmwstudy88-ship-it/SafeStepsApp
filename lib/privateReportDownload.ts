import { supabase } from "./supabase";

export function normalizePrivateReportExpiry(value?: number) {
  return Math.min(600, Math.max(60, Number(value ?? 600)));
}

export async function issuePrivateReportDownload(input: {
  caseId:string; releaseEventId:string; recipientId:string; authority:string; purpose:string; expirySeconds?:number;
}) {
  const { data, error } = await supabase.functions.invoke("private-report-download", {
    body: { action:"issue", ...input, expirySeconds:normalizePrivateReportExpiry(input.expirySeconds) },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { exportEventId:string; signedUrl:string; expiresAt:string; reportVersion:number; fileSha256:string };
}

export async function confirmPrivateReportDownload(exportEventId:string) {
  const { data, error } = await supabase.functions.invoke("private-report-download", {
    body: { action:"confirm", exportEventId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return Boolean(data?.confirmed);
}
