export interface SafeStepsEvidenceRecord {
  sessionId: string;
  gameId: string;
  round: number;
  playerId: string;
  actionType: string;
  actionData: any;
  timestamp: number;

  privacy: 'family_only' | 'worker_supported' | 'contact_visit';
  childSafetyMode: boolean;

  mediaUrl?: string;
  reflection?: string;
  hiddenFromWorker?: boolean;
}
