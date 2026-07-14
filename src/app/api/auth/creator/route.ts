import {
  CREATOR_COOKIE,
  clearAuthCookie,
  hashPassword,
  jsonError,
  requireCreator,
  setAuthCookie,
  signToken,
  verifyPassword,
} from "@/lib/auth-server";
import {
  createCreator,
  findCreatorByEmail,
  findCreatorById,
  findCreatorByUsername,
  findCategoryByName,
  getMaxCreatorRank,
  getAppSettingsRow,
} from "@/lib/repository";
import { defaultAppSettings, mergeAppSettings } from "@/lib/app-settings";
import { registerSchema } from "@/lib/validators";
import { NextRequest } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function assertNotInMaintenance() {
  const row = await getAppSettingsRow();
  const settings = row ? mergeAppSettings(row.settings) : defaultAppSettings;
  if (settings.maintenanceMode) {
    return settings.maintenanceMessage;
  }
  return null;
}

export async function GET() {
  const session = await requireCreator();
  if (!session) return Response.json({ creator: null });

  const creator = await findCreatorById(session.creatorId);
  return Response.json({ creator });
}

export async function POST(req: NextRequest) {
  const maintenanceMessage = await assertNotInMaintenance();
  if (maintenanceMessage) {
    return jsonError(maintenanceMessage, 503);
  }

  const body = await req.json().catch(() => null);
  const action = body?.action as string | undefined;

  if (action === "register") {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const input = parsed.data;
    const email = input.email.toLowerCase();
    const username = input.username.replace(/^@/, "").toLowerCase();

    if (await findCreatorByEmail(email)) {
      return jsonError("An account with this email already exists.");
    }
    if (await findCreatorByUsername(username)) {
      return jsonError("This username is already taken.");
    }

    await findCategoryByName(input.category);
    const maxRank = await getMaxCreatorRank();

    const creator = await createCreator({
      name: input.name,
      username,
      email,
      passwordHash: await hashPassword(input.password),
      avatar: input.avatar,
      coverImage:
        "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
      category: input.category,
      city: input.city,
      location: `${input.city}, Nigeria`,
      bio: input.bio,
      rank: maxRank + 1,
      whatsapp: input.whatsapp.replace(/\D/g, ""),
      tags: [input.category],
      services: input.services,
      videos: input.videos.map((v) => ({
        title: v.title,
        url: v.url,
        earnings: v.earnings ?? 0,
      })),
    });

    const token = await signToken({
      role: "creator",
      creatorId: creator.id,
      email,
    });
    await setAuthCookie(CREATOR_COOKIE, token);

    return Response.json({ creator }, { status: 201 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid credentials");

  const email = parsed.data.email.toLowerCase();
  const found = await findCreatorByEmail(email);
  if (!found?.row.passwordHash) return jsonError("Invalid credentials", 401);

  const ok = await verifyPassword(parsed.data.password, found.row.passwordHash);
  if (!ok) return jsonError("Invalid credentials", 401);

  const token = await signToken({
    role: "creator",
    creatorId: found.row.id,
    email,
  });
  await setAuthCookie(CREATOR_COOKIE, token);

  return Response.json({ creator: found.creator });
}

export async function DELETE() {
  await clearAuthCookie(CREATOR_COOKIE);
  return Response.json({ ok: true });
}
