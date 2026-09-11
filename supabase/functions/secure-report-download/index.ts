import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = (Deno.env.get("SAFESTEPS_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (origin && allowed.length > 0 && !allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (!cors) return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers: jsonHeaders });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, ...jsonHeaders } });

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Authentication required");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw new Error("Authentication failed");

    const body = await req.json();
    const expirySeconds = Math.min(900, Math.max(60, Number(body.expirySeconds ?? 600)));
    const { data: appUser, error: appUserError } = await admin
      .from("users")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();
    if (appUserError || !appUser?.id) throw new Error("Authenticated user is not mapped in users table");

    const { data: eventId, error: requestError } = await userClient.rpc("request_case_report_export", {
      p_case_id: body.caseId,
      p_release_event_id: body.releaseEventId,
      p_recipient_id: body.recipientId,
      p_authority: body.authority,
      p_purpose: body.purpose,
      p_expiry_seconds: expirySeconds,
    });
    if (requestError) throw requestError;

    const { data: event, error: eventError } = await admin
      .from("case_report_export_events")
      .select("*,report_rendered_files(storage_bucket,storage_path,file_hash_sha256)")
      .eq("id", eventId)
      .eq("requested_by", appUser.id)
      .single();

    if (eventError || !event) throw new Error("Authorised export record not found");

    const rendered = event.report_rendered_files;
    if (!rendered?.storage_bucket || !rendered?.storage_path) throw new Error("Private report file is unavailable");

    const { data: signed, error: signError } = await admin.storage
      .from(rendered.storage_bucket)
      .createSignedUrl(rendered.storage_path, expirySeconds, { download: true });
    if (signError || !signed?.signedUrl) throw new Error("Private download could not be issued");
    const issuedExpiresAt = new Date(Date.now() + expirySeconds * 1000).toISOString();

    await admin.from("audit_logs").insert({
      case_id: body.caseId,
      actor_user_id: appUser.id,
      action: "secure_report_download_issued",
      resource_type: "report_export",
      resource_id: event.id,
      details: {
        report_version: event.report_version,
        expires_at: issuedExpiresAt,
      },
    });

    return new Response(
      JSON.stringify({
        exportEventId: event.id,
        signedUrl: signed.signedUrl,
        expiresAt: issuedExpiresAt,
        reportVersion: event.report_version,
        fileSha256: rendered.file_hash_sha256,
      }),
      { headers: { ...cors, ...jsonHeaders } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { ...cors!, ...jsonHeaders } });
  }
});
