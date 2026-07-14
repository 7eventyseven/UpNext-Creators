import { Creator, CreatorAccount, CreatorVideo, Service } from "@/types";
import { getAllCreators, saveCreator } from "@/lib/creator-store";

const ACCOUNTS_KEY = "upnext_creator_accounts";
const SESSION_KEY = "upnext_creator_session";

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

function getAccounts(): CreatorAccount[] {
  return safeParse<CreatorAccount[]>(ACCOUNTS_KEY, []);
}

function saveAccounts(accounts: CreatorAccount[]) {
  safeSet(ACCOUNTS_KEY, accounts);
}

export function getCreatorSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function getLoggedInCreator(): Creator | undefined {
  const creatorId = getCreatorSession();
  if (!creatorId) return undefined;
  return getAllCreators().find((c) => c.id === creatorId);
}

export function getLoggedInAccount(): CreatorAccount | undefined {
  const creatorId = getCreatorSession();
  if (!creatorId) return undefined;
  return getAccounts().find((a) => a.creatorId === creatorId);
}

export function creatorSignIn(email: string, password: string): Creator | null {
  const account = getAccounts().find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  if (!account) return null;

  const creator = getAllCreators().find((c) => c.id === account.creatorId);
  if (!creator) return null;

  safeSet(SESSION_KEY, creator.id);
  return creator;
}

export function creatorSignOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
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

export function registerCreator(input: RegisterCreatorInput): Creator {
  const accounts = getAccounts();
  const creators = getAllCreators();

  const emailTaken = accounts.some(
    (a) => a.email.toLowerCase() === input.email.toLowerCase()
  );
  if (emailTaken) throw new Error("An account with this email already exists.");

  const usernameTaken = creators.some(
    (c) => c.username.toLowerCase() === input.username.toLowerCase()
  );
  if (usernameTaken) throw new Error("This username is already taken.");

  const maxRank = creators.reduce((max, c) => Math.max(max, c.rank), 0);
  const creatorId = `c-${Date.now()}`;

  const creator: Creator = {
    id: creatorId,
    name: input.name,
    username: input.username.replace(/^@/, ""),
    email: input.email.toLowerCase(),
    avatar: input.avatar,
    coverImage:
      "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
    category: input.category,
    city: input.city,
    location: `${input.city}, Nigeria`,
    bio: input.bio,
    rating: 0,
    reviewCount: 0,
    completedBookings: 0,
    rank: maxRank + 1,
    isSubscribed: false,
    subscriptionTier: "free",
    whatsapp: input.whatsapp.replace(/\D/g, ""),
    services: input.services,
    tags: [input.category],
    videos: input.videos,
  };

  const account: CreatorAccount = {
    id: `acc-${Date.now()}`,
    email: input.email.toLowerCase(),
    password: input.password,
    creatorId,
    createdAt: new Date().toISOString(),
  };

  try {
    saveCreator(creator);
    saveAccounts([...accounts, account]);
    safeSet(SESSION_KEY, creatorId);
  } catch {
    throw new Error(
      "Could not save your profile. Try smaller video files or fewer uploads."
    );
  }

  return creator;
}

export function updateCreatorProfile(
  creatorId: string,
  updates: Partial<Pick<Creator, "name" | "bio" | "city" | "location" | "whatsapp" | "avatar" | "videos" | "category" | "services">>
) {
  const creator = getAllCreators().find((c) => c.id === creatorId);
  if (!creator) throw new Error("Creator not found.");
  saveCreator({ ...creator, ...updates });
}
