const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers });
}

export async function handleReportDeliveryChallenge(req, { envGet, createClient }) {
  if (req.method !== "POST") return jsonResponse({ allowed: false }, 405);

  try {
    const body = await req.json();
    const token = String(body?.deliveryToken ?? "");
    const code = String(body?.verificationCode ?? "");
    if (!/^[0-9a-f]{48}$/i.test(token) || !/^[0-9]{6}$/.test(code)) {
      return jsonResponse({ allowed: false }, 400);
    }

    const url = envGet("SUPABASE_URL");
    const anon = envGet("SUPABASE_ANON_KEY");
    const service = envGet("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anon || !service) throw new Error("Delivery service is not configured");

    const publicClient = createClient(url, anon, { auth: { persistSession: false } });
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: decision, error } = await publicClient.rpc("consume_case_report_delivery", {
      p_token: token,
      p_code: code,
    });
    if (error || !decision?.allowed) return jsonResponse({ allowed: false }, 403);
    if (typeof decision.bucket !== "string" || !decision.bucket
      || typeof decision.path !== "string" || !decision.path) {
      throw new Error("Delivery unavailable");
    }

    const { data: signed, error: signError } = await admin.storage
      .from(decision.bucket)
      .createSignedUrl(decision.path, 600, { download: true });
    if (signError || !signed?.signedUrl) throw new Error("Delivery unavailable");

    return jsonResponse({
      allowed: true,
      signedUrl: signed.signedUrl,
      expiresIn: 600,
      reportVersion: decision.reportVersion,
      fileSha256: decision.fileSha256,
      notice: "Access confirms delivery interaction only; it does not indicate agreement with report contents.",
    });
  } catch {
    return jsonResponse({ allowed: false }, 400);
  }
}
