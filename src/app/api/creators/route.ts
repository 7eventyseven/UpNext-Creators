import { jsonError, requireAdmin, hashPassword } from "@/lib/auth-server";
import { createCreator, listCreators } from "@/lib/repository";
import { creatorBodySchema } from "@/lib/validators";
import { NextRequest } from "next/server";

export async function GET() {
  const creators = await listCreators();
  return Response.json({ creators });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = creatorBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const input = parsed.data;
  const creator = await createCreator({
    name: input.name,
    username: input.username.replace(/^@/, ""),
    email: input.email?.toLowerCase() || null,
    passwordHash: input.password ? await hashPassword(input.password) : null,
    avatar: input.avatar,
    coverImage: input.coverImage,
    category: input.category,
    city: input.city,
    location: input.location || `${input.city}, Nigeria`,
    bio: input.bio,
    rating: input.rating ?? 0,
    reviewCount: input.reviewCount ?? 0,
    completedBookings: input.completedBookings ?? 0,
    rank: input.rank ?? 99,
    isSubscribed: input.isSubscribed ?? false,
    subscriptionTier: input.subscriptionTier ?? "free",
    whatsapp: input.whatsapp.replace(/\D/g, ""),
    tags: input.tags,
    services: input.services,
    videos: input.videos,
  });

  return Response.json({ creator }, { status: 201 });
}
