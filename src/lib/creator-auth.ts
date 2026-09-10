import { Creator, CreatorAccount, CreatorVideo, Service } from "@/types";
import { fetchCreatorById, fetchCreators } from "@/lib/creator-store";

const SESSION_KEY = "upnext_creator_session";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function getCreatorSession(): string | null {
  return safeGet(SESSION_KEY);
}

export async function getLoggedInCreator(): Promise<Creator | undefined> {
  const creatorId = getCreatorSession();
  if (!creatorId) return undefined;
  const creator = await fetchCreatorById(creatorId);
  return creator ?? undefined;
}

export function getLoggedInCreatorSync(): Creator | undefined {
  // Prefer async getLoggedInCreator; sync helper returns undefined on server
  return undefined;
}

export async function creatorSignIn(
  email: string,
  password: string
): Promise<Creator | null> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) return null;
  const creator = (await res.json()) as Creator;
  safeSet(SESSION_KEY, creator.id);
  return creator;
}

export function creatorSignOut() {
  safeRemove(SESSION_KEY);
}

export interface RegisterCreatorInput {
  name: string;
  username: string;
  email: string;
  password: string;
  category: string;
  city: string;
  bio: string;
  whatsapp: string;
  avatar: string;
  videos: CreatorVideo[];
  services: Service[];
}

export async function registerCreator(
  input: RegisterCreatorInput
): Promise<Creator> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Registration failed.");
  }

  const creator = data as Creator;
  safeSet(SESSION_KEY, creator.id);
  return creator;
}

export async function updateCreatorProfile(
  creatorId: string,
  updates: Partial<
    Pick<
      Creator,
      | "name"
      | "bio"
      | "city"
      | "location"
      | "whatsapp"
      | "avatar"
      | "videos"
      | "category"
      | "services"
    >
  >
) {
  const creator = await fetchCreatorById(creatorId);
  if (!creator) throw new Error("Creator not found.");

  const res = await fetch(`/api/creators/${creatorId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...creator, ...updates }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update profile");
  }

  return res.json() as Promise<Creator>;
}

export type { CreatorAccount };

export async function listCreatorsForAdmin(): Promise<Creator[]> {
  return fetchCreators(false);
}
