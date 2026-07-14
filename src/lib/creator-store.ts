import { Creator } from "@/types";
import { apiGet, apiSend } from "@/lib/api-client";
import { sortCreators } from "@/lib/sort-creators";

export async function getAllCreators(): Promise<Creator[]> {
  const data = await apiGet<{ creators: Creator[] }>("/api/creators");
  return data.creators;
}

export async function getCreatorById(id: string): Promise<Creator | undefined> {
  try {
    const data = await apiGet<{ creator: Creator }>(`/api/creators/${id}`);
    return data.creator;
  } catch {
    return undefined;
  }
}

export async function getSortedCreators(): Promise<Creator[]> {
  const creators = await getAllCreators();
  return sortCreators(creators);
}

export async function getCities(): Promise<string[]> {
  const creators = await getAllCreators();
  return [...new Set(creators.map((c) => c.city))].sort();
}

export async function saveCreator(creator: Creator): Promise<Creator> {
  const existing = await getCreatorById(creator.id);
  if (existing) {
    const data = await apiSend<{ creator: Creator }>(
      `/api/creators/${creator.id}`,
      "PUT",
      {
        ...creator,
        category: creator.category,
      }
    );
    return data.creator;
  }
  const data = await apiSend<{ creator: Creator }>("/api/creators", "POST", {
    ...creator,
    category: creator.category,
  });
  return data.creator;
}

export async function deleteCreator(id: string) {
  await apiSend(`/api/creators/${id}`, "DELETE");
}
