import {
  hashPassword,
  jsonError,
  requireAdmin,
  requireCreator,
} from "@/lib/auth-server";
import {
  deleteCreator,
  findCreatorById,
  findCreatorRowById,
  updateCreator,
  updateCreatorProfile,
} from "@/lib/repository";
import { creatorBodySchema } from "@/lib/validators";
import { NextRequest } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const creator = await findCreatorById(id);
  if (!creator) return jsonError("Creator not found", 404);
  return Response.json({ creator });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const admin = await requireAdmin(req);
  const creatorSession = await requireCreator(req);

  if (!admin && !(creatorSession && creatorSession.creatorId === id)) {
    return jsonError("Unauthorized", 401);
  }

  const existing = await findCreatorRowById(id);
  if (!existing) return jsonError("Creator not found", 404);

  const body = await req.json().catch(() => null);

  if (!admin && creatorSession) {
    const profileSchema = z.object({
      name: z.string().min(1).optional(),
      bio: z.string().optional(),
      city: z.string().optional(),
      location: z.string().optional(),
      whatsapp: z.string().optional(),
      avatar: z.string().optional(),
      category: z.string().optional(),
      services: creatorBodySchema.shape.services.optional(),
      videos: creatorBodySchema.shape.videos.optional(),
    });
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const input = parsed.data;
    const creator = await updateCreatorProfile(id, {
      name: input.name,
      bio: input.bio,
      city: input.city,
      location: input.location ?? (input.city ? `${input.city}, Nigeria` : undefined),
      whatsapp: input.whatsapp?.replace(/\D/g, ""),
      avatar: input.avatar,
      category: input.category,
      services: input.services,
      videos: input.videos,
    });
    return Response.json({ creator });
  }

  const parsed = creatorBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const input = parsed.data;

  const creator = await updateCreator(id, {
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
    rating: input.rating,
    reviewCount: input.reviewCount,
    completedBookings: input.completedBookings,
    rank: input.rank,
    isSubscribed: input.isSubscribed,
    subscriptionTier: input.subscriptionTier,
    whatsapp: input.whatsapp.replace(/\D/g, ""),
    tags: input.tags,
    services: input.services,
    videos: input.videos,
  });

  return Response.json({ creator });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const { id } = await params;
  await deleteCreator(id);
  return Response.json({ ok: true });
}
