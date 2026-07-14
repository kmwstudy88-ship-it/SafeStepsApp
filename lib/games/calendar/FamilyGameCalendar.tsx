import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  createGameCalendarRequest,
  GameCalendarRequest,
  getPreviousGames,
  getUpcomingGameRequests,
  PlayedGameRecord,
} from "../engine/GameCalendar";

export type FamilyGameCalendarMember = {
  id: string;
  name: string;
};

export type FamilyGameCalendarProps = {
  gameId: string;
  gameTitle: string;
  requester: FamilyGameCalendarMember;
  familyMembers: FamilyGameCalendarMember[];
  requests: GameCalendarRequest[];
  previousGames: PlayedGameRecord[];
  onRequestGameTime: (request: GameCalendarRequest) => void;
};

export default function FamilyGameCalendar({
  gameId,
  gameTitle,
  requester,
  familyMembers,
  requests,
  previousGames,
  onRequestGameTime,
}: FamilyGameCalendarProps) {
  const [selectedMemberId, setSelectedMemberId] = useState(familyMembers[0]?.id ?? "");
  const [requestedFor, setRequestedFor] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const selectedMember = familyMembers.find((member) => member.id === selectedMemberId);
  const upcomingRequests = getUpcomingGameRequests(requests);
  const playedGames = getPreviousGames(previousGames);

  function requestGameTime() {
    if (!selectedMember) {
      setMessage("Choose a family member first.");
      return;
    }

    if (!requestedFor.trim()) {
      setMessage("Choose a date and time first.");
      return;
    }

    const parsedTime = Date.parse(requestedFor);
    if (Number.isNaN(parsedTime)) {
      setMessage("Use a date and time like 2026-07-20 18:30.");
      return;
    }

    const request = createGameCalendarRequest({
      gameId,
      gameTitle,
      requestedById: requester.id,
      requestedByName: requester.name,
      familyMemberId: selectedMember.id,
      familyMemberName: selectedMember.name,
      requestedFor: new Date(parsedTime).toISOString(),
      note: note.trim() || undefined,
    });

    onRequestGameTime(request);
    setRequestedFor("");
    setNote("");
    setMessage("Game time request added to the family game calendar.");
  }

  return (
    <View style={{ gap: 16, padding: 20 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ color: "#173B45", fontSize: 22, fontWeight: "900" }}>Family Game Calendar</Text>
        <Text style={{ color: "#45636B", fontWeight: "700" }}>
          Request a time to play {gameTitle} with a family member.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#173B45", fontWeight: "900" }}>Choose who to invite</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {familyMembers.map((member) => {
            const selected = member.id === selectedMemberId;
            return (
              <TouchableOpacity
                key={member.id}
                onPress={() => setSelectedMemberId(member.id)}
                style={{
                  borderColor: selected ? "#2F7D5C" : "#C9D7D5",
                  borderRadius: 8,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: selected ? "#E8F4EE" : "#FFFFFF",
                }}
              >
                <Text style={{ color: "#173B45", fontWeight: "800" }}>{member.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#173B45", fontWeight: "900" }}>Select a time</Text>
        <TextInput
          value={requestedFor}
          onChangeText={setRequestedFor}
          placeholder="2026-07-20 18:30"
          style={{
            borderColor: "#C9D7D5",
            borderRadius: 8,
            borderWidth: 1,
            color: "#173B45",
            padding: 12,
          }}
        />
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Optional note"
          style={{
            borderColor: "#C9D7D5",
            borderRadius: 8,
            borderWidth: 1,
            color: "#173B45",
            padding: 12,
          }}
        />
        <TouchableOpacity onPress={requestGameTime} style={{ backgroundColor: "#2F7D5C", borderRadius: 8, padding: 14 }}>
          <Text style={{ color: "#FFFFFF", fontWeight: "900", textAlign: "center" }}>Add to Game Calendar</Text>
        </TouchableOpacity>
        {message ? <Text style={{ color: "#45636B", fontWeight: "700" }}>{message}</Text> : null}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#173B45", fontSize: 18, fontWeight: "900" }}>Upcoming Game Times</Text>
        {upcomingRequests.length === 0 ? (
          <Text style={{ color: "#45636B" }}>No game times requested yet.</Text>
        ) : (
          upcomingRequests.map((request) => (
            <View key={request.id} style={{ borderColor: "#DDE6E3", borderRadius: 8, borderWidth: 1, padding: 12 }}>
              <Text style={{ color: "#173B45", fontWeight: "900" }}>{request.gameTitle}</Text>
              <Text style={{ color: "#45636B" }}>
                {request.requestedByName} invited {request.familyMemberName}
              </Text>
              <Text style={{ color: "#45636B" }}>{new Date(request.requestedFor).toLocaleString()}</Text>
              <Text style={{ color: "#45636B", fontWeight: "800" }}>Status: {request.status}</Text>
            </View>
          ))
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#173B45", fontSize: 18, fontWeight: "900" }}>Previous Games Played</Text>
        {playedGames.length === 0 ? (
          <Text style={{ color: "#45636B" }}>No previous family games recorded yet.</Text>
        ) : (
          playedGames.map((game) => (
            <View key={game.id} style={{ borderColor: "#DDE6E3", borderRadius: 8, borderWidth: 1, padding: 12 }}>
              <Text style={{ color: "#173B45", fontWeight: "900" }}>{game.gameTitle}</Text>
              <Text style={{ color: "#45636B" }}>{new Date(game.playedAt).toLocaleString()}</Text>
              <Text style={{ color: "#45636B" }}>Players: {game.players.join(", ")}</Text>
              {game.outcome ? <Text style={{ color: "#45636B" }}>{game.outcome}</Text> : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
}
