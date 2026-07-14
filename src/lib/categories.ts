const CATEGORIES_KEY = "upnext_categories";

export const defaultCategories = [
  "Photography",
  "Music Production",
  "Makeup & Beauty",
  "Videography",
  "Graphic Design",
  "Content Creation",
  "Fashion & Styling",
  "Writing & Copy",
];

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

export function getCategories(): string[] {
  if (typeof window === "undefined") return defaultCategories;
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) {
    safeSet(CATEGORIES_KEY, defaultCategories);
    return defaultCategories;
  }
  return safeParse<string[]>(CATEGORIES_KEY, defaultCategories);
}

export function saveCategories(categories: string[]) {
  safeSet(CATEGORIES_KEY, categories);
}

export function addCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const categories = getCategories();
  if (!categories.includes(trimmed)) {
    saveCategories([...categories, trimmed].sort());
  }
}

export function removeCategory(name: string) {
  saveCategories(getCategories().filter((c) => c !== name));
}

export function resetCategories() {
  safeSet(CATEGORIES_KEY, defaultCategories);
}
