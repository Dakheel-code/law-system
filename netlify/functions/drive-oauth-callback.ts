// Netlify Function — Google Drive OAuth callback
//
// Receives the authorization `code` from Google after the user grants access,
// exchanges it for an access_token + refresh_token, then stores the
// refresh_token in `public.drive_connection` (singleton row).

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// supabase-js v2 instantiates a Realtime client even when unused. In Node
// runtimes without native WebSocket (< 22) it throws. We inject `ws` as the
// transport explicitly so the function works on Node 20 or 22 alike.
const supabaseOptions = {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    return await handle(req);
  } catch (e) {
    // Surface the real error message so the UI can show it instead of 502
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    return json({ error: "unhandled_exception", detail: msg, stack }, 500);
  }
};

async function handle(req: Request): Promise<Response> {
  let body: { code?: string; redirectUri?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const { code, redirectUri } = body;
  if (!code || !redirectUri) {
    return json({ error: "missing_code_or_redirect" }, 400);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missing: string[] = [];
  if (!clientId) missing.push("GOOGLE_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) {
    return json(
      { error: "server_misconfigured", detail: `missing env: ${missing.join(", ")}` },
      500
    );
  }

  // 1) Exchange code for tokens
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code!,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri!,
      grant_type: "authorization_code",
    }),
  });
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!tokenRes.ok || !tokenJson.access_token || !tokenJson.refresh_token) {
    return json(
      {
        error: "token_exchange_failed",
        detail:
          tokenJson.error_description ||
          tokenJson.error ||
          `google_status_${tokenRes.status}`,
      },
      400
    );
  }

  // 2) Fetch user email (which Google account we're connected to)
  let connectedEmail: string | null = null;
  try {
    const infoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (infoRes.ok) {
      const info = (await infoRes.json()) as { email?: string };
      connectedEmail = info.email ?? null;
    }
  } catch {
    // Non-fatal — email is informational only.
  }

  // 3) Upsert into singleton drive_connection (service role bypasses RLS)
  const sb = createClient(supabaseUrl!, serviceKey!, supabaseOptions);

  // Check if a row already exists
  const { data: existing, error: selectErr } = await sb
    .from("drive_connection")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (selectErr) {
    return json(
      { error: "db_select_failed", detail: selectErr.message },
      500
    );
  }

  const payload = {
    refresh_token: tokenJson.refresh_token,
    connected_email: connectedEmail,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error: updateErr } = await sb
      .from("drive_connection")
      .update(payload)
      .eq("id", existing.id);
    if (updateErr) {
      return json(
        { error: "db_update_failed", detail: updateErr.message },
        500
      );
    }
  } else {
    const { error: insertErr } = await sb
      .from("drive_connection")
      .insert(payload);
    if (insertErr) {
      return json(
        { error: "db_insert_failed", detail: insertErr.message },
        500
      );
    }
  }

  return json({
    ok: true,
    connectedEmail,
    accessToken: tokenJson.access_token,
    expiresIn: tokenJson.expires_in ?? 3600,
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
