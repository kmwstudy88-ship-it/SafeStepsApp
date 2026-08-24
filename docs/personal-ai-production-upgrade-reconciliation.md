# Personal AI Support production upgrade reconciliation

SafeSteps keeps its existing stack: Expo/React Native, Express, Supabase Auth/Postgres/RLS, and OpenAI or Anthropic behind one safety boundary. A parallel FastAPI, Vite, SQLite, custom-password or custom-JWT implementation would duplicate identity and persistence controls and is not part of the production architecture.

## Implemented production controls

- Supabase validates bearer tokens and resolves server-side roles and memberships.
- Conversations are user-owned under RLS; staff access is separately role-limited.
- Chat persistence is explicit-consent only and atomic. High/critical user wording is replaced by a non-verbatim marker in ordinary message storage.
- Critical rules run before the model. Both providers use the same structured schema, output validator, locked crisis templates and fallback.
- Streaming begins only after full validation; raw provider tokens are never forwarded.
- Controlled family memory is allowlisted, consented, expiring, suppressible and excluded on monitored devices.
- Health and configuration-readiness endpoints are separate. Readiness exposes booleans only, never secrets.

## Deployment

Build with `docker compose build backend`, then start behind an HTTPS reverse proxy or managed container platform. The container binds to localhost by default in Compose; production ingress must terminate TLS and forward only approved origins. Supabase remains managed and external—do not run a second unsynchronised Postgres identity store.

Before release, verify migrations and RLS against staging, run database advisors and the safety suite, test ownership isolation, validate the referral directory, and complete clinical, safeguarding, privacy, jurisdiction and accessibility sign-off. Do not treat a healthy container as permission to launch; the governance gate remains authoritative.
