const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function corsHeaders(req, envGet) {
  const origin = req.headers.get("origin");
  const allowed = (envGet("SAFESTEPS_ALLOWED_ORIGINS") ?? "")
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

function response(body, status, cors) {
  return new Response(JSON.stringify(body), { status, headers: { ...(cors ?? {}), ...jsonHeaders } });
}

export async function handleSecureReportDownload(req, { createClient, envGet }) {
  const cors = corsHeaders(req, envGet);
  if (!cors) return response({ error: "Origin not allowed" }, 403, {});
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405, cors);

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token) throw Object.assign(new Error("Authentication required"), { status: 401 });

    const url = envGet("SUPABASE_URL");
    const anonKey = envGet("SUPABASE_ANON_KEY");
    const serviceKey = envGet("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) throw Object.assign(new Error("Download service is not configured"), { status: 500 });

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData?.user) throw Object.assign(new Error("Authentication failed"), { status: 401 });

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw Object.assign(new Error("Request body must be an object"), { status: 400 });

    const rawExpiry = Number(body.expirySeconds ?? 600);
    const expirySeconds = Number.isFinite(rawExpiry) ? Math.min(900, Math.max(60, rawExpiry)) : 600;

    const caseId = typeof body.caseId === "string" && body.caseId.trim() ? body.caseId : null;
    const releaseEventId = typeof body.releaseEventId === "string" && body.releaseEventId.trim() ? body.releaseEventId : null;
    const recipientId = typeof body.recipientId === "string" && body.recipientId.trim() ? body.recipientId : null;
    const authority = typeof body.authority === "string" && body.authority.trim() ? body.authority.trim() : null;
    const purpose = typeof body.purpose === "string" && body.purpose.trim() ? body.purpose.trim() : null;
    if (!caseId || !releaseEventId || !recipientId || !authority || !purpose) {
      throw Object.assign(new Error("Missing required export fields"), { status: 400 });
    }

    const { data: eventId, error: requestError } = await userClient.rpc("request_case_report_export", {
      p_case_id: caseId,
      p_release_event_id: releaseEventId,
      p_recipient_id: recipientId,
      p_authority: authority,
      p_purpose: purpose,
      p_expiry_seconds: expirySeconds,
    });
    if (requestError || !eventId) throw Object.assign(new Error("Report export request failed"), { status: 400 });

    const { data: event, error: eventError } = await admin
      .from("case_report_export_events")
      .select("*,report_rendered_files(storage_bucket,storage_path,file_hash_sha256)")
      .eq("id", eventId)
      .eq("requested_by", authData.user.id)
      .single();

    if (eventError || !event) throw Object.assign(new Error("Authorised export record not found"), { status: 404 });

    const rendered = event.report_rendered_files;
    if (!rendered?.storage_bucket || !rendered?.storage_path) {
      throw Object.assign(new Error("Private report file is unavailable"), { status: 400 });
    }

    const { data: signed, error: signError } = await admin.storage
      .from(rendered.storage_bucket)
      .createSignedUrl(rendered.storage_path, expirySeconds, { download: true });
    if (signError || !signed?.signedUrl) throw Object.assign(new Error("Private download could not be issued"), { status: 400 });

    const auditPayload = {
      case_id: caseId,
      actor_user_id: authData.user.id,
      action: "secure_report_download_issued",
      resource_type: "report_export",
      resource_id: event.id,
      details: {
        report_version: event.report_version,
        expires_at: event.signed_url_expires_at,
      },
    };

    const { error: auditError } = await admin.from("audit_logs").insert(auditPayload);
    if (auditError) throw Object.assign(new Error("Audit write failed"), { status: 500 });

    return response({
      exportEventId: event.id,
      signedUrl: signed.signedUrl,
      expiresAt: event.signed_url_expires_at,
      reportVersion: event.report_version,
      fileSha256: rendered.file_hash_sha256,
    }, 200, cors);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const status = error && typeof error === "object" && "status" in error ? Number(error.status) || 400 : 400;
    return response({ error: message }, status, cors);
  }
}
