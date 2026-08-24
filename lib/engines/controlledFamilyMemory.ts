export type MemoryScope = "ephemeral" | "conversation" | "account" | "case" | "support_plan";
export type MemorySensitivity = "low" | "moderate" | "high" | "critical";
export type MemoryStatus = "active" | "suppressed" | "expired" | "deleted" | "pending_review";

export interface FamilyMemoryItem {
  id: string; userId: string; scope: MemoryScope; sensitivity: MemorySensitivity; key: string; value: string;
  rationale: string; sourceConversationId?: string; sourceMessageId?: string; consentGiven: boolean;
  createdAt: string; updatedAt: string; expiresAt?: string; status: MemoryStatus; tags?: string[]; jurisdiction?: string;
}

export interface MemoryConsentRecord {
  id: string; userId: string; consentType: "memory" | "support_plan" | "sensitive_memory";
  granted: boolean; grantedAt?: string; revokedAt?: string; notes?: string;
}

export function shouldStoreMemory(candidate: { sensitivity: MemorySensitivity; consentGiven: boolean; monitoredDeviceRisk?: boolean; purposeRelevant: boolean }) {
  if (!candidate.purposeRelevant || !candidate.consentGiven) return false;
  if (candidate.monitoredDeviceRisk && candidate.sensitivity !== "low") return false;
  return candidate.sensitivity !== "critical";
}
