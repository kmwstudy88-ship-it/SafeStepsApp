import { sanitizeAgainstSafetyPolicy } from "./SafetyPolicyEnforcer.js";

const SYSTEM_SAFETY_INSTRUCTION = `You are the SafeSteps Personal AI Support Coach, Non-Diagnostic Psychological Formulation Companion, and Longitudinal Evaluator.
Mandatory Rules (policies/safety_policy.md):
1. NEVER make diagnostic statements ("This child has...", "This parent is...", "You have borderline/ADHD/PTSD").
2. NEVER give legal advice or predict court outcomes ("The court should/will...").
3. NEVER adjudicate abuse ("This is/is not abuse").
4. In DFV contexts, follow Safe & Together™ principles: never blame survivors for a perpetrator's violence, and never conduct conjoint couple conflict work if fear (<7/10), coercion, or lethality indicators are present.
5. Keep guidance trauma-informed, neuro-affirming, culturally safe (First Nations SEWB), and practical.`;

export async function generateClinicalCompletionWithFallback({
  prompt,
  deterministicFallbackGenerator,
  preferLocalDeterministic = false,
}) {
  if (!preferLocalDeterministic) {
    // Tier 1: Google Gemini (gemini-3.8-flash via @google/genai)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      try {
        const genaiModule = await import("@google/genai");
        const GoogleGenAI = genaiModule.GoogleGenAI;
        if (GoogleGenAI) {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await ai.models.generateContent({
            model: process.env.SAFESTEPS_GEMINI_MODEL || "gemini-3.8-flash",
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_SAFETY_INSTRUCTION,
              temperature: 0.25,
            },
          });
          const text = response?.text?.trim();
          if (text) {
            const { sanitizedText, violationsCorrected } = sanitizeAgainstSafetyPolicy(text);
            return {
              text: sanitizedText,
              providerTierUsed: "tier1_gemini",
              violationsCorrected,
            };
          }
        }
      } catch {
        // Fall through to Tier 2 OpenAI
      }
    }

    // Tier 2: OpenAI (gpt-4o-mini via openai SDK)
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey !== "test-key") {
      try {
        const { default: OpenAI } = await import("openai");
        const client = new OpenAI({ apiKey: openAiKey });
        const completion = await client.chat.completions.create({
          model: process.env.SAFESTEPS_OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.25,
          messages: [
            { role: "system", content: SYSTEM_SAFETY_INSTRUCTION },
            { role: "user", content: prompt },
          ],
        });
        const text = completion?.choices?.[0]?.message?.content?.trim();
        if (text) {
          const { sanitizedText, violationsCorrected } = sanitizeAgainstSafetyPolicy(text);
          return {
            text: sanitizedText,
            providerTierUsed: "tier2_openai",
            violationsCorrected,
          };
        }
      } catch {
        // Fall through to Tier 3 Deterministic Local Clinical Engine
      }
    }
  }

  // Tier 3: 100% Deterministic Local Clinical Engine (Zero-Downtime Guarantee)
  const fallbackText =
    typeof deterministicFallbackGenerator === "function"
      ? deterministicFallbackGenerator()
      : String(deterministicFallbackGenerator ?? "");
  const { sanitizedText, violationsCorrected } = sanitizeAgainstSafetyPolicy(fallbackText);

  return {
    text: sanitizedText,
    providerTierUsed: "tier3_deterministic_local",
    violationsCorrected,
  };
}
