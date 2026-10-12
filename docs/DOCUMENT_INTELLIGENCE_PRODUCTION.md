# SafeSteps Document Intelligence

Document Intelligence is a worker/supervisor review aid for uploaded or pasted case-document text. It is not a final finding engine, legal advice system, diagnosis tool, or automated safety decision maker.

## Runtime

- App route: `/assessment-system/document-intelligence`
- Documents screen entry point: `/documents`
- Backend command: `npm run backend`
- Smoke test: `npm run smoke:document-intelligence`
- Backend unit tests: `npm run test:backend`
- API base URL: `EXPO_PUBLIC_SAFESTEPS_API_URL`, defaulting to `http://localhost:3000`

## Required Secrets

Set one of these before live analysis:

- `OPENAI_KEY`
- `OPENAI_API_KEY`

Optional:

- `SAFESTEPS_DOCUMENT_INTELLIGENCE_MODEL`, default `gpt-4o-mini`
- `SAFESTEPS_ALLOWED_ORIGIN`, default `*`
- `PORT`, default `3000`

When no OpenAI key is present, `/documents/analyze` returns `503` with a clear setup message. `/health` and `/documents/intelligence/schema` still work.

## Endpoints

`GET /health`

Returns API health.

`GET /documents/intelligence/schema`

Returns the schema version, supported file types, input limits, and configured review sections.

`POST /documents/analyze`

Accepts either JSON:

```json
{ "text": "document text here" }
```

or multipart form data with a `file` field. Supported files are PDF, TXT, CSV, Markdown, and JSON. PDF support depends on extractable text.

`POST /documents/analyze/fairness`

Accepts JSON:

```json
{
  "caseId": "uuid",
  "text": "document text here",
  "documentId": "uuid (optional evidence_record id)",
  "caseContext": {
    "case_type": "reunification",
    "family_composition": "single_parent",
    "child_ages": [5, 8],
    "jurisdictions": ["VIC"]
  }
}
```

Returns structured fairness output with:

- `fairness_score`
- `bias_indicators`
- `coercion_flags`
- `discrimination_risks`
- `framing_concerns`
- `unrealistic_expectations`
- `remediation_recommendations`
- `limitations`

## Output Contract

The response is a structured review envelope:

- `overallSummary`
- `priorityReview`
- `safetyFlags`
- `evidenceGaps`
- `workerReviewActions`
- `sections`
- `disclaimer`

Each section includes:

- `summary`
- `signals`
- `evidenceRefs`
- `gaps`
- `reviewPrompts`
- `confidence`

Confidence is `low`, `medium`, or `high`. Low confidence is expected when source evidence is thin.

## Production Rules

- Treat all output as review prompts until a worker verifies it against source records.
- Do not use the output to trigger covert surveillance, automatic emergency action, or legal conclusions.
- Preserve the submitted source text and any final worker decision separately if this becomes part of report generation.
- Link any accepted finding back to source evidence, case notes, and supervisor review where applicable.
- Fairness detection flags potential bias/coercion and must never be used as a standalone finding.
