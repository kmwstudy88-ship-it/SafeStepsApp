import { finalSafetyCheck } from "../lib/games/engine/FinalSafety";
import {
  applyChoiceBranch,
  buildDefaultFeatureConfig,
  buildReplaySummary,
  completeMiniQuestStep,
  createWorkerSessionEvent,
  getAccessibilityModifiers,
  getAdaptiveDifficulty,
  getGentleTimerSeconds,
  getTherapeuticPrompts,
  moderateGameplayText,
  unlockAchievements,
} from "../lib/games/engine/AdvancedGameplayFeatures";
import { exportEvidence } from "../lib/games/engine/EvidenceExport";
import {
  acceptGameCalendarRequest,
  completeScheduledGame,
  createGameCalendarRequest,
  getPreviousGames,
  getUpcomingGameRequests,
} from "../lib/games/engine/GameCalendar";
import { runGameLogic } from "../lib/games/engine/GameLogic";
import { listVisibleSessions } from "../lib/games/engine/RoomVisibility";
import { generateSessionSummary } from "../lib/games/engine/SessionSummary";
import { VoiceEngine } from "../lib/voice/VoiceEngine";
import { childSafetyVoiceCheck } from "../lib/voice/voiceSafety";

const evidenceRecord = {
  sessionId: "session-1",
  gameId: "game_31",
  round: 1,
  playerId: "player-1",
  actionType: "share",
  actionData: { text: "kind" },
  timestamp: 1,
  privacy: "contact_visit" as const,
  childSafetyMode: true,
};

describe("SafeSteps final game modules", () => {
  it("guards voice engine until a WebRTC runtime is installed", async () => {
    const engine = new VoiceEngine("ROOM_ABC", {});

    expect(engine.isAvailable()).toBe(false);
    await expect(engine.startLocalAudio()).rejects.toThrow("Voice chat requires a WebRTC runtime");
  });

  it("builds voice join payloads for players and workers", () => {
    const engine = new VoiceEngine("ROOM_ABC", {});

    expect(engine.joinPayload("player-1")).toEqual({ type: "join", roomCode: "ROOM_ABC", playerId: "player-1" });
    expect(engine.workerJoinPayload("worker-1")).toEqual({
      type: "worker_join",
      roomCode: "ROOM_ABC",
      workerId: "worker-1",
    });
  });

  it("keeps child-safety voice hooks as review support", () => {
    expect(childSafetyVoiceCheck("stream").mode).toBe("review_required");
    expect(childSafetyVoiceCheck("stream", false).mode).toBe("passthrough");
  });

  it("lists active rooms for worker visibility", () => {
    expect(
      listVisibleSessions({
        ABC123: {
          players: [{ id: "p1", name: "Parent" }],
        },
      }),
    ).toEqual([
      {
        roomCode: "ABC123",
        players: [{ id: "p1", name: "Parent" }],
        privacy: "contact_visit",
        childSafetyMode: true,
      },
    ]);
  });

  it("runs universal game logic by category", () => {
    expect(runGameLogic({ category: "strengths" }, { type: "submit" }, "player-1").evidenceType).toBe(
      "strength_share",
    );
    expect(runGameLogic({ category: "unknown" }, { type: "submit" }, "player-1").evidenceType).toBe("game_action");
  });

  it("exports only worker-visible evidence", () => {
    expect(exportEvidence([evidenceRecord, { ...evidenceRecord, playerId: "hidden", hiddenFromWorker: true }])).toEqual([
      {
        gameId: "game_31",
        playerId: "player-1",
        actionType: "share",
        actionData: { text: "kind" },
        timestamp: 1,
        privacy: "contact_visit",
        childSafetyMode: true,
      },
    ]);
  });

  it("generates worker-safe session summaries", () => {
    const summary = generateSessionSummary(
      {
        sessionId: "session-1",
        players: [{ id: "p1", name: "Parent" }],
        privacy: "contact_visit",
        childSafetyMode: true,
      },
      [evidenceRecord],
      [
        {
          sessionId: "session-1",
          playerId: "p1",
          gameId: "game_31",
          text: "good session",
          shareSetting: "worker_supported",
          timestamp: 1,
        },
        {
          sessionId: "session-1",
          playerId: "c1",
          gameId: "game_31",
          text: "private",
          shareSetting: "family_only",
          hiddenFromWorker: true,
          timestamp: 2,
        },
      ],
    );

    expect(summary.totalActions).toBe(1);
    expect(summary.reflectionsPreview).toHaveLength(1);
  });

  it("filters records for human review without creating automatic escalations", () => {
    const result = finalSafetyCheck({
      ...evidenceRecord,
      actionData: { text: "self-harm statement" },
    });

    expect(result.flagged).toBe(true);
    expect(result.actionData).toBe("[filtered]");
    expect(result.reviewReason).toContain("self-harm");
  });

  it("creates family game calendar requests", () => {
    const request = createGameCalendarRequest({
      gameId: "game_31",
      gameTitle: "Feelings Match",
      requestedById: "parent-1",
      requestedByName: "Parent",
      familyMemberId: "child-1",
      familyMemberName: "Child",
      requestedFor: "2026-07-20T08:30:00.000Z",
      now: "2026-07-13T08:00:00.000Z",
    });

    expect(request.status).toBe("requested");
    expect(request.privacy).toBe("family_only");
    expect(request.childSafetyMode).toBe(true);
  });

  it("moves accepted game requests into previous game history when completed", () => {
    const request = acceptGameCalendarRequest(
      createGameCalendarRequest({
        gameId: "game_31",
        gameTitle: "Feelings Match",
        requestedById: "parent-1",
        requestedByName: "Parent",
        familyMemberId: "child-1",
        familyMemberName: "Child",
        requestedFor: "2026-07-20T08:30:00.000Z",
      }),
    );

    const played = completeScheduledGame(request, {
      playedAt: "2026-07-20T09:00:00.000Z",
      durationMinutes: 20,
      outcome: "Completed together",
    });

    expect(request.status).toBe("scheduled");
    expect(played.players).toEqual(["Parent", "Child"]);
    expect(played.outcome).toBe("Completed together");
  });

  it("sorts upcoming calendar requests and previous games", () => {
    const early = createGameCalendarRequest({
      gameId: "game_31",
      gameTitle: "Feelings Match",
      requestedById: "parent-1",
      requestedByName: "Parent",
      familyMemberId: "child-1",
      familyMemberName: "Child",
      requestedFor: "2026-07-20T08:30:00.000Z",
    });
    const late = createGameCalendarRequest({
      gameId: "game_32",
      gameTitle: "Strengths Builder",
      requestedById: "parent-1",
      requestedByName: "Parent",
      familyMemberId: "child-1",
      familyMemberName: "Child",
      requestedFor: "2026-07-22T08:30:00.000Z",
    });

    expect(getUpcomingGameRequests([late, early], "2026-07-13T00:00:00.000Z").map((request) => request.gameId)).toEqual([
      "game_31",
      "game_32",
    ]);
    expect(
      getPreviousGames([
        { id: "old", gameId: "game_31", gameTitle: "Old", playedAt: "2026-07-10T00:00:00.000Z", players: [], privacy: "family_only" },
        { id: "new", gameId: "game_32", gameTitle: "New", playedAt: "2026-07-12T00:00:00.000Z", players: [], privacy: "family_only" },
      ]).map((game) => game.id),
    ).toEqual(["new", "old"]);
  });

  it("adapts difficulty and gentle timers from child context", () => {
    expect(getAdaptiveDifficulty({ childAge: 7, emotionalState: "focused" })).toBe("gentle");
    expect(getAdaptiveDifficulty({ childAge: 13, emotionalState: "focused" })).toBe("stretch");
    expect(getGentleTimerSeconds("standard", ["quiet_mode"])).toBe(120);
    expect(getGentleTimerSeconds("standard", ["fast_mode"])).toBe(30);
  });

  it("builds therapeutic prompt sets without automated conclusions", () => {
    const prompts = getTherapeuticPrompts({ childAge: 9, emotionalState: "overwhelmed" });

    expect(prompts.map((prompt) => prompt.type)).toContain("emotion_label");
    expect(prompts.map((prompt) => prompt.type)).toContain("worker_guidance");
    expect(prompts.find((prompt) => prompt.type === "coping_strategy")?.prompt).toContain("three slow breaths");
  });

  it("tracks mini-quests, branching storylines, and achievements", () => {
    const config = buildDefaultFeatureConfig({ childAge: 12, emotionalState: "focused", modifiers: ["cooperative_mode"] });
    const steps = completeMiniQuestStep(config.miniQuests, "notice");
    const story = applyChoiceBranch(config.story, "repair-choice");
    const achievements = unlockAchievements(config.achievements, ["validation_shared", "emotion_named"]);

    expect(config.story.chapter).toBe(2);
    expect(steps.find((step) => step.id === "notice")?.completed).toBe(true);
    expect(story.branchKey).toBe("repair-choice");
    expect(achievements.every((achievement) => achievement.unlocked)).toBe(true);
  });

  it("moderates gameplay text with safe replacement and cooldown support", () => {
    const result = moderateGameplayText("This has self-harm and drug words.");

    expect(result.safeText).toContain("safe topic");
    expect(result.replacements).toEqual(["self-harm", "drug"]);
    expect(result.cooldownPrompt).toContain("pause");
    expect(result.safetyScore).toBe(60);
  });

  it("creates replay summaries, worker timeline events, and accessibility modifiers", () => {
    const replay = buildReplaySummary({
      gameId: "game_31",
      gameTitle: "Feelings Match",
      completedSteps: 2,
      unlockedAchievements: 1,
    });
    const event = createWorkerSessionEvent({
      type: "nudge",
      message: "Try a validation prompt.",
      visibility: "live_supported",
    });
    const accessibility = getAccessibilityModifiers({ highContrast: true, lowStim: true, simplifiedUi: true });

    expect(replay.summary).toContain("completed 2 steps");
    expect(event.type).toBe("nudge");
    expect(accessibility.modifiers).toEqual(["high_contrast", "low_stim_mode"]);
    expect(accessibility.readingSupport).toBe("short_prompts");
  });
});
