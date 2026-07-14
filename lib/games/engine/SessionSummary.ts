import type { SafeStepsEvidenceRecord } from "./EvidenceModel";

export type SafeStepsSession = {
  sessionId: string;
  players: { id: string; name: string }[];
  privacy: SafeStepsEvidenceRecord["privacy"];
  childSafetyMode: boolean;
};

export type SafeStepsReflectionRecord = {
  sessionId: string;
  playerId: string;
  gameId: string;
  text: string;
  shareSetting: string;
  hiddenFromWorker?: boolean;
  timestamp: number;
};

export function generateSessionSummary(
  session: SafeStepsSession,
  evidence: SafeStepsEvidenceRecord[],
  reflections: SafeStepsReflectionRecord[],
) {
  return {
    sessionId: session.sessionId,
    players: session.players,
    totalActions: evidence.length,
    totalReflections: reflections.length,
    privacyMode: session.privacy,
    childSafetyMode: session.childSafetyMode,
    highlights: evidence.slice(0, 3),
    reflectionsPreview: reflections.filter((reflection) => !reflection.hiddenFromWorker).slice(0, 3),
  };
}
