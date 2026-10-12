export type VoiceModerationMode = "passthrough" | "review_required" | "safety_paused";

export type VoiceSafetyResult<TStream = unknown> = {
  stream: TStream;
  mode: VoiceModerationMode;
  reviewNotes: string[];
};

export function childSafetyVoiceCheck<TStream>(stream: TStream, childSafetyMode = true): VoiceSafetyResult<TStream> {
  return {
    stream,
    mode: childSafetyMode ? "review_required" : "passthrough",
    reviewNotes: childSafetyMode
      ? ["Live audio is enabled only as supervised session support. Automated conclusions are not generated."]
      : [],
  };
}

export function evaluateVoiceCoachingSafety(params: {
  childSafetyMode?: boolean;
  isCouplesDfvSession?: boolean;
  feltSafetyScore?: number;
  safetyGateTriggered?: boolean;
}): {
  voiceAllowed: boolean;
  mode: VoiceModerationMode;
  guidanceBanner: string;
} {
  if (params.safetyGateTriggered) {
    return {
      voiceAllowed: false,
      mode: "safety_paused",
      guidanceBanner:
        "Voice coaching is paused for safety. Please use emergency contacts (000 / 1800RESPECT 1800 737 732 / Lifeline 13 11 14).",
    };
  }

  if (params.isCouplesDfvSession && (params.feltSafetyScore ?? 8) < 7) {
    return {
      voiceAllowed: false,
      mode: "safety_paused",
      guidanceBanner:
        "Silent Safety Pivot: Shared audio is disabled so each participant can complete private text/visual reflection safely.",
    };
  }

  if (params.childSafetyMode) {
    return {
      voiceAllowed: true,
      mode: "review_required",
      guidanceBanner:
        "Child-Safe Voice Buddy Active: Warm, age-calibrated audio support with zero forensic questioning.",
    };
  }

  return {
    voiceAllowed: true,
    mode: "passthrough",
    guidanceBanner:
      "Voice Coaching & 60-Second Paced Breathing Audio Guide ready (accessibility & low-literacy friendly).",
  };
}
