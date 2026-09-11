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
    if (!body.documentId || !body.caseId || !body.actorUserId) {
      throw new Error("documentId, caseId, and actorUserId are required");
    }

    const queuePayload = {
      document_id: body.documentId,
      source: "edge-function",
      requested_at: new Date().toISOString(),
      requested_by: body.actorUserId,
    };

    const { data: eventRow, error: eventError } = await admin
      .from("events")
      .insert({
        case_id: body.caseId,
        document_id: body.documentId,
        actor_user_id: body.actorUserId,
        event_type: "document_processing_queued",
        event_payload: queuePayload,
      })
      .select("id, case_id, document_id, created_at")
      .single();

    if (eventError) throw eventError;

    const backendUrl = (Deno.env.get("SAFESTEPS_BACKEND_URL") ?? "http://localhost:3000").replace(/\/$/, "");
    const processResponse = await fetch(`${backendUrl}/documents/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: body.documentId,
        caseId: body.caseId,
        requestedBy: body.actorUserId,
      }),
    });

    const processBody = await processResponse.json().catch(() => null);

    const { error: auditError } = await admin.from("audit_logs").insert({
      case_id: body.caseId,
      actor_user_id: body.actorUserId,
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
