import { Creator, CreatorVideo, Service } from "@/types";
import { apiGet, apiSend } from "@/lib/api-client";

export async function getLoggedInCreator(): Promise<Creator | undefined> {
  try {
    const data = await apiGet<{ creator: Creator | null }>("/api/auth/creator");
    return data.creator ?? undefined;
  } catch {
    return undefined;
  }
}

export async function creatorSignIn(
  email: string,
  password: string
): Promise<Creator | null> {
  const data = await apiSend<{ creator: Creator }>("/api/auth/creator", "POST", {
    email,
    password,
  });
  return data.creator;
}

export async function creatorSignOut() {
  try {
    await apiSend("/api/auth/creator", "DELETE");
  } catch {
    // ignore
  }
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
  const data = await apiSend<{ creator: Creator }>("/api/auth/creator", "POST", {
    action: "register",
    ...input,
  });
  return data.creator;
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
  const data = await apiSend<{ creator: Creator }>(
    `/api/creators/${creatorId}`,
    "PUT",
    updates
  );
  return data.creator;
}
