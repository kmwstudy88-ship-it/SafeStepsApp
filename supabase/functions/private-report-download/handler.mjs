const jsonHeaders = { "Content-Type": "application/json" };

function corsHeaders(req, envGet) {
  const origin = req.headers.get("origin");
  const allowed = (envGet("SAFESTEPS_ALLOWED_ORIGINS") ?? "")
    .split(",").map((value) => value.trim()).filter(Boolean);
  if (origin && !allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function response(body, status, cors) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, ...jsonHeaders } });
}

async function lookupExport(admin, exportEventId, userId) {
  const { data, error } = await admin
    .from("case_report_export_events").select("*")
    .eq("id", exportEventId).eq("requested_by", userId).single();
  if (error || !data) throw new Error("Export request not found");
  return data;
}

export async function handlePrivateReportDownload(req, { envGet, createClient }) {
  const cors = corsHeaders(req, envGet);
  if (!cors) return response({ error: "Origin not allowed" }, 403, {});
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405, cors);

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token) throw new Error("Authentication required");

    const url = envGet("SUPABASE_URL");
    const anonKey = envGet("SUPABASE_ANON_KEY");
    const serviceKey = envGet("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) throw new Error("Download service is not configured");

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData?.user?.id) throw new Error("Authentication failed");

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Request body must be an object");
    const action = body.action ?? "issue";

    if (action === "confirm") {
      if (typeof body.exportEventId !== "string" || !body.exportEventId.trim()) {
        throw new Error("Export event ID is required");
      }
      const source = await lookupExport(admin, body.exportEventId, authData.user.id);
      if (source.outcome !== "allowed" || source.action !== "signed_url_requested") {
        throw new Error("Export request is not confirmable");
      }
      const { error: insertError } = await admin.from("case_report_export_events").insert({
        case_id: source.case_id, release_event_id: source.release_event_id,
        report_id: source.report_id, report_version: source.report_version,
        recipient_id: source.recipient_id, rendered_file_id: source.rendered_file_id,
        requested_by: authData.user.id, authority: source.authority, purpose: source.purpose,
        action: "download_confirmed", outcome: "completed",
        request_reference: source.request_reference,
      });
      if (insertError) throw insertError;
      return response({ confirmed: true }, 200, cors);
    }
    if (action !== "issue") throw new Error("Unsupported action");

    const expiryValue = body.expirySeconds === undefined ? 600 : Number(body.expirySeconds);
    if (!Number.isFinite(expiryValue) || !Number.isInteger(expiryValue)) {
      throw new Error("expirySeconds must be a finite integer");
    }
    const expirySeconds = Math.min(600, Math.max(60, expiryValue));
    const { data: eventId, error: requestError } = await userClient.rpc("request_case_report_export", {
      p_case_id: body.caseId, p_release_event_id: body.releaseEventId,
      p_recipient_id: body.recipientId, p_authority: body.authority,
      p_purpose: body.purpose, p_expiry_seconds: expirySeconds,
    });
    if (requestError) throw requestError;

    const { data: event, error: eventError } = await admin
      .from("case_report_export_events")
      .select("*,report_rendered_files(storage_bucket,storage_path,file_hash_sha256)")
      .eq("id", eventId).eq("requested_by", authData.user.id).single();
    if (eventError || !event) throw new Error("Authorised export record not found");

    const rendered = event.report_rendered_files;
    if (!rendered?.storage_bucket || !rendered?.storage_path) throw new Error("Private report file is unavailable");

    const { data: signed, error: signError } = await admin.storage
      .from(rendered.storage_bucket)
      .createSignedUrl(rendered.storage_path, expirySeconds, { download: true });
    if (signError || !signed?.signedUrl) throw new Error("Private download could not be issued");

    return response({
      exportEventId: event.id,
      signedUrl: signed.signedUrl,
      expiresAt: event.signed_url_expires_at,
      reportVersion: event.report_version,
      fileSha256: rendered.file_hash_sha256,
    }, 200, cors);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return response({ error: message }, 400, cors);
  }
}
