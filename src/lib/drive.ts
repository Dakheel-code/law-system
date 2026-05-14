// Google Drive client wrapper.
//
// All Drive API calls go through here. Access tokens are obtained from
// our Netlify function `/.netlify/functions/drive-token` (which holds the
// refresh_token server-side) and cached in memory.
//
// Supports both modes:
//   1) "My Drive"     — files live under a "ناصر طريد" folder in the
//      connected user's personal Drive.
//   2) Shared Drive   — files live directly inside an organization-owned
//      Shared Drive (Workspace feature). The Shared Drive ID is stored
//      on `drive_connection.shared_drive_id`.

import { supabase } from "./supabase";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const ROOT_FOLDER_NAME = "ناصر طريد";
const CASES_FOLDER_NAME = "قضايا";
const CLIENTS_FOLDER_NAME = "عملاء";
const TASKS_FOLDER_NAME = "مهام";
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

// ----------------------------------------------------------------
// Token
// ----------------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null;

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

// ----------------------------------------------------------------
// Shared Drive state — cached after the first read
// ----------------------------------------------------------------

let sharedDriveCache: { id: string | null; loadedAt: number } | null = null;
const SHARED_DRIVE_CACHE_TTL = 60_000; // 1 minute

async function getSharedDriveId(): Promise<string | null> {
  if (
    sharedDriveCache &&
    Date.now() - sharedDriveCache.loadedAt < SHARED_DRIVE_CACHE_TTL
  ) {
    return sharedDriveCache.id;
  }
  if (!supabase) return null;
  const { data } = await supabase.rpc("drive_connection_status");
  const row = Array.isArray(data) ? data[0] : data;
  const id = row?.shared_drive_id ?? null;
  sharedDriveCache = { id, loadedAt: Date.now() };
  return id;
}

/** Force a re-read of Shared Drive config (e.g. after the user updates it). */
export function invalidateSharedDriveCache() {
  sharedDriveCache = null;
}

// ----------------------------------------------------------------
// Authenticated fetch with Shared-Drive aware params
// ----------------------------------------------------------------

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

/** Add Shared Drive search params (or `supportsAllDrives` for non-shared ops). */
async function withDriveParams(extra: Record<string, string> = {}, forList = false) {
  const sharedId = await getSharedDriveId();
  const params = new URLSearchParams(extra);
  params.set("supportsAllDrives", "true");
  if (sharedId && forList) {
    params.set("includeItemsFromAllDrives", "true");
    params.set("corpora", "drive");
    params.set("driveId", sharedId);
  }
  return params;
}

// ----------------------------------------------------------------
// Folders
// ----------------------------------------------------------------

async function findFolder(
  name: string,
  parentId: string
): Promise<string | null> {
  const q = [
    `mimeType='${FOLDER_MIME}'`,
    `name='${escapeQ(name)}'`,
    "trashed=false",
    `'${parentId}' in parents`,
  ].join(" and ");
  const params = await withDriveParams(
    { q, fields: "files(id,name)", pageSize: "1", spaces: "drive" },
    /* forList */ true
  );
  const res = await driveFetch(`/files?${params}`);
  const { files } = (await res.json()) as { files: { id: string; name: string }[] };
  return files?.[0]?.id ?? null;
}

async function createFolder(name: string, parentId: string): Promise<string> {
  const params = await withDriveParams({ fields: "id" });
  const res = await driveFetch(`/files?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      parents: [parentId],
    }),
  });
  const { id } = (await res.json()) as { id: string };
  return id;
}

async function ensureFolder(name: string, parentId: string): Promise<string> {
  const existing = await findFolder(name, parentId);
  if (existing) return existing;
  return createFolder(name, parentId);
}

/**
 * Ensure the office folder hierarchy exists.
 *  - Shared Drive mode: skip the "ناصر طريد" wrapper; create "قضايا" and "عملاء"
 *    directly inside the Shared Drive root.
 *  - Personal Drive mode: create "ناصر طريد" under My Drive, then the two
 *    subfolders inside it.
 */
export async function ensureOfficeFolders(): Promise<{
  rootId: string;
  casesId: string;
  clientsId: string;
}> {
  if (!supabase) throw new Error("Supabase not configured");

  // Cache check
  const { data } = await supabase.rpc("drive_connection_status");
  const row = Array.isArray(data) ? data[0] : data;
  let rootId = row?.root_folder_id ?? null;
  let casesId = row?.cases_folder_id ?? null;
  let clientsId = row?.clients_folder_id ?? null;

  if (rootId && !(await folderExists(rootId))) rootId = null;
  if (casesId && !(await folderExists(casesId))) casesId = null;
  if (clientsId && !(await folderExists(clientsId))) clientsId = null;

  const sharedId = await getSharedDriveId();
  let changed = false;

  if (sharedId) {
    // Shared Drive IS the root; do NOT create a "ناصر طريد" wrapper.
    if (rootId !== sharedId) {
      rootId = sharedId;
      changed = true;
    }
    if (!casesId) {
      casesId = await ensureFolder(CASES_FOLDER_NAME, sharedId);
      changed = true;
    }
    if (!clientsId) {
      clientsId = await ensureFolder(CLIENTS_FOLDER_NAME, sharedId);
      changed = true;
    }
  } else {
    // Personal Drive — use the user's My Drive root.
    if (!rootId) {
      rootId = await ensureFolder(ROOT_FOLDER_NAME, "root");
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
  }

  if (changed) {
    const { error } = await supabase.rpc("drive_connection_update_folders", {
      p_root_folder_id: rootId,
      p_cases_folder_id: casesId,
      p_clients_folder_id: clientsId,
    });
    // Surface the error instead of swallowing it — silent failures here were
    // a real source of confusion (e.g. Supabase's safe-update setting blocks
    // unfiltered UPDATEs even inside SECURITY DEFINER functions).
    if (error) {
      throw new Error(`فشل تحديث مجلدات Drive في DB: ${error.message}`);
    }
  }

  return { rootId: rootId!, casesId: casesId!, clientsId: clientsId! };
}

async function folderExists(id: string): Promise<boolean> {
  // Shared Drive roots are NOT files in the Drive API — they live under
  // /drives/{id}, not /files/{id}. GET /files/<sharedDriveId> returns 404.
  // Trust that the configured Shared Drive exists; only verify regular folders.
  const sharedId = await getSharedDriveId();
  if (sharedId && id === sharedId) return true;

  try {
    const params = await withDriveParams({ fields: "id,trashed,mimeType" });
    await driveFetch(`/files/${encodeURIComponent(id)}?${params}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get-or-create the top-level "مهام" folder. Stored as a flat sibling of
 * "قضايا" / "عملاء" but resolved by name each time (we don't persist its id
 * in drive_connection so we avoid a migration).
 */
async function ensureTasksFolder(): Promise<string> {
  const { rootId } = await ensureOfficeFolders();
  return ensureFolder(TASKS_FOLDER_NAME, rootId);
}

const SESSIONS_FOLDER_NAME = "الجلسات";
const LEAVES_FOLDER_NAME = "إجازات";

/** Get-or-create the top-level "إجازات" folder. */
async function ensureLeavesFolder(): Promise<string> {
  const { rootId } = await ensureOfficeFolders();
  return ensureFolder(LEAVES_FOLDER_NAME, rootId);
}

/**
 * Get or create the per-session folder nested as:
 *   <case folder> / الجلسات / <session display name>
 * Cached in drive_folders with entity_type='session'.
 */
export async function ensureSessionFolder(
  caseId: string,
  caseDisplayName: string,
  sessionId: string,
  sessionDisplayName: string
): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data: existing } = await supabase
    .from("drive_folders")
    .select("folder_id")
    .eq("entity_type", "session")
    .eq("entity_id", sessionId)
    .maybeSingle();

  if (existing?.folder_id) {
    if (await folderExists(existing.folder_id)) return existing.folder_id;
    await supabase
      .from("drive_folders")
      .delete()
      .eq("entity_type", "session")
      .eq("entity_id", sessionId);
  }

  const caseFolderId = await ensureEntityFolder("case", caseId, caseDisplayName);
  const sessionsRoot = await ensureFolder(SESSIONS_FOLDER_NAME, caseFolderId);
  const sessionFolderId = await ensureFolder(sessionDisplayName, sessionsRoot);

  const { error } = await supabase.from("drive_folders").insert({
    entity_type: "session",
    entity_id: sessionId,
    folder_id: sessionFolderId,
  });
  if (error) {
    // Non-fatal — caching only. The folder still exists in Drive.
    console.warn("session folder cache insert failed:", error.message);
  }

  return sessionFolderId;
}

/** Upload a file into the per-session folder. */
export async function uploadSessionFile(
  caseId: string,
  caseDisplayName: string,
  sessionId: string,
  sessionDisplayName: string,
  file: File,
  onProgress?: (loaded: number, total: number) => void
): Promise<DriveFile> {
  const folderId = await ensureSessionFolder(
    caseId,
    caseDisplayName,
    sessionId,
    sessionDisplayName
  );
  return uploadFile(folderId, file, onProgress);
}

/** Get or create the folder for a case/client/task/leave. */
export async function ensureEntityFolder(
  entityType: "case" | "client" | "task" | "leave",
  entityId: string,
  displayName: string
): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data: existing } = await supabase
    .from("drive_folders")
    .select("folder_id")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();

  if (existing?.folder_id) {
    if (await folderExists(existing.folder_id)) return existing.folder_id;
    await supabase
      .from("drive_folders")
      .delete()
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);
  }

  let parentId: string;
  if (entityType === "case") {
    parentId = (await ensureOfficeFolders()).casesId;
  } else if (entityType === "client") {
    parentId = (await ensureOfficeFolders()).clientsId;
  } else if (entityType === "leave") {
    parentId = await ensureLeavesFolder();
  } else {
    parentId = await ensureTasksFolder();
  }
  const folderId = await ensureFolder(displayName, parentId);

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

export async function listFiles(folderId: string): Promise<DriveFile[]> {
  const params = await withDriveParams(
    {
      q: `'${folderId}' in parents and trashed=false`,
      fields:
        "files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink,parents)",
      orderBy: "folder,name",
      pageSize: "200",
    },
    /* forList */ true
  );
  const res = await driveFetch(`/files?${params}`);
  const { files } = (await res.json()) as { files: DriveFile[] };
  return files ?? [];
}

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

  const params = new URLSearchParams({
    uploadType: "multipart",
    supportsAllDrives: "true",
    fields:
      "id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink,parents",
  });

  return new Promise<DriveFile>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${DRIVE_UPLOAD_API}/files?${params}`);
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

/**
 * High-level helper: upload a single file to the folder for a given entity
 * (auto-creating that folder under the office hierarchy if needed).
 */
export async function uploadEntityFile(
  entityType: "case" | "client" | "task" | "leave",
  entityId: string,
  entityDisplayName: string,
  file: File,
  onProgress?: (loaded: number, total: number) => void
): Promise<DriveFile> {
  const folderId = await ensureEntityFolder(
    entityType,
    entityId,
    entityDisplayName
  );
  return uploadFile(folderId, file, onProgress);
}

export async function deleteFile(fileId: string): Promise<void> {
  const params = await withDriveParams();
  await driveFetch(`/files/${encodeURIComponent(fileId)}?${params}`, {
    method: "DELETE",
  });
}

export async function createSubfolder(
  parentId: string,
  name: string
): Promise<DriveFile> {
  const params = await withDriveParams({
    fields: "id,name,mimeType,modifiedTime,parents",
  });
  const res = await driveFetch(`/files?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      parents: [parentId],
    }),
  });
  return (await res.json()) as DriveFile;
}

/**
 * Move a file or folder from one parent to another (Drive's "move" op).
 * No-op if the source and destination parents are the same.
 */
export async function moveItem(
  itemId: string,
  fromParentId: string,
  toParentId: string
): Promise<void> {
  if (fromParentId === toParentId) return;
  const params = await withDriveParams({ fields: "id,parents" });
  params.set("addParents", toParentId);
  params.set("removeParents", fromParentId);
  await driveFetch(`/files/${encodeURIComponent(itemId)}?${params}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
}

export async function renameFile(
  fileId: string,
  newName: string
): Promise<DriveFile> {
  const params = await withDriveParams({
    fields: "id,name,mimeType,modifiedTime",
  });
  const res = await driveFetch(`/files/${encodeURIComponent(fileId)}?${params}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName }),
  });
  return (await res.json()) as DriveFile;
}

export async function getOrCreateAnyoneLink(fileId: string): Promise<string> {
  const params = await withDriveParams();
  await driveFetch(
    `/files/${encodeURIComponent(fileId)}/permissions?${params}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  ).catch(() => undefined);
  const linkParams = await withDriveParams({ fields: "webViewLink" });
  const res = await driveFetch(
    `/files/${encodeURIComponent(fileId)}?${linkParams}`
  );
  const { webViewLink } = (await res.json()) as { webViewLink: string };
  return webViewLink;
}

// ----------------------------------------------------------------
// OAuth flow helper
// ----------------------------------------------------------------

// Full Drive scope — required to see files added to the Shared Drive outside
// the app (e.g. uploaded directly in Google Drive UI). The narrower
// `drive.file` would only show files the app itself created.
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

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
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

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

export async function disconnectDrive(): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("drive_connection")
    .delete()
    .not("id", "is", null);
  if (error) {
    throw new Error(`فشل الفصل من DB: ${error.message}`);
  }
  cachedToken = null;
  sharedDriveCache = null;
}

/** Persist (or clear) the Shared Drive ID. Wipes cached folder mappings. */
export async function setSharedDriveId(id: string | null): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.rpc("drive_connection_set_shared_drive", {
    p_shared_drive_id: id ?? "",
  });
  if (error) throw new Error(error.message);
  invalidateSharedDriveCache();
}

/** Parse a Shared Drive ID from a URL or raw ID. */
export function parseSharedDriveInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // URL patterns:
  //   https://drive.google.com/drive/folders/<ID>
  //   https://drive.google.com/drive/u/0/folders/<ID>
  const m = trimmed.match(/\/folders\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  // Otherwise treat as raw ID
  return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : null;
}

// ----------------------------------------------------------------
// Utils
// ----------------------------------------------------------------

function escapeQ(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
