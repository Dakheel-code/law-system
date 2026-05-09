import { useEffect, useState } from "react";

export type UserRecord = {
  id: string;
  type: string;
  fullName: string;
  firstName: string;
  middleName: string;
  thirdName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  nationality: string;
  avatarDataUrl: string | null;
  status: "active" | "inactive";
  createdAt: string;
};

const STORAGE_KEY = "law-system-users";

function readAll(): UserRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserRecord[];
  } catch {
    return [];
  }
}

function writeAll(users: UserRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event("law-system-users-updated"));
}

export function listUsers(): UserRecord[] {
  return readAll();
}

export function addUser(user: Omit<UserRecord, "createdAt" | "status"> & {
  status?: UserRecord["status"];
}): UserRecord {
  const record: UserRecord = {
    ...user,
    status: user.status ?? "active",
    createdAt: new Date().toISOString(),
  };
  const all = readAll();
  all.unshift(record);
  writeAll(all);
  return record;
}

export function deleteUser(id: string) {
  writeAll(readAll().filter((u) => u.id !== id));
}

export function updateUser(id: string, patch: Partial<UserRecord>) {
  writeAll(readAll().map((u) => (u.id === id ? { ...u, ...patch } : u)));
}

export function generateUserId(): string {
  return "USR-" + Math.floor(10000 + Math.random() * 90000);
}

// React hook that re-renders when users change (from any tab)
export function useUsers() {
  const [users, setUsers] = useState<UserRecord[]>(readAll);

  useEffect(() => {
    const refresh = () => setUsers(readAll());
    window.addEventListener("storage", refresh);
    window.addEventListener("law-system-users-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("law-system-users-updated", refresh);
    };
  }, []);

  return users;
}
