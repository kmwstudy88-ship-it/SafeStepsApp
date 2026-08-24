export type FlowVersionStatus = "draft" | "in_review" | "approved" | "active" | "deprecated" | "rejected" | "rolled_back";
export type FlowVersionRiskLevel = "low" | "medium" | "high" | "critical";

export interface FlowVersion {
  id: string; flowId: string; version: string; status: FlowVersionStatus; title: string;
  riskLevel: FlowVersionRiskLevel; category: string; triggerPhrases: string[]; assistantGoal: string;
  firstResponse: string; coreScript: string[]; followUpQuestions: string[]; escalationType: string;
  documentationTemplateKey: string; safeReplyTemplateKeys: string[]; promptTemplateKeys: string[];
  uiCopyKeys: string[]; validatorProfileKey: string; jurisdictionScope: string[];
  effectiveFrom?: string; effectiveTo?: string; changeSummary: string; createdBy: string; createdAt: string;
}

export interface FlowVersionAuditLog {
  id: string; flowId: string; previousVersion?: string; newVersion: string;
  action: "created" | "submitted_for_review" | "approved" | "activated" | "deprecated" | "rejected" | "rolled_back" | "edited";
  actorUserId: string; reason?: string; createdAt: string;
}
