import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };

  const admin = await prisma.adminSetting.findUnique({
    where: { id: "admin" },
  });

  const password = admin?.password ?? "upnext2024";

  if (body.password !== password) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
