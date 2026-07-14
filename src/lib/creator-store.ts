import { Creator } from "@/types";
import { seedCreators } from "@/data/seed-creators";

const CREATORS_KEY = "upnext_creators";

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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — ignore so the app keeps running
  }
}

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

export function getAllCreators(): Creator[] {
  if (typeof window === "undefined") return seedCreators;
  try {
    const stored = localStorage.getItem(CREATORS_KEY);
    if (!stored) {
      safeSet(CREATORS_KEY, seedCreators);
      return seedCreators;
    }
    const parsed = safeParse<Creator[]>(CREATORS_KEY, seedCreators);
    if (!Array.isArray(parsed)) {
      safeSet(CREATORS_KEY, seedCreators);
      return seedCreators;
    }
    return parsed;
  } catch {
    safeSet(CREATORS_KEY, seedCreators);
    return seedCreators;
  }
}

export function getCreatorById(id: string): Creator | undefined {
  return getAllCreators().find((c) => c.id === id);
}

export function getSortedCreators(): Creator[] {
  return sortCreators(getAllCreators());
}

export function getCities(): string[] {
  return [...new Set(getAllCreators().map((c) => c.city))].sort();
}

export function saveCreator(creator: Creator) {
  const creators = getAllCreators();
  const idx = creators.findIndex((c) => c.id === creator.id);
  if (idx >= 0) {
    creators[idx] = creator;
  } else {
    creators.push(creator);
  }
  safeSet(CREATORS_KEY, creators);
}

export function deleteCreator(id: string) {
  const creators = getAllCreators().filter((c) => c.id !== id);
  safeSet(CREATORS_KEY, creators);
}

export function resetCreators() {
  safeSet(CREATORS_KEY, seedCreators);
}
