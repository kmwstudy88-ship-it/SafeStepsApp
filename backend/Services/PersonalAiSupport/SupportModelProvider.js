export const supportedModelProviders = ["openai", "anthropic"];

export async function createConfiguredModelClient(provider) {
  if (provider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) throw Object.assign(new Error("Anthropic is not configured."), { code: "MODEL_PROVIDER_UNAVAILABLE" });
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    } catch {
      throw Object.assign(new Error("The optional Anthropic SDK is not installed."), { code: "MODEL_PROVIDER_UNAVAILABLE" });
    }
  }
  const { default: OpenAI } = await import("openai");
  return new OpenAI({ apiKey: process.env.OPENAI_KEY });
}

export async function requestSupportModel({ provider, client, model: requestedModel, systemPrompt, payload }) {
  if (!supportedModelProviders.includes(provider)) throw Object.assign(new Error("Unsupported model provider."), { code: "MODEL_PROVIDER_INVALID" });
  const activeClient = client ?? await createConfiguredModelClient(provider);
  if (provider === "anthropic") {
    const model = requestedModel ?? process.env.ANTHROPIC_SUPPORT_GUIDE_MODEL;
    if (!model) throw Object.assign(new Error("ANTHROPIC_SUPPORT_GUIDE_MODEL must name an approved, pinned model."), { code: "MODEL_PROVIDER_UNAVAILABLE" });
    const response = await activeClient.messages.create({ model, max_tokens: 900, temperature: 0.3, system: systemPrompt, messages: [{ role: "user", content: JSON.stringify(payload) }] });
    const content = response.content?.filter((block) => block.type === "text").map((block) => block.text).join("").trim();
    if (!content) throw new Error("The support model returned an empty response.");
    return content;
  }
  const completion = await activeClient.chat.completions.create({
    model: process.env.OPENAI_SUPPORT_GUIDE_MODEL ?? "gpt-5-mini",
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(payload) }],
    response_format: { type: "json_object" },
  }, { timeout: 20_000 });
  const content = completion.choices?.[0]?.message?.content;
  if (!content) throw new Error("The support model returned an empty response.");
  return content;
}
