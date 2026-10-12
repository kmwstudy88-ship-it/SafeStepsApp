import { supabase } from "./supabase";

export function validateReportExportRequest(input: { authority: string; purpose: string; expirySeconds: number }) {
 if (!input.authority.trim() || !input.purpose.trim()) return "Recipient authority and export purpose are required.";
 if (input.expirySeconds < 60 || input.expirySeconds > 600) return "Sensitive report links must expire within 1 to 10 minutes.";
 return null;
}

export async function requestReportExport(input: {
 caseId:string; releaseEventId:string; recipientId:string; authority:string; purpose:string; expirySeconds?:number;
}) {
 const expirySeconds=input.expirySeconds??600;
 const validation=validateReportExportRequest({...input,expirySeconds});
 if(validation) throw new Error(validation);
 const {data,error}=await supabase.rpc("request_case_report_export",{
  p_case_id:input.caseId,p_release_event_id:input.releaseEventId,p_recipient_id:input.recipientId,
  p_authority:input.authority.trim(),p_purpose:input.purpose.trim(),p_expiry_seconds:expirySeconds,
 });
 if(error) throw error;
 return data as string;
}

export async function requestReportCorrection(input:{
 caseId:string;reportId:string;correctionType:string;description:string;materialChange:boolean;
}) {
 if(!input.description.trim()) throw new Error("Correction details are required.");
 const {data,error}=await supabase.rpc("request_case_report_correction",{
  p_case_id:input.caseId,p_report_id:input.reportId,p_correction_type:input.correctionType,
  p_description:input.description.trim(),p_material_change:input.materialChange,
 });
 if(error) throw error;
 return data as string;
}
