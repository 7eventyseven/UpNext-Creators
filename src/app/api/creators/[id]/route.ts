import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapCreator, creatorInclude } from "@/lib/mappers";
import type { Creator } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const creator = await prisma.creator.findUnique({
    where: { id },
    include: creatorInclude,
  });

  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  return NextResponse.json(mapCreator(creator));
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as Creator;

  const existing = await prisma.creator.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  await prisma.service.deleteMany({ where: { creatorId: id } });
  await prisma.creatorVideo.deleteMany({ where: { creatorId: id } });

  const updated = await prisma.creator.update({
    where: { id },
    data: {
      name: body.name,
      username: body.username,
      email: body.email ?? null,
      avatar: body.avatar,
      coverImage: body.coverImage,
      category: body.category,
      city: body.city,
      location: body.location,
      bio: body.bio,
      rating: body.rating,
      reviewCount: body.reviewCount,
      completedBookings: body.completedBookings,
      rank: body.rank,
      isSubscribed: body.isSubscribed,
      subscriptionTier: body.subscriptionTier,
      whatsapp: body.whatsapp,
      tags: JSON.stringify(body.tags ?? []),
      services: {
        create: (body.services ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          discountPrice: s.discountPrice ?? null,
          duration: s.duration,
        })),
      },
      videos: {
        create: (body.videos ?? []).map((v) => ({
          id: v.id,
          title: v.title,
          url: v.url,
          earnings: v.earnings,
        })),
      },
    },
    include: creatorInclude,
  });

  return NextResponse.json(mapCreator(updated));
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    await prisma.creator.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }
}
