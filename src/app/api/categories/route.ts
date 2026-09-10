import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories.map((c) => c.name));
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const created = await prisma.category.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  return NextResponse.json(created.name, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { categories?: string[] };
  const categories = body.categories ?? [];

  await prisma.category.deleteMany();
  if (categories.length > 0) {
    await prisma.category.createMany({
      data: categories.map((name) => ({ name })),
    });
  }

  const refreshed = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(refreshed.map((c) => c.name));
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    await prisma.category.delete({ where: { name } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}
