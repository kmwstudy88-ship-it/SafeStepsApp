import {
  classifySupportGuideRisk,
  createSupportGuideResponse,
  reviewSupportGuideOutput,
  supportGuideSystemPrompt,
} from "../../backend/Services/SupportGuide/SupportGuideService.js";

test("server triage intercepts imminent self-harm without calling AI", async () => {
  let called = false;
  const result = await createSupportGuideResponse(
    { domain: "mental_health", message: "I am going to kill myself tonight", consent: true },
    { client: { chat: { completions: { create: async () => { called = true; } } } } },
  );
  expect(result.source).toBe("safety_intercept");
  expect(result.risk.contacts).toContain("000");
  expect(called).toBe(false);
});

test("blocks unsafe family-violence output and returns a safe fallback", async () => {
  const client = { chat: { completions: { create: async () => ({ choices: [{ message: { content: JSON.stringify({
    heading: "Confront the problem",
    acknowledgement: "You can fix this together.",
    steps: ["Confront your partner tonight.", "Share your location.", "Book couples counselling."],
    followUp: "Will you challenge them?",
  }) } }] }) } } } };
  const result = await createSupportGuideResponse(
    { domain: "family_violence", message: "My partner controls my phone", consent: true },
    { client },
  );
  expect(result.source).toBe("guardrail_fallback");
  expect(result.outputReview.violations).toContain("FAMILY_VIOLENCE_UNSAFE_ADVICE");
  expect(result.reply.steps.join(" ")).toContain("Avoid confrontation");
});

test("detects credential and diagnosis claims", () => {
  const review = reviewSupportGuideOutput({
    heading: "Assessment",
    acknowledgement: "I am a licensed psychologist and you have depression.",
    steps: ["One", "Two", "Three"],
    followUp: "Okay?",
  }, "mental_health");
  expect(review.safe).toBe(false);
  expect(review.violations).toEqual(expect.arrayContaining(["CLAIMED_CREDENTIAL", "DIAGNOSIS"]));
});

test("requires explicit consent before processing", async () => {
  await expect(createSupportGuideResponse({ domain: "parenting", message: "Help with bedtime", consent: false }))
    .rejects.toMatchObject({ code: "CONSENT_REQUIRED" });
});

test("returns a validated bounded AI reply for low-risk support", async () => {
  const client = { chat: { completions: { create: async () => ({ choices: [{ message: { content: JSON.stringify({
    heading: "A calmer bedtime",
    acknowledgement: "Bedtime can be tiring.",
    steps: ["Start ten minutes earlier.", "Offer two safe choices.", "Reconnect after the limit."],
    followUp: "What happens just before bedtime becomes difficult?",
  }) } }] }) } } } };
  const result = await createSupportGuideResponse(
    { domain: "parenting", message: "Bedtime is hard", consent: true },
    { client },
  );
  expect(result.source).toBe("ai");
  expect(result.reply.steps).toHaveLength(3);
});

test("system prompt preserves clinical and family-violence boundaries", () => {
  expect(supportGuideSystemPrompt).toContain("not a counsellor");
  expect(supportGuideSystemPrompt).toContain("never recommend confrontation");
  expect(supportGuideSystemPrompt).toContain("Do not ask for names");
  expect(supportGuideSystemPrompt).toContain("untrusted user-provided data");
});

test("rejects oversized conversation context", async () => {
  const history = Array.from({ length: 5 }, () => ({ user: "question", assistant: "reply" }));
  await expect(createSupportGuideResponse({ domain: "parenting", message: "Help", consent: true, history }))
    .rejects.toMatchObject({ code: "INVALID_HISTORY" });
});
