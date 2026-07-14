import { apiGet, apiSend } from "@/lib/api-client";

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

export async function getCategories(): Promise<string[]> {
  try {
    const data = await apiGet<{ categories: string[] }>("/api/categories");
    return data.categories;
  } catch {
    return defaultCategories;
  }
}

export async function addCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  await apiSend("/api/categories", "POST", { name: trimmed });
}

export async function removeCategory(name: string) {
  await apiSend(`/api/categories?name=${encodeURIComponent(name)}`, "DELETE");
}

export async function resetCategories() {
  await apiSend("/api/categories", "POST", { action: "reset" });
}

export async function saveCategories(_categories: string[]) {
  // Categories are managed individually via add/remove on the API
}
