import { jsonError, requireAdmin } from "@/lib/auth-server";
import { defaultCategories } from "@/lib/categories";
import {
  countCreatorsByCategory,
  createCategories,
  deleteAllCategories,
  deleteCategoryByName,
  listCategories,
  upsertCategory,
} from "@/lib/repository";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function GET() {
  const categories = await listCategories();
  return Response.json({ categories: categories.map((c) => c.name) });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const action = body?.action as string | undefined;

  if (action === "reset") {
    await deleteAllCategories();
    await createCategories(defaultCategories);
    const categories = await listCategories();
    return Response.json({ categories: categories.map((c) => c.name) });
  }

  const parsed = z.object({ name: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return jsonError("Category name is required");

  await upsertCategory(parsed.data.name.trim());
  const categories = await listCategories();
  return Response.json({ categories: categories.map((c) => c.name) }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) return jsonError("Category name is required");

  const inUse = await countCreatorsByCategory(name);
  if (inUse > 0) {
    return jsonError(
      `Cannot remove "${name}" — creators are still assigned to this category.`
    );
  }

  await deleteCategoryByName(name);
  const categories = await listCategories();
  return Response.json({ categories: categories.map((c) => c.name) });
}
