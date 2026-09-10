import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapCreator, creatorInclude } from "@/lib/mappers";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const account = await prisma.creatorAccount.findUnique({
    where: { email },
    include: {
      creator: { include: creatorInclude },
    },
  });

  if (!account || account.password !== password) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  return NextResponse.json(mapCreator(account.creator));
}
