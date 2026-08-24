export type CriticalTemplateKey = "child_abuse_disclosure" | "self_harm_warning" | "parent_may_hurt_child" | "intoxicated_with_child_present" | "active_dv_danger" | "dv_monitored_device_risk" | "critical_critical_unclear";

export interface CriticalResponseTemplate {
  key: CriticalTemplateKey;
  title: string;
  riskLevel: "critical";
  triggerIntent: string;
  response: string;
  followUpQuestion: string;
  safetyInstruction: string;
  escalationInstruction: string;
  closingLine: string;
  doNotSay: string[];
  tags: string[];
}

export const CRITICAL_TEMPLATE_POLICY = Object.freeze({ version: "1.0.0", modelMayRewrite: false, maximumQuestions: 1, requiresRealWorldSupport: true });
