const KEYWORD_PATTERNS = [
  { phrase: "he has a gun", level: "CRITICAL", score: 1 },
  { phrase: "drop the weapon", level: "CRITICAL", score: 1 },
  { phrase: "shots fired", level: "CRITICAL", score: 1 },
  { phrase: "gun", level: "CRITICAL", score: 1 },
  { phrase: "knife", level: "MEDIUM", score: 0.6 },
  { phrase: "weapon", level: "MEDIUM", score: 0.6 },
];

const AUDIO_PATTERNS = new Set(["gunshot", "shots", "weapon_discharge"]);

function extractTranscriptText(transcriptJson) {
  if (!transcriptJson) {
    return "";
  }

  if (typeof transcriptJson === "string") {
    return transcriptJson;
  }

  const parts = [];

  if (typeof transcriptJson.transcript === "string") {
    parts.push(transcriptJson.transcript);
  }

  if (Array.isArray(transcriptJson.segments)) {
    for (const segment of transcriptJson.segments) {
      if (segment && typeof segment.text === "string") {
        parts.push(segment.text);
      }
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function keywordMatches(text) {
  const normalized = text.toLowerCase();

  return KEYWORD_PATTERNS.filter(({ phrase }) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(normalized);
  }).map(({ phrase, level, score }) => ({ phrase, level, score }));
}

function audioMatches(audioFeatures) {
  return (Array.isArray(audioFeatures) ? audioFeatures : [])
    .map((feature) => String(feature).toLowerCase())
    .filter((feature) => AUDIO_PATTERNS.has(feature))
    .map((pattern) => ({ pattern, level: "CRITICAL" }));
}

function evaluateWeaponRisk(input = {}) {
  const transcriptText = extractTranscriptText(input.transcript_json);
  const detectedKeywords = keywordMatches(transcriptText);
  const detectedAudioPatterns = audioMatches(input.audio_features);
  const hasCriticalKeyword = detectedKeywords.some((match) => match.level === "CRITICAL");
  const hasAudioPattern = detectedAudioPatterns.length > 0;
  const hasMediumKeyword = detectedKeywords.some((match) => match.level === "MEDIUM");
  const weaponThreatScore = hasCriticalKeyword || hasAudioPattern ? 1 : hasMediumKeyword ? 0.6 : 0;
  const level = weaponThreatScore >= 1 ? "CRITICAL" : weaponThreatScore > 0 ? "MEDIUM" : "NONE";
  const reviewFlags = [];

  if (level === "CRITICAL") {
    reviewFlags.push("urgent_human_safety_review");
  }

  if (detectedKeywords.length > 0 && detectedAudioPatterns.length > 0) {
    reviewFlags.push("multi_source_indicator");
  }

  return {
    level,
    confidence: level === "NONE" ? "LOW" : hasAudioPattern || detectedKeywords.length > 1 ? "HIGH" : "MEDIUM",
    weapon_threat_score: weaponThreatScore,
    detected_keywords: detectedKeywords,
    detected_audio_patterns: detectedAudioPatterns,
    review_flags: reviewFlags,
    recommended_action:
      level === "NONE"
        ? "No weapon-risk indicator detected. Continue ordinary human review."
        : "Escalate for immediate human safety review using approved organisational procedures.",
    evidence_summary: {
      for_review_only: true,
      transcript_excerpt: transcriptText.slice(0, 240),
    },
    source: {
      decision_boundary:
        "This is decision-support only for trained human review. It must not trigger automated emergency calls, covert recording, decoy screens, or silent intervention.",
    },
  };
}

module.exports = {
  evaluateWeaponRisk,
  extractTranscriptText,
};
