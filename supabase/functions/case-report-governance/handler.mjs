export const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

export function corsHeaders(req, envGet) {
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

export function rejectionHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin ?? "null",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

export function requireString(value, field) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} is required`);
  return text;
}

export async function handleCaseReportGovernance(req, { envGet, createUserClient }) {
  const cors = corsHeaders(req, envGet);
  if (!cors) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: rejectionHeaders(req.headers.get("origin")) },
    );
  }
  if (req.method === "OPTIONS") return new Response("ok", { headers: { ...cors, ...jsonHeaders } });
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...cors, ...jsonHeaders } },
    );
  }

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Authentication required");

    const userClient = createUserClient(
      envGet("SUPABASE_URL"),
      envGet("SUPABASE_ANON_KEY"),
      authorization,
    );

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw new Error("Authentication failed");

    const body = await req.json();
    const action = requireString(body.action, "action");

    if (action === "decide_version") {
      const { data, error } = await userClient.rpc("decide_case_report_version", {
        p_case_id: requireString(body.caseId, "caseId"),
        p_report_id: requireString(body.reportId, "reportId"),
        p_report_version_id: requireString(body.reportVersionId, "reportVersionId"),
        p_decision: requireString(body.decision, "decision"),
        p_decision_reason: String(body.decisionReason ?? ""),
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, action, approvalId: data }), { headers: { ...cors, ...jsonHeaders } });
    }

    if (action === "release_version") {
      const { data, error } = await userClient.rpc("release_case_report_version", {
        p_case_id: requireString(body.caseId, "caseId"),
        p_report_id: requireString(body.reportId, "reportId"),
        p_report_version_id: requireString(body.reportVersionId, "reportVersionId"),
        p_rendered_file_id: requireString(body.renderedFileId, "renderedFileId"),
        p_release_notes: String(body.releaseNotes ?? ""),
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, action, releaseEventId: data }), { headers: { ...cors, ...jsonHeaders } });
    }

    throw new Error("Unsupported action");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400, headers: { ...cors, ...jsonHeaders } });
  }
}
