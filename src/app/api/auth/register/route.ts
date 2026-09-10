import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapCreator, creatorInclude } from "@/lib/mappers";
import type { Creator, CreatorVideo, Service } from "@/types";

interface RegisterBody {
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

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;

  const emailTaken = await prisma.creatorAccount.findUnique({
    where: { email: body.email.toLowerCase() },
  });
  if (emailTaken) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const usernameTaken = await prisma.creator.findUnique({
    where: { username: body.username.replace(/^@/, "") },
  });
  if (usernameTaken) {
    return NextResponse.json(
      { error: "This username is already taken." },
      { status: 409 }
    );
  }

  const maxRank = await prisma.creator.aggregate({ _max: { rank: true } });
  const nextRank = (maxRank._max.rank ?? 0) + 1;

  try {
    const created = await prisma.creator.create({
      data: {
        name: body.name,
        username: body.username.replace(/^@/, ""),
        email: body.email.toLowerCase(),
        avatar: body.avatar,
        coverImage:
          "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
        category: body.category,
        city: body.city,
        location: `${body.city}, Nigeria`,
        bio: body.bio,
        rank: nextRank,
        whatsapp: body.whatsapp.replace(/\D/g, ""),
        tags: JSON.stringify([body.category]),
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
        account: {
          create: {
            email: body.email.toLowerCase(),
            password: body.password,
          },
        },
      },
      include: creatorInclude,
    });

    return NextResponse.json(mapCreator(created), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          "Could not save your profile. Try smaller video files or fewer uploads.",
      },
      { status: 500 }
    );
  }
}
