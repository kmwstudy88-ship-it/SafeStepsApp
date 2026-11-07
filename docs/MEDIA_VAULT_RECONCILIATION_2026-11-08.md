# Media and evidence vault reconciliation

Reviewed source: `5f3ec4e18ecaf7c5fec39ceb215153d23c358f07` on `main`.
Original review scope: source inspection. The remediation section below records subsequent local implementation and validation; no hosted database inspection, Android run, or production validation has been performed.

## Scaffold identification

`copilot/docs-forensic-media-implementation` is an ancestor of main and has no changes ahead of main. It is not a separate pending implementation. Fixed-string searches of backend, lib, app and supabase found neither `/v1/media/ingest` nor `/v1/evidence/register`, nor `device_keys`. Do not remove an unrelated endpoint or invent the missing schema on that basis.

## Confirmed source defects

1. **Daily check-ins bypass the offline queue.** `app/daily-evidence.tsx` has both library selection and camera capture, stores the selected asset only in component state, and calls `uploadEvidenceMedia` followed by `addDailyHomeEvidence`. This is a separate path from `evidenceEngine` and its offline vault. Library selection is incompatible with treating every check-in as verified live capture. A camera picker result alone is also not attestation.
2. **Attachment bytes are copied without vault-level encryption.** `sealAttachmentCopy` in `lib/engines/offlineEvidenceVault.ts` copies the attachment into document storage. AES-GCM protects the metadata envelope, not these copied attachment bytes. OS device encryption is a separate control.
3. **The third queued item breaks the local chain.** Items are prepended, but `queueOfflineEvidence` uses `items.at(-1)` as the predecessor. After A then B, C links to A rather than B. The chronological verifier expects C to link to B.
4. **Retry metadata changes a predecessor hash.** `markOfflineEvidenceSyncFailed` changes fields included in the item's hash and replaces the hash without updating descendants. With linked later items, verification then fails. Rehashing descendants would rewrite the recorded history and should not be the repair strategy.
5. **Successful sync can invalidate the remaining chain.** `removeOfflineEvidenceItem` deletes a chain member while remaining records retain their previous hashes; verification always starts at `vault-root`. It also deletes the attachment before persisting the shortened queue, so a metadata-write failure can leave a queued item pointing to a deleted file.
6. **Concurrent queue writes can lose records.** Queueing reads, copies, hashes and overwrites one envelope without serialising mutations. Two overlapping calls can read the same starting items and overwrite each other's results. Key creation is also not serialised.
7. **The stored file digest hashes base64 text.** `hashFile` reads the entire file as base64 and passes that string to `digestStringAsync`. This is not SHA-256 of the original file bytes, and full-file materialisation is unsuitable for large videos.
8. **Sync is not an atomic, idempotent operation.** The upload, evidence insert, audit insert and local removal are separate operations. A failure after a successful evidence insert can leave the item queued for duplicate insertion on retry. Stable capture identity and server-side deduplication are needed.

## Checklist claims requiring correction or further inspection

- Tests and CI exist: `__tests__/offline-evidence-vault.test.ts`, `__tests__/evidence-review.test.ts` and `.github/workflows/ci.yml`. The offline vault tests inspected cover a manually constructed two-item chain and metadata tampering; they do not exercise the queue lifecycle defects above. No test pass is asserted here.
- Reviewer UI and read services exist: `app/facilitator/evidence-review.tsx` and `lib/evidenceReview.ts` list documents and review events. This does not establish the requested media reviewer, redaction or disclosure workflow is complete.
- Retention and custody migrations exist, including `202607220071_evidence_retention.sql` and `202607220066_evidence_chain_of_custody.sql`. Deployment, scheduling, disposal enforcement and privileged-access auditing remain unverified.
- `backend/server.js` mounts route groups, request logging and rate-limit middleware. The blanket assertion that the current Express server has no rate limiting or observability is inaccurate. Upload-flood limits and operational effectiveness still require verification.
- Hardware attestation, timestamp anchoring, malware scanning and biometric safeguards were not established by this inspection. The missing scaffold identifiers prevent validating the original HMAC and device-secret claims against this source.

## Original proposed implementation order

1. Define a durable capture record before launching the camera and a supported native recovery contract for interrupted recordings. Keep recovered or imported material labelled as unverified; never upgrade provenance on recovery.
2. Route daily check-ins through the same durable, encrypted attachment and registration pipeline. Preserve imported evidence as a distinct source where allowed. Require server-verified provenance for any live-capture claim.
3. Separate immutable capture/custody events from mutable delivery status. Keep historical chain records after sync; retain a durable, verifiable checkpoint when compacting. Serialise local mutations and make server registration idempotent by capture identity.
4. Add lifecycle regressions for three captures, concurrent saves, failed sync of an ancestor, partial successful sync, restart, file tampering, missing files, and failures between upload/registration/audit/local cleanup. Test real byte hashes against a known SHA-256 vector.
5. Implement authenticated encryption of attachment bytes and native streaming hash/upload before large-video support. Verify on Android with interruption, storage pressure and connectivity loss.

No production-readiness, legal-admissibility or biometric-accuracy claim follows from this review. Uninstall or app-data clearing can still destroy unsynced local evidence; durable sync and clear pending-item warnings remain necessary.


## Local remediation candidate

The local `codex/media-vault-review` candidate addresses the confirmed capture and delivery defects:

- All vault mutations are serialised, including key creation; caller-owned data is copied before sealing. New captures use the latest predecessor. Delivery bookkeeping preserves the original hash projection, including for valid legacy v2 records.
- Sync retires entries from the pending queue while retaining custody history and encrypted copies. It no longer deletes attachment bytes before a metadata write. Existing broken chains are surfaced and not silently rehashed or reset.
- New attachments are AES-256-GCM encrypted with capture-specific additional authenticated data. Their digests use original bytes, not base64 text. Legacy base64-text digests remain distinguishable and are not relabelled as byte digests. Missing keys fail closed.
- Capture ownership is durably encrypted before invoking the external picker. Completed results are immediately sealed as unconfirmed drafts. Android pending picker results and interrupted seals are recovered on launch; recovery uses stable identities and can use a completed encrypted copy when the original camera cache is gone. Interrupted recordings with no recoverable file produce an explicit interruption record, not invented media or a verified live-capture claim.
- Recovered drafts appear in Evidence and require context and explicit save before upload. The periodic sync skips unconfirmed drafts. The daily check-in screen uses the same draft/seal/queue pipeline and keeps successful local saves when history refresh fails offline.
- Registration, storage paths, and the creation audit event use stable identities. An existing upload is checked byte-for-byte rather than overwritten. Retry conflicts fail closed. Registration checks the expected account, and concurrent sync requests share one operation.
- Voluntary logout helpers reject while the signed-in owner has pending items, unconfirmed drafts, unresolved captures or seals. Foreground launch/resume and a foreground retry interval trigger recovery/sync, with visible pending/failure notices. Local pending items can be listed without a server `getUser` request.

### Limits and release gates

This is a local implementation candidate, not production approval. No hosted schema or infrastructure was changed. Existing Supabase primary keys, owner-scoped read/insert policies and storage read/insert policies must be verified in the target environment; the tests use deterministic service mocks. The audit chain still requires server-side serialisation and independent anchoring. Service-role content access and read auditing are not changed.

Existing legacy plaintext attachment copies are preserved, not silently rewritten in place. They are reported as unencrypted by the security status and need a separately verified migration. New encrypted files and synced history are retained locally; a reviewed retention/compaction policy is still needed.

The current Expo encryption/hash/upload path materialises file bytes. Native streaming encryption/hashing and resumable uploads remain required for large videos. Device runs must cover process death during the external camera activity, storage pressure, key loss, airplane mode, logout, and account changes. A recording that the native camera never finalises or returns cannot be reconstructed by a JavaScript cache sweep.

Hardware-backed signing/Play Integrity, malware scanning and magic-byte/ffprobe validation, redaction and disclosure approvals, RFC 3161 anchoring, privileged-read controls, cross-case link validation, child-safety escalation, biometric consent/evaluation and the broader Track C/task-completion rule remain separate release gates. Unconfirmed drafts in this patch are excluded from auto-upload; this does not establish enforcement across every assessment or task workflow. Uninstalling or clearing app data can still destroy unsynced evidence.


### Validation of this candidate

- Focused regression run: 5 suites, 46 tests passed. It covers three-item and legacy chains, concurrent queue writes, caller mutation, key loss, encrypted-byte digests and tampering, failed retirement writes, interrupted seals, pending-picker recovery, owner separation, missing recordings, confirmation gating, duplicate registration/audit responses, upload conflicts and offline queue visibility.
- Full Jest run: 112 suites passed; 4 suites initially failed only because fixtures were absent from the partial checkout. After fetching the missing tracked fixtures, all 4 passed on rerun. All 116 suites therefore have passing results across the run and fixture reruns. Two pre-existing tests were skipped. The focused suites were rerun after the final local changes.
- Full app type check: `node node_modules/typescript/bin/tsc --noEmit --pretty false --project tsconfig.json` passed.
- ESLint passed for the modified media/auth implementation and regression tests. `git diff --check` passed.
- No Android device tooling was available. Hosted authenticated/denied journeys, native crypto/device behaviour and production integrations remain unverified.
