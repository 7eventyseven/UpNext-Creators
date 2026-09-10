import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapCreator, creatorInclude } from "@/lib/mappers";
import type { Creator } from "@/types";

function sortCreators(list: Creator[]): Creator[] {
  return [...list].sort((a, b) => {
    if (a.isSubscribed !== b.isSubscribed) return a.isSubscribed ? -1 : 1;
    if (a.subscriptionTier !== b.subscriptionTier) {
      const tierOrder = { premium: 0, pro: 1, free: 2 };
      return tierOrder[a.subscriptionTier] - tierOrder[b.subscriptionTier];
    }
    return a.rank - b.rank;
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sorted = searchParams.get("sorted") === "1";

  const creators = await prisma.creator.findMany({
    include: creatorInclude,
  });

  const mapped = creators.map(mapCreator);
  return NextResponse.json(sorted ? sortCreators(mapped) : mapped);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Creator;

  const created = await prisma.creator.create({
    data: {
      id: body.id,
      name: body.name,
      username: body.username,
      email: body.email ?? null,
      avatar: body.avatar,
      coverImage: body.coverImage,
      category: body.category,
      city: body.city,
      location: body.location,
      bio: body.bio,
      rating: body.rating ?? 0,
      reviewCount: body.reviewCount ?? 0,
      completedBookings: body.completedBookings ?? 0,
      rank: body.rank ?? 99,
      isSubscribed: body.isSubscribed ?? false,
      subscriptionTier: body.subscriptionTier ?? "free",
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

  return NextResponse.json(mapCreator(created), { status: 201 });
}
