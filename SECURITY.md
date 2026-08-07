# Security Policy

## Report a vulnerability privately
Please do **not** open public issues for security reports.

- Open a private security advisory in GitHub: **Security → Advisories → Report a vulnerability**.
- If advisories are unavailable, contact the maintainers privately and include reproduction steps, impact, and affected paths.

## Immediate response for secret exposure
1. Revoke and rotate the exposed secret immediately.
2. Remove the secret from runtime configs and CI variables.
3. Replace committed values with placeholders in tracked files.
4. Assess blast radius (services, environments, and data accessed).
5. Document incident timeline and response actions.

## Key rotation checklist
Rotate and redeploy in this order where applicable:

- Supabase anon key (`SUPABASE_ANON_KEY`)
- Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`)
- Supabase secret/publishable keys (`SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`)
- Supabase DB password / connection string (`SUPABASE_DB_URL`)
- Engine/API credentials (`SAFE_STEPS_*_KEY`, `OPENAI_KEY`, `OPENAI_API_KEY`)
- Messaging and payments credentials (`SAFE_STEPS_EMAIL_API_KEY`, `SAFE_STEPS_SMS_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)

## Post-incident cleanup
- Invalidate active sessions/tokens that relied on exposed credentials.
- Review audit logs (Supabase, CI, cloud providers) for suspicious access.
- Clean leaked values from git history when required (e.g., filter-repo/BFG) and coordinate force-push impact.
- Confirm secret scanning passes before reopening deployment.
- Add follow-up controls (least privilege, shorter key TTLs, scoped tokens).
