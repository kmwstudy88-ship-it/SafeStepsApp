# Privileged RPC and Edge Function Boundaries

This document lists privileged database operations that should not be invoked directly by browser clients and maps them to dedicated Edge Function boundaries.

## Administrative video/report operations
- `public.decide_case_report_version(...)` -> `privileged-video-report-admin` (`action=decide_report_version`)
- `public.release_case_report_version(...)` -> `privileged-video-report-admin` (`action=release_report_version`)
- `public.acknowledge_video_report_delivery(...)` -> `privileged-video-report-admin` (`action=acknowledge_video_delivery`)

## Report export and delivery
- `public.request_case_report_export(...)` -> `privileged-report-export-delivery` (`action=request_export`)
- `public.request_case_report_correction(...)` -> `privileged-report-export-delivery` (`action=request_correction`)
- `public.prepare_case_report_delivery(...)` -> `privileged-report-export-delivery` (`action=prepare_delivery`)
- `public.case_report_export_events` confirmation write -> `privileged-report-export-delivery` (`action=confirm_export`)

## Evidence processing
- `public.review_case_document_version(...)` -> `privileged-evidence-processing` (`action=review_document_version`)
- Case document processing queue/event write -> `privileged-evidence-processing` (`action=queue_document_processing`)

## AI governance or evaluation actions
- `public.activate_personal_ai_flow_version(...)` -> `privileged-ai-governance-evaluation` (`action=activate_flow_version`)
- `public.rollback_personal_ai_flow_version(...)` -> `privileged-ai-governance-evaluation` (`action=rollback_flow_version`)

## Sensitive data exports
- `public.can_export_platform_tenant_data(...)` gate check + audit -> `privileged-sensitive-data-export`

## Notifications or queued background work
- Notification/background queue event writes -> `privileged-notification-queue` (`action=queue_video_notification|queue_background_job`)

## Required controls implemented in each privileged function
- Validate Supabase JWT from the `Authorization` bearer token.
- Validate request payload shape, UUIDs, and allowed enum values.
- Enforce explicit tenant and role authorization checks before executing privileged operations.
- Use only server-side credentials for privileged writes and RPC proxying.
- Write an audit record with redacted/minimal metadata.
- Return minimal response payloads.
- Require idempotency keys and short-circuit duplicate write requests.
- Avoid logging sensitive request or response details.
