// Netlify Function — issue a fresh Google Drive access_token.
//
// The frontend calls this whenever it needs to make a Drive API call.
// We read the refresh_token from `drive_connection` (using service_role,
// bypassing RLS) and exchange it with Google for a short-lived access_token.

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// supabase-js v2 instantiates a Realtime client even when unused. In Node
// runtimes without native WebSocket (< 22) it throws. We inject `ws` so the
// function works on Node 20 or 22 alike.
const supabaseOptions = {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }
  try {
    return await handle(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    return json({ error: "unhandled_exception", detail: msg, stack }, 500);
  }
};

async function handle(req: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!anonKey) missing.push("SUPABASE_ANON_KEY");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!clientId) missing.push("GOOGLE_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (missing.length) {
    return json(
      { error: "server_misconfigured", detail: `missing env: ${missing.join(", ")}` },
      500
    );
  }

  // 1) Verify caller has a valid Supabase JWT
  const authHeader = req.headers.get("authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl!, anonKey!, {
    ...supabaseOptions,
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser(jwt);
  if (userErr || !user) return json({ error: "unauthorized" }, 401);

  // 2) Load refresh_token (service role bypasses RLS)
  const adminClient = createClient(supabaseUrl!, serviceKey!, supabaseOptions);
  const { data: row, error: rowErr } = await adminClient
    .from("drive_connection")
    .select("refresh_token")
    .limit(1)
    .maybeSingle();
  if (rowErr) {
    return json({ error: "db_read_failed", detail: rowErr.message }, 500);
  }
  if (!row?.refresh_token) {
    return json({ error: "drive_not_connected" }, 404);
  }

  // 3) Exchange refresh_token for new access_token
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
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
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
