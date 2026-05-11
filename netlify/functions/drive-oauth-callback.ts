// Netlify Function — Google Drive OAuth callback
//
// Receives the authorization `code` from Google after the user grants access,
// exchanges it for an access_token + refresh_token, then stores the
// refresh_token in `public.drive_connection` (singleton row).
//
// Env vars required (set in Netlify dashboard):
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import type { Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

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

  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");
  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const serviceKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!clientId || !clientSecret || !supabaseUrl || !serviceKey) {
    return json({ error: "server_misconfigured" }, 500);
  }

  // 1) Exchange code for tokens
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
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
        detail: tokenJson.error_description || tokenJson.error || "unknown",
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
  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Delete any prior connection (only one allowed)
  await sb.from("drive_connection").delete().not("id", "is", null);

  const { error: insertErr } = await sb.from("drive_connection").insert({
    refresh_token: tokenJson.refresh_token,
    connected_email: connectedEmail,
    updated_at: new Date().toISOString(),
  });
  if (insertErr) {
    return json({ error: "db_insert_failed", detail: insertErr.message }, 500);
  }

  return json({
    ok: true,
    connectedEmail,
    accessToken: tokenJson.access_token,
    expiresIn: tokenJson.expires_in ?? 3600,
  });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
