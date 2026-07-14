export type GameCalendarStatus = "requested" | "scheduled" | "completed" | "cancelled";

export type GameCalendarPrivacy = "family_only" | "worker_supported" | "contact_visit";

export type GameCalendarRequest = {
  id: string;
  gameId: string;
  gameTitle: string;
  requestedById: string;
  requestedByName: string;
  familyMemberId: string;
  familyMemberName: string;
  requestedFor: string;
  status: GameCalendarStatus;
  privacy: GameCalendarPrivacy;
  childSafetyMode: boolean;
  note?: string;
  createdAt: string;
};

export type PlayedGameRecord = {
  id: string;
  gameId: string;
  gameTitle: string;
  playedAt: string;
  players: string[];
  durationMinutes?: number;
  outcome?: string;
  reflectionPreview?: string;
  privacy: GameCalendarPrivacy;
};

export type CreateGameCalendarRequestInput = {
  gameId: string;
  gameTitle: string;
  requestedById: string;
  requestedByName: string;
  familyMemberId: string;
  familyMemberName: string;
  requestedFor: string;
  privacy?: GameCalendarPrivacy;
  childSafetyMode?: boolean;
  note?: string;
  now?: string;
};

export function createGameCalendarRequest(input: CreateGameCalendarRequestInput): GameCalendarRequest {
  return {
    id: `game-request-${input.gameId}-${input.familyMemberId}-${Date.parse(input.requestedFor) || Date.now()}`,
    gameId: input.gameId,
    gameTitle: input.gameTitle,
    requestedById: input.requestedById,
    requestedByName: input.requestedByName,
    familyMemberId: input.familyMemberId,
    familyMemberName: input.familyMemberName,
    requestedFor: input.requestedFor,
    status: "requested",
    privacy: input.privacy ?? "family_only",
    childSafetyMode: input.childSafetyMode ?? true,
    note: input.note,
    createdAt: input.now ?? new Date().toISOString(),
  };
}

export function acceptGameCalendarRequest(request: GameCalendarRequest): GameCalendarRequest {
  return {
    ...request,
    status: "scheduled",
  };
}

export function completeScheduledGame(
  request: GameCalendarRequest,
  input: {
    playedAt?: string;
    durationMinutes?: number;
    outcome?: string;
    reflectionPreview?: string;
  } = {},
): PlayedGameRecord {
  return {
    id: `played-${request.id}`,
    gameId: request.gameId,
    gameTitle: request.gameTitle,
    playedAt: input.playedAt ?? new Date().toISOString(),
    players: [request.requestedByName, request.familyMemberName],
    durationMinutes: input.durationMinutes,
    outcome: input.outcome,
    reflectionPreview: input.reflectionPreview,
    privacy: request.privacy,
  };
}

export function getUpcomingGameRequests(requests: GameCalendarRequest[], now = new Date().toISOString()) {
  const nowTime = Date.parse(now);

  return requests
    .filter((request) => request.status !== "completed" && Date.parse(request.requestedFor) >= nowTime)
    .sort((left, right) => Date.parse(left.requestedFor) - Date.parse(right.requestedFor));
}

export function getPreviousGames(records: PlayedGameRecord[]) {
  return [...records].sort((left, right) => Date.parse(right.playedAt) - Date.parse(left.playedAt));
}
