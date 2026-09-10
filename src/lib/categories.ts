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

export function getCategories(): string[] {
  return defaultCategories;
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch("/api/categories", { cache: "no-store" });
  if (!res.ok) return defaultCategories;
  return res.json();
}

export async function saveCategories(categories: string[]) {
  const res = await fetch("/api/categories", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories }),
  });
  if (!res.ok) throw new Error("Failed to save categories");
  return res.json() as Promise<string[]>;
}

export async function addCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: trimmed }),
  });
  if (!res.ok) throw new Error("Failed to add category");
}

export async function removeCategory(name: string) {
  const res = await fetch(`/api/categories?name=${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove category");
}

export async function resetCategories() {
  return saveCategories(defaultCategories);
}
