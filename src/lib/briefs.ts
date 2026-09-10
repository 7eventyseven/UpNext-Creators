import type { Brief, BriefInvite, Creator } from "@/types";

const BRIEFS_KEY = "upnext_briefs";

export const budgetOptions = [
  { value: "under-50k", label: "Under ₦50,000" },
  { value: "50k-150k", label: "₦50,000 – ₦150,000" },
  { value: "150k-500k", label: "₦150,000 – ₦500,000" },
  { value: "500k-plus", label: "₦500,000+" },
  { value: "flexible", label: "Flexible / discuss" },
] as const;

export const occasionByCategory: Record<string, string[]> = {
  Photography: ["Wedding", "Portrait", "Birthday", "Corporate", "Product", "Other"],
  Videography: ["Wedding film", "Event coverage", "Music video", "Brand film", "Other"],
  "Makeup & Beauty": ["Wedding glam", "Photoshoot", "Event look", "Bridal party", "Other"],
  "Music Production": ["Beat / song", "Mixing", "Live session", "Album project", "Other"],
  "Graphic Design": ["Logo / brand", "Flyer", "Social creatives", "Packaging", "Other"],
  "Content Creation": ["UGC ads", "Social content", "Influencer collab", "Other"],
  "Fashion & Styling": ["Editorial", "Personal styling", "Event look", "Other"],
  "Writing & Copy": ["Brand copy", "Script", "Blog / article", "Other"],
};

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

export function getBriefs(): Brief[] {
  return safeParse<Brief[]>(BRIEFS_KEY, []);
}

export function getBriefById(id: string): Brief | undefined {
  return getBriefs().find((b) => b.id === id);
}

export function getClientBriefs(clientId: string): Brief[] {
  return getBriefs()
    .filter((b) => b.clientId === clientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCreatorInvites(creatorId: string): Array<Brief & { myInvite: BriefInvite }> {
  return getBriefs()
    .map((brief) => {
      const myInvite = brief.invites.find((i) => i.creatorId === creatorId);
      if (!myInvite) return null;
      return { ...brief, myInvite };
    })
    .filter((b): b is Brief & { myInvite: BriefInvite } => b !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function scoreCreator(creator: Creator, category: string, state: string): number {
  let score = 0;
  if (creator.category === category) score += 50;
  if (creator.city === state) score += 25;
  if (creator.isSubscribed) score += 10;
  if (creator.subscriptionTier === "premium") score += 8;
  else if (creator.subscriptionTier === "pro") score += 5;
  score += Math.min(creator.rating * 2, 10);
  score += Math.max(0, 10 - creator.rank);
  return score;
}

export function matchCreatorsForBrief(
  category: string,
  state: string,
  creators?: Creator[],
  limit = 5
): BriefInvite[] {
  const pool = creators ?? [];
  return pool
    .map((c) => ({ creator: c, score: scoreCreator(c, category, state) }))
    .filter((x) => x.score >= 50 || x.creator.category === category)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ creator }) => ({
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      category: creator.category,
      city: creator.city,
      rating: creator.rating,
      status: "pending" as const,
    }));
}

export interface CreateBriefInput {
  clientId: string;
  clientName: string;
  clientPhone: string;
  category: string;
  occasion: string;
  state: string;
  date: string;
  budget: string;
  notes: string;
  creators?: Creator[];
}

export function createBrief(input: CreateBriefInput): Brief {
  const invites = matchCreatorsForBrief(
    input.category,
    input.state,
    input.creators
  );

  const brief: Brief = {
    id: `brief-${Date.now()}`,
    clientId: input.clientId,
    clientName: input.clientName,
    clientPhone: input.clientPhone,
    category: input.category,
    occasion: input.occasion,
    state: input.state,
    date: input.date,
    budget: input.budget,
    notes: input.notes,
    status: invites.length > 0 ? "matched" : "open",
    invites,
    createdAt: new Date().toISOString(),
  };

  const briefs = getBriefs();
  briefs.unshift(brief);
  safeSet(BRIEFS_KEY, briefs);
  return brief;
}

export function respondToBrief(
  briefId: string,
  creatorId: string,
  status: "accepted" | "declined"
): Brief | undefined {
  const briefs = getBriefs();
  const idx = briefs.findIndex((b) => b.id === briefId);
  if (idx < 0) return undefined;

  const brief = { ...briefs[idx] };
  brief.invites = brief.invites.map((invite) =>
    invite.creatorId === creatorId
      ? { ...invite, status, respondedAt: new Date().toISOString() }
      : invite
  );

  const allResponded = brief.invites.every((i) => i.status !== "pending");
  const anyAccepted = brief.invites.some((i) => i.status === "accepted");
  if (allResponded && !anyAccepted) brief.status = "closed";
  else if (anyAccepted) brief.status = "matched";

  briefs[idx] = brief;
  safeSet(BRIEFS_KEY, briefs);
  return brief;
}

export function budgetLabel(value: string): string {
  return budgetOptions.find((b) => b.value === value)?.label ?? value;
}
