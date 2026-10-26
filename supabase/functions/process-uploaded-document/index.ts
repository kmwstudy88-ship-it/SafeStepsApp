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
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw new Error("Authentication failed");

    const body = await req.json();
    if (!body.documentId) {
      throw new Error("documentId is required");
    }

    const backendUrl = (Deno.env.get("SAFESTEPS_BACKEND_URL") ?? "http://localhost:3000").replace(/\/$/, "");
    const processResponse = await fetch(`${backendUrl}/documents/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({
        documentId: body.documentId,
      }),
    });

    const processBody = await processResponse.json().catch(() => null);
    if (!processResponse.ok) throw new Error(processBody?.error?.message ?? `Processing request failed (${processResponse.status})`);

    return new Response(
      JSON.stringify({
        ok: true,
        pipelineResponse: processBody,
        backendStatus: processResponse.status,
        actorAuthUserId: authData.user.id,
        human_review_required: true,
      }),
      { headers: { ...headers, ...jsonHeaders } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Document processing queue failed";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400, headers: { ...headers, ...jsonHeaders } });
  }
});
