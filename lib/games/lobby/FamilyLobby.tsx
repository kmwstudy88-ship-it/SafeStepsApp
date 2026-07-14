import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import FamilyGameCalendar, { FamilyGameCalendarMember } from "../calendar/FamilyGameCalendar";
import { GameCalendarRequest, PlayedGameRecord } from "../engine/GameCalendar";

export type LobbyPlayer = {
  id: string;
  name: string;
  ready?: boolean;
};

export type FamilyLobbyProps = {
  roomCode: string;
  players: LobbyPlayer[];
  onStart: () => void;
  gameId?: string;
  gameTitle?: string;
  requester?: FamilyGameCalendarMember;
  familyMembers?: FamilyGameCalendarMember[];
  gameCalendarRequests?: GameCalendarRequest[];
  previousGames?: PlayedGameRecord[];
  onRequestGameTime?: (request: GameCalendarRequest) => void;
};

export default function FamilyLobby({
  roomCode,
  players,
  onStart,
  gameId,
  gameTitle,
  requester,
  familyMembers = [],
  gameCalendarRequests = [],
  previousGames = [],
  onRequestGameTime,
}: FamilyLobbyProps) {
  const canShowCalendar = gameId && gameTitle && requester && familyMembers.length > 0 && onRequestGameTime;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: "#173B45", fontSize: 26, fontWeight: "900" }}>SafeSteps Family Lobby</Text>
      <Text style={{ color: "#284B54", marginTop: 10, fontWeight: "800" }}>Room Code: {roomCode}</Text>

      <Text style={{ color: "#173B45", marginTop: 20, fontSize: 18, fontWeight: "900" }}>Players</Text>
      {players.map((player) => (
        <Text key={player.id} style={{ color: "#284B54", marginTop: 5, fontWeight: "700" }}>
          {player.name} {player.ready ? "Ready" : "Waiting"}
        </Text>
      ))}

      <TouchableOpacity
        onPress={onStart}
        style={{
          marginTop: 30,
          padding: 16,
          backgroundColor: "#2F7D5C",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "900" }}>Start Family Game</Text>
      </TouchableOpacity>

      {canShowCalendar ? (
        <FamilyGameCalendar
          gameId={gameId}
          gameTitle={gameTitle}
          requester={requester}
          familyMembers={familyMembers}
          requests={gameCalendarRequests}
          previousGames={previousGames}
          onRequestGameTime={onRequestGameTime}
        />
      ) : null}
    </View>
  );
}
