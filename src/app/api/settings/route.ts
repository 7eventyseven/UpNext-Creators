import { jsonError, requireAdmin } from "@/lib/auth-server";
import {
  defaultAppSettings,
  mergeAppSettings,
  AppSettings,
} from "@/lib/app-settings";
import { getAppSettingsRow, upsertAppSettings } from "@/lib/repository";
import { NextRequest } from "next/server";
import { z } from "zod";

const planSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().min(0),
  description: z.string().min(1),
  features: z.array(z.string().min(1)).min(1),
});

const settingsSchema = z.object({
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().min(1),
  subscriptions: z.object({
    free: planSchema,
    pro: planSchema,
    premium: planSchema,
  }),
});

async function loadSettings(): Promise<AppSettings> {
  const row = await getAppSettingsRow();
  return row ? mergeAppSettings(row.settings) : defaultAppSettings;
}

export async function GET() {
  const settings = await loadSettings();
  return Response.json({ settings });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid settings");
  }

  const settings = mergeAppSettings(parsed.data);
  const row = await upsertAppSettings(settings);
  return Response.json({ settings: mergeAppSettings(row.settings) });
}
