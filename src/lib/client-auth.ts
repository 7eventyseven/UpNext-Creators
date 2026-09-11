import type { ClientProfile } from "@/types";
import { apiGet, apiSend } from "@/lib/api-client";

const ROLE_KEY = "upnext_role";

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

export async function getLoggedInClient(): Promise<ClientProfile | undefined> {
  try {
    const data = await apiGet<{ client: ClientProfile | null }>(
      "/api/auth/client"
    );
    return data.client ?? undefined;
  } catch {
    return undefined;
  }
}

export interface RegisterClientInput {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export async function registerClient(
  input: RegisterClientInput
): Promise<ClientProfile> {
  const data = await apiSend<{ client: ClientProfile }>(
    "/api/auth/client",
    "POST",
    { action: "register", ...input }
  );
  setAppRole("client");
  return data.client;
}

export async function clientSignIn(
  email: string,
  password: string
): Promise<ClientProfile> {
  const data = await apiSend<{ client: ClientProfile }>(
    "/api/auth/client",
    "POST",
    { email, password }
  );
  setAppRole("client");
  return data.client;
}

export async function clientSignOut() {
  try {
    await apiSend("/api/auth/client", "DELETE");
  } catch {
    // ignore
  }
  clearAppRole();
}
