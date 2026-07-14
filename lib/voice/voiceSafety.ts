export type VoiceModerationMode = "passthrough" | "review_required";

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
