# SafeSteps Final Backend Integration

This integration connects the existing Supabase authentication, case memberships,
case-document versioning, private evidence storage, document-intelligence engine,
and Expo client into one enforced API pipeline.

## API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/child/login` | Public credentials; verified `child` role | Start a child session |
| `POST` | `/auth/parent/login` | Public credentials; verified `parent` role | Start a parent session |
| `POST` | `/auth/caseworker/login` | Public credentials; verified professional role | Start a caseworker/professional session |
| `GET` | `/auth/session` | Authenticated | Revalidate the session, roles, and active cases |
| `POST` | `/auth/logout` | Authenticated | Revoke the current SafeSteps API session |
| `POST` | `/documents/upload` | Parent or authorised professional with active case membership | Store and register a case document version |
| `POST` | `/documents/analyze` | Parent or authorised professional with active case membership | Upload or accept text, run intelligence, and persist the result |
| `GET` | `/documents/analyses/:analysisId` | Authorised case member through RLS | Retrieve one analysis |
| `GET` | `/documents/:documentId/analyses` | Authorised case member through RLS | Retrieve analysis history |

`caseId` is required for document upload and analysis. File requests send it as a
multipart field; text requests send it in JSON.

## Connected pipeline

1. Supabase verifies the access token against Auth.
2. The API loads roles from `user_roles`; user-editable metadata is never trusted.
3. The API checks active `case_memberships`.
4. The session is registered or checked against `user_security_sessions`.
5. Files are stored in the existing private `evidence` bucket under the
   authenticated user's RLS-owned prefix.
6. The existing `case_documents` and `case_document_versions` records are used.
7. The version trigger advances the current document version.
8. `DocumentService` performs the structured human-review analysis.
9. `document_analysis_runs` stores processing, completion, result, and failure state.
10. Retrieval endpoints return only rows permitted by database RLS.

## Error and logging contract

API errors use:

```json
{
  "error": {
    "code": "CASE_ACCESS_FORBIDDEN",
    "message": "You are not an active member of the selected SafeSteps case.",
    "requestId": "request-id"
  }
}
```

Every response carries `X-Request-Id`. Server logs are newline-delimited JSON and
redact authorization headers, tokens, passwords, cookies, secrets, and API keys.
Request bodies and document text are not logged.

## Deployment order

1. Review and apply `supabase/migrations/20260730190000_final_backend_integration.sql`.
2. Run the normal `npm run db:push` workflow.
3. Run `npm run db:advisors` and address any new security advisory before release.
4. Deploy the API with Supabase URL, publishable key, OpenAI key, allowed origins,
   and `EXPO_PUBLIC_SAFESTEPS_API_URL`.
5. Run `npm run test:backend` and `npm run smoke:document-intelligence`.
6. Test each login with a real assigned role and test a case-member upload,
   analysis, retrieval, and logout.

The migration was transaction-validated against the current live schema but was
not deployed by this change.
