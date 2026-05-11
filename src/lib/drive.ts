// Google Drive client wrapper.
//
// All Drive API calls go through here. Access tokens are obtained from
// our Netlify function `/api/drive/token` (which holds the refresh_token
// server-side) and cached in memory for the duration of their lifetime.

import { supabase } from "./supabase";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const ROOT_FOLDER_NAME = "ناصر طريد";
const CASES_FOLDER_NAME = "قضايا";
const CLIENTS_FOLDER_NAME = "عملاء";
const FOLDER_MIME = "application/vnd.google-apps.folder";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
};

// In-memory access token cache.
let cachedToken: { value: string; expiresAt: number } | null = null;

/** Get a fresh access token (refreshes via Netlify function when needed). */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }
  if (!supabase) throw new Error("Supabase not configured");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("not_authenticated");

  const res = await fetch("/.netlify/functions/drive-token", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 401 && body.error === "drive_disconnected") {
      throw new DriveDisconnectedError();
    }
    if (res.status === 404 && body.error === "drive_not_connected") {
      throw new DriveNotConnectedError();
    }
    throw new Error(`token_fetch_failed: ${body.error || res.statusText}`);
  }
  const { accessToken, expiresIn } = (await res.json()) as {
    accessToken: string;
    expiresIn: number;
  };
  cachedToken = {
    value: accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return accessToken;
}

export class DriveNotConnectedError extends Error {
  constructor() {
    super("Drive is not connected. Connect it from /admin.");
    this.name = "DriveNotConnectedError";
  }
}
export class DriveDisconnectedError extends Error {
  constructor() {
    super("Drive connection has been revoked. Reconnect from /admin.");
    this.name = "DriveDisconnectedError";
  }
}

/** Authenticated fetch against the Drive REST API. */
async function driveFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${DRIVE_API}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive API ${res.status}: ${text}`);
  }
  return res;
}

// ----------------------------------------------------------------
// Folders
// ----------------------------------------------------------------

/** Look up a folder by name under a given parent. Returns id or null. */
async function findFolder(name: string, parentId?: string): Promise<string | null> {
  const q = [
    `mimeType='${FOLDER_MIME}'`,
    `name='${escapeQ(name)}'`,
    "trashed=false",
    parentId ? `'${parentId}' in parents` : "",
  ]
    .filter(Boolean)
    .join(" and ");
  const params = new URLSearchParams({
    q,
    fields: "files(id,name)",
    pageSize: "1",
    // With drive.file scope we can only see files our app created.
    spaces: "drive",
  });
  const res = await driveFetch(`/files?${params}`);
  const { files } = (await res.json()) as { files: { id: string; name: string }[] };
  return files?.[0]?.id ?? null;
}

/** Create a folder under parent (or My Drive if no parent). Returns id. */
async function createFolder(name: string, parentId?: string): Promise<string> {
  const res = await driveFetch("/files?fields=id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      parents: parentId ? [parentId] : undefined,
    }),
  });
  const { id } = (await res.json()) as { id: string };
  return id;
}

/** Get or create a folder by name under parent. */
async function ensureFolder(name: string, parentId?: string): Promise<string> {
  const existing = await findFolder(name, parentId);
  if (existing) return existing;
  return createFolder(name, parentId);
}

/**
 * Ensure the office folder hierarchy exists. Caches the IDs in
 * `drive_connection` to avoid repeating the lookups on every call.
 */
export async function ensureOfficeFolders(): Promise<{
  rootId: string;
  casesId: string;
  clientsId: string;
}> {
  if (!supabase) throw new Error("Supabase not configured");

  // Try cache first (via SECURITY DEFINER function — safe columns only)
  const { data } = await supabase.rpc("drive_connection_status");
  const row = Array.isArray(data) ? data[0] : data;

  let rootId = row?.root_folder_id ?? null;
  let casesId = row?.cases_folder_id ?? null;
  let clientsId = row?.clients_folder_id ?? null;

  // Verify cached folders still exist (they may have been deleted in Drive UI)
  if (rootId && !(await folderExists(rootId))) rootId = null;
  if (casesId && !(await folderExists(casesId))) casesId = null;
  if (clientsId && !(await folderExists(clientsId))) clientsId = null;

  let changed = false;
  if (!rootId) {
    rootId = await ensureFolder(ROOT_FOLDER_NAME);
    changed = true;
  }
  if (!casesId) {
    casesId = await ensureFolder(CASES_FOLDER_NAME, rootId);
    changed = true;
  }
  if (!clientsId) {
    clientsId = await ensureFolder(CLIENTS_FOLDER_NAME, rootId);
    changed = true;
  }

  if (changed) {
    // SECURITY DEFINER function — frontend cannot update refresh_token directly.
    await supabase.rpc("drive_connection_update_folders", {
      p_root_folder_id: rootId,
      p_cases_folder_id: casesId,
      p_clients_folder_id: clientsId,
    });
  }

  return { rootId, casesId, clientsId };
}

async function folderExists(id: string): Promise<boolean> {
  try {
    await driveFetch(
      `/files/${encodeURIComponent(id)}?fields=id,trashed,mimeType`
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Get or create the folder for a case/client. Stores the mapping in
 * `drive_folders` so subsequent calls are a single DB read.
 */
export async function ensureEntityFolder(
  entityType: "case" | "client",
  entityId: string,
  displayName: string
): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  // 1) Check mapping
  const { data: existing } = await supabase
    .from("drive_folders")
    .select("folder_id")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();

  if (existing?.folder_id) {
    // Verify it still exists in Drive (user may have deleted it manually)
    if (await folderExists(existing.folder_id)) return existing.folder_id;
    // Stale mapping — wipe and recreate below
    await supabase
      .from("drive_folders")
      .delete()
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);
  }

  // 2) Create under the appropriate parent
  const { casesId, clientsId } = await ensureOfficeFolders();
  const parentId = entityType === "case" ? casesId : clientsId;
  const folderId = await ensureFolder(displayName, parentId);

  // 3) Cache mapping
  await supabase.from("drive_folders").insert({
    entity_type: entityType,
    entity_id: entityId,
    folder_id: folderId,
    folder_name: displayName,
  });

  return folderId;
}

// ----------------------------------------------------------------
// Files
// ----------------------------------------------------------------

/** List files in a folder. */
export async function listFiles(folderId: string): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    fields:
      "files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink,parents)",
    orderBy: "folder,name",
    pageSize: "200",
  });
  const res = await driveFetch(`/files?${params}`);
  const { files } = (await res.json()) as { files: DriveFile[] };
  return files ?? [];
}

/** Upload a file to a specific folder. */
export async function uploadFile(
  folderId: string,
  file: File,
  onProgress?: (loaded: number, total: number) => void
): Promise<DriveFile> {
  const token = await getAccessToken();
  const metadata = { name: file.name, parents: [folderId] };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", file);

  // Use XHR so we can report upload progress.
  return new Promise<DriveFile>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink,parents`
    );
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded, e.total);
    };
    xhr.onerror = () => reject(new Error("upload_network_error"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as DriveFile);
      } else {
        reject(new Error(`upload_failed: ${xhr.status} ${xhr.responseText}`));
      }
    };
    xhr.send(form);
  });
}

/** Permanently delete a file (or folder). */
export async function deleteFile(fileId: string): Promise<void> {
  await driveFetch(`/files/${encodeURIComponent(fileId)}`, { method: "DELETE" });
}

/** Create a subfolder. */
export async function createSubfolder(
  parentId: string,
  name: string
): Promise<DriveFile> {
  const res = await driveFetch(
    "/files?fields=id,name,mimeType,modifiedTime,parents",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mimeType: FOLDER_MIME,
        parents: [parentId],
      }),
    }
  );
  return (await res.json()) as DriveFile;
}

/** Rename a file or folder. */
export async function renameFile(
  fileId: string,
  newName: string
): Promise<DriveFile> {
  const res = await driveFetch(
    `/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,modifiedTime`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    }
  );
  return (await res.json()) as DriveFile;
}

/** Generate a public webViewLink for a file (requires permission grant). */
export async function getOrCreateAnyoneLink(fileId: string): Promise<string> {
  // Make file readable by anyone with the link
  await driveFetch(`/files/${encodeURIComponent(fileId)}/permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  }).catch(() => undefined);
  const res = await driveFetch(
    `/files/${encodeURIComponent(fileId)}?fields=webViewLink`
  );
  const { webViewLink } = (await res.json()) as { webViewLink: string };
  return webViewLink;
}

// ----------------------------------------------------------------
// OAuth flow helper
// ----------------------------------------------------------------

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export function buildAuthUrl(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID not set");
  const redirectUri = `${window.location.origin}/oauth/drive/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: `${DRIVE_SCOPE} email`,
    access_type: "offline",
    prompt: "consent", // force refresh_token issuance even on re-auth
    include_granted_scopes: "true",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Send the auth `code` to our Netlify function to complete the connection. */
export async function exchangeCode(code: string): Promise<{
  connectedEmail: string | null;
  accessToken: string;
  expiresIn: number;
}> {
  const redirectUri = `${window.location.origin}/oauth/drive/callback`;
  const res = await fetch("/.netlify/functions/drive-oauth-callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri }),
  });
  const body = (await res.json()) as {
    ok?: boolean;
    error?: string;
    detail?: string;
    connectedEmail?: string | null;
    accessToken?: string;
    expiresIn?: number;
  };
  if (!res.ok || !body.ok || !body.accessToken) {
    throw new Error(body.detail || body.error || "oauth_exchange_failed");
  }
  // Seed the token cache so the first Drive call doesn't need a refresh round-trip.
  cachedToken = {
    value: body.accessToken,
    expiresAt: Date.now() + (body.expiresIn ?? 3600) * 1000,
  };
  return {
    connectedEmail: body.connectedEmail ?? null,
    accessToken: body.accessToken,
    expiresIn: body.expiresIn ?? 3600,
  };
}

/** Disconnect: delete the row (RLS allows authenticated delete). */
export async function disconnectDrive(): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  await supabase.from("drive_connection").delete().not("id", "is", null);
  cachedToken = null;
}

// ----------------------------------------------------------------
// Utils
// ----------------------------------------------------------------

function escapeQ(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
