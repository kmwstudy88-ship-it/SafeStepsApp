# SafeSteps Personal AI model-provider operations

SafeSteps uses one provider-independent safety pipeline. Set `SAFESTEPS_SUPPORT_MODEL_PROVIDER=openai` or `anthropic` on the server only. OpenAI uses `OPENAI_KEY` and `OPENAI_SUPPORT_GUIDE_MODEL`; Anthropic uses `ANTHROPIC_API_KEY` and requires an explicitly approved `ANTHROPIC_SUPPORT_GUIDE_MODEL`. Never expose provider keys through `EXPO_PUBLIC_*` variables.

The deterministic risk classifier runs before either provider. Both providers must return the same structured reply, pass the same output validator, and fall back to the same locked response. `/api/chat/stream` never forwards raw model tokens: it completes classification, generation, validation and consented persistence first, then emits the approved response as NDJSON. This prevents unsafe partial output from reaching a user.

Anthropic is optional. Install and pin `@anthropic-ai/sdk` and review its lockfile before enabling it. A missing SDK, key or approved model must make that provider unavailable; it must not silently downgrade safety or send data to another provider without an explicit deployment decision.
