const lexicon = {
  anxiety: [/anxious|panic|terrified|scared|afraid|worried|can['’]?t sleep|overwhelm/gi],
  sadness: [/sad|crying|lonely|grief|heartbroken|empty|hopeless/gi],
  anger: [/angry|furious|raging|frustrated|fed up|hate this/gi],
  joy: [/happy|joy|hopeful|proud|grateful|went well|better today/gi],
};
const count = (text, patterns) => patterns.reduce((sum, pattern) => sum + (text.match(pattern)?.length ?? 0), 0);
const rounded = (value) => Math.round(value * 1000) / 1000;
export function analyzeSupportEmotion(message) {
  const text = String(message ?? "").normalize("NFKC").toLowerCase();
  const raw = Object.fromEntries(Object.entries(lexicon).map(([label, patterns]) => [label, count(text, patterns)]));
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0); const ranked = Object.entries(raw).sort((a, b) => b[1] - a[1]);
  const dominantEmotion = total ? ranked[0][0] : "neutral"; const confidence = total ? Math.min(0.9, 0.55 + ranked[0][1] * 0.15) : 0.5;
  const positive = total ? raw.joy / total : 0; const negative = total ? (raw.anxiety + raw.sadness + raw.anger) / total : 0; const neutral = total ? 0 : 1;
  const adaptiveInstruction = { anxiety: "Use steady, grounding language and short sentences. Offer a grounding option without assuming breathing is suitable.", sadness: "Use warm, patient language. Acknowledge pain without forced optimism or trying to fix everything at once.", anger: "Use calm, non-defensive language. Acknowledge frustration and offer one focused next step.", joy: "Acknowledge the positive moment while staying grounded and practical.", neutral: "Use calm, active listening and one concrete next step." }[dominantEmotion];
  return { dominantEmotion, confidence: rounded(confidence), scores: { positive: rounded(positive), negative: rounded(negative), neutral: rounded(neutral), anger: rounded(total ? raw.anger / total : 0), sadness: rounded(total ? raw.sadness / total : 0), anxiety: rounded(total ? raw.anxiety / total : 0), joy: rounded(total ? raw.joy / total : 0) }, adaptiveInstruction, diagnostic: false, analysisVersion: "safesteps-lexicon-1" };
}
