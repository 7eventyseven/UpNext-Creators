import type { Creator } from "@/types";
import { seedCreators } from "@/data/seed-creators";

function sortCreators(list: Creator[]): Creator[] {
  return [...list].sort((a, b) => {
    if (a.isSubscribed !== b.isSubscribed) return a.isSubscribed ? -1 : 1;
    if (a.subscriptionTier !== b.subscriptionTier) {
      const tierOrder = { premium: 0, pro: 1, free: 2 };
      return tierOrder[a.subscriptionTier] - tierOrder[b.subscriptionTier];
    }
    return a.rank - b.rank;
  });
}

/** Sync helpers keep SSR / first paint working; clients should prefer async API. */
export function getAllCreators(): Creator[] {
  return seedCreators;
}

export function getCreatorById(id: string): Creator | undefined {
  return seedCreators.find((c) => c.id === id);
}

export function getSortedCreators(): Creator[] {
  return sortCreators(seedCreators);
}

export function getCities(): string[] {
  return [...new Set(seedCreators.map((c) => c.city))].sort();
}

export async function fetchCreators(sorted = false): Promise<Creator[]> {
  const res = await fetch(`/api/creators${sorted ? "?sorted=1" : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load creators");
  return res.json();
}

export async function fetchCreatorById(id: string): Promise<Creator | null> {
  const res = await fetch(`/api/creators/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load creator");
  return res.json();
}

export async function saveCreator(creator: Creator): Promise<Creator> {
  const exists = await fetch(`/api/creators/${creator.id}`, { cache: "no-store" });
  const method = exists.ok ? "PUT" : "POST";
  const url = exists.ok ? `/api/creators/${creator.id}` : "/api/creators";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creator),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to save creator");
  }

  return res.json();
}

export async function deleteCreator(id: string): Promise<void> {
  const res = await fetch(`/api/creators/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete creator");
}

export async function resetCreators(): Promise<void> {
  // Admin can re-seed via `npm run db:seed`
  throw new Error("Use npm run db:seed to reset creators in the database.");
}
