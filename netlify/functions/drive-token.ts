// Netlify Function — issue a fresh Google Drive access_token.
//
// The frontend calls this whenever it needs to make a Drive API call.
// We read the refresh_token from `drive_connection` (using service_role,
// bypassing RLS) and exchange it with Google for a short-lived access_token.
//
// Caller must include a valid Supabase user JWT in the Authorization header.
// This protects the endpoint from anonymous callers.
//
// Env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
//           SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import type { Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const anonKey = Netlify.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");
  if (!supabaseUrl || !anonKey || !serviceKey || !clientId || !clientSecret) {
    return json({ error: "server_misconfigured" }, 500);
  }

  // 1) Verify caller has a valid Supabase JWT
  const authHeader = req.headers.get("authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser(jwt);
  if (userErr || !user) return json({ error: "unauthorized" }, 401);

  // 2) Load refresh_token (service role bypasses RLS)
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const { data: row, error: rowErr } = await adminClient
    .from("drive_connection")
    .select("refresh_token")
    .limit(1)
    .maybeSingle();
  if (rowErr) return json({ error: "db_read_failed", detail: rowErr.message }, 500);
  if (!row?.refresh_token) return json({ error: "drive_not_connected" }, 404);

  // 3) Exchange refresh_token for new access_token
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: row.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokenJson.access_token) {
    // If Google says the refresh_token is invalid (revoked / expired),
    // the connection is dead — surface a specific error so the UI can
    // prompt the user to reconnect.
    const dead =
      tokenJson.error === "invalid_grant" ||
      tokenJson.error === "unauthorized_client";
    return json(
      {
        error: dead ? "drive_disconnected" : "token_refresh_failed",
        detail: tokenJson.error_description || tokenJson.error,
      },
      dead ? 401 : 500
    );
  }

  return json({
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
