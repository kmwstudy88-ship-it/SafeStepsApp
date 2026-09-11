import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

async function signPipelineContext(token: string, actorUserId: string, caseId: string, documentId: string) {
  const payload = `${actorUserId}:${caseId}:${documentId}:${token}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  const headers = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, ...jsonHeaders } });

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Authentication required");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw new Error("Authentication failed");

    const body = await req.json();
    if (!body.documentId || !body.caseId) {
      throw new Error("documentId and caseId are required");
    }

    const { data: appUser, error: appUserError } = await admin
      .from("users")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();
    if (appUserError || !appUser?.id) throw new Error("Authenticated user is not mapped in users table");

    const { data: caseRow, error: caseError } = await userClient
      .from("cases")
      .select("id")
      .eq("id", body.caseId)
      .maybeSingle();
    if (caseError || !caseRow?.id) throw new Error("You do not have access to this case");

    const { data: documentRow, error: documentError } = await userClient
      .from("documents")
      .select("id")
      .eq("id", body.documentId)
      .eq("case_id", body.caseId)
      .maybeSingle();
    if (documentError || !documentRow?.id) throw new Error("You do not have access to this document");

    const backendBaseUrl = Deno.env.get("SAFESTEPS_BACKEND_URL");
    if (!backendBaseUrl) throw new Error("SAFESTEPS_BACKEND_URL is required");
    const pipelineToken = Deno.env.get("SAFESTEPS_PIPELINE_TOKEN");
    if (!pipelineToken) throw new Error("SAFESTEPS_PIPELINE_TOKEN is required");

    const queuePayload = {
      document_id: body.documentId,
      source: "edge-function",
      requested_at: new Date().toISOString(),
      requested_by: appUser.id,
    };

    const { data: eventRow, error: eventError } = await userClient
      .from("events")
      .insert({
        case_id: body.caseId,
        document_id: body.documentId,
        actor_user_id: appUser.id,
        event_type: "document_processing_queued",
        event_payload: queuePayload,
      })
      .select("id, case_id, document_id, created_at")
      .single();

    if (eventError) throw eventError;

    const processResponse = await fetch(`${backendBaseUrl.replace(/\/$/, "")}/documents/process`, {
      headers: {
        "Content-Type": "application/json",
        "x-safesteps-pipeline-token": pipelineToken,
        "x-safesteps-actor-user-id": appUser.id,
        "x-safesteps-case-id": body.caseId,
        "x-safesteps-document-id": body.documentId,
        "x-safesteps-context-signature": await signPipelineContext(
          pipelineToken,
          appUser.id,
          body.caseId,
          body.documentId,
        ),
      },
      method: "POST",
      body: JSON.stringify({
        documentId: body.documentId,
        caseId: body.caseId,
        requestedBy: appUser.id,
      }),
    });

    const processBody = await processResponse.json().catch(() => null);
    if (!processResponse.ok) {
      await userClient.from("events").insert({
        case_id: body.caseId,
        document_id: body.documentId,
        actor_user_id: appUser.id,
        event_type: "document_processing_failed",
        event_payload: {
          queue_event_id: eventRow.id,
          backend_status: processResponse.status,
          backend_response: processBody,
        },
      });
      throw new Error(
        `Backend processing failed (${processResponse.status}): ${JSON.stringify(processBody)}`,
      );
    }

    const { error: auditError } = await userClient.from("audit_logs").insert({
      case_id: body.caseId,
      actor_user_id: appUser.id,
      action: "document_processing_requested",
      resource_type: "document",
      resource_id: body.documentId,
      details: {
        queue_event_id: eventRow.id,
        backend_status: processResponse.status,
      },
    });

    if (auditError) throw auditError;

    return new Response(
      JSON.stringify({
        ok: true,
        queuedEvent: eventRow,
        pipelineResponse: processBody,
        backendStatus: processResponse.status,
      }),
      { headers: { ...headers, ...jsonHeaders } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Document processing queue failed";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400, headers: { ...headers, ...jsonHeaders } });
  }
});
