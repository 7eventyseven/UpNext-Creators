import type { ClientProfile } from "@/types";

const CLIENT_KEY = "upnext_client";
const ROLE_KEY = "upnext_role";

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export type AppRole = "client" | "creator" | null;

export function getAppRole(): AppRole {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(ROLE_KEY);
  if (role === "client" || role === "creator") return role;
  return null;
}

export function setAppRole(role: "client" | "creator") {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, role);
}

export function clearAppRole() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ROLE_KEY);
}

export function getClient(): ClientProfile | null {
  return safeParse<ClientProfile | null>(CLIENT_KEY, null);
}

export function saveClient(input: { name: string; phone: string }): ClientProfile {
  const existing = getClient();
  const client: ClientProfile = {
    id: existing?.id ?? `client-${Date.now()}`,
    name: input.name.trim(),
    phone: input.phone.trim(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  safeSet(CLIENT_KEY, client);
  setAppRole("client");
  return client;
}

export function clearClient() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLIENT_KEY);
}
