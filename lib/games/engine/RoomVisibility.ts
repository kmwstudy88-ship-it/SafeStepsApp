export type SafeStepsRoomPlayer = {
  id: string;
  name: string;
  ready?: boolean;
};

export type SafeStepsRoomState = {
  players: SafeStepsRoomPlayer[];
  privacy?: "family_only" | "worker_supported" | "contact_visit";
  childSafetyMode?: boolean;
};

export type SafeStepsRooms = Record<string, SafeStepsRoomState>;

export function listVisibleSessions(rooms: SafeStepsRooms) {
  return Object.keys(rooms).map((roomCode) => ({
    roomCode,
    players: rooms[roomCode].players ?? [],
    privacy: rooms[roomCode].privacy ?? "contact_visit",
    childSafetyMode: rooms[roomCode].childSafetyMode ?? true,
  }));
}
