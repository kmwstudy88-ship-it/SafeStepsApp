export type SafeStepsGameCategory =
  | 'quick_fun'
  | 'family_connection'
  | 'parent_child'
  | 'siblings'
  | 'emotional_learning'
  | 'parenting_skills'
  | 'family_teamwork'
  | 'remote_connection'
  | 'contact_visit'
  | 'reunification'
  | 'child_safety'
  | 'routines'
  | 'communication'
  | 'family_challenge';

export type SafeStepsGameMode =
  | 'live_family'
  | 'remote_connection'
  | 'take_turns'
  | 'contact_visit'
  | 'worker_supported'
  | 'private_family'
  | 'therapeutic'
  | 'quick_play'
  | 'full_session';

export interface SafeStepsPlayer {
  id: string;
  name: string;
  avatar?: string;
  ready: boolean;
  role: 'adult' | 'child' | 'worker' | 'observer';
}

export interface SafeStepsGameSession {
  sessionId: string;
  roomCode: string;
  gameId: string;
  mode: SafeStepsGameMode;
  players: SafeStepsPlayer[];
  rounds: number;
  privacy: 'family_only' | 'worker_supported';
  voiceChat: boolean;
  childSafetyMode: boolean;
  status: 'waiting' | 'active' | 'finished';
}

export interface SafeStepsGameSpec {
  id: string;
  title: string;
  category: SafeStepsGameCategory;
  supportedModes: SafeStepsGameMode[];
  minPlayers: number;
  maxPlayers: number;
  duration: 'quick_play' | 'full_session';
  objective: string;
}
