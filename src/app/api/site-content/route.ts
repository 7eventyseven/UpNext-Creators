import { jsonError, requireAdmin } from "@/lib/auth-server";
import {
  defaultSiteContent,
  mergeSiteContent,
  SiteContent,
} from "@/lib/site-content";
import { getSiteSettings, upsertSiteSettings } from "@/lib/repository";
import { siteContentSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

export async function GET() {
  const settings = await getSiteSettings();
  const content = settings
    ? mergeSiteContent(settings.content)
    : defaultSiteContent;
  return Response.json({ content });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = siteContentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid site content");
  }

  const existing = await getSiteSettings();
  const base = existing
    ? mergeSiteContent(existing.content)
    : defaultSiteContent;

  const merged: SiteContent = {
    brand: { ...base.brand, ...parsed.data.brand },
    meta: { ...base.meta, ...parsed.data.meta },
    header: { ...base.header, ...parsed.data.header },
    hero: {
      ...base.hero,
      ...parsed.data.hero,
      headlineWords:
        parsed.data.hero?.headlineWords?.length
          ? parsed.data.hero.headlineWords
          : base.hero.headlineWords,
    },
    search: { ...base.search, ...parsed.data.search },
    empty: { ...base.empty, ...parsed.data.empty },
    creatorCta: { ...base.creatorCta, ...parsed.data.creatorCta },
  };

  const settings = await upsertSiteSettings(merged);
  return Response.json({ content: mergeSiteContent(settings.content) });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  if (body?.action !== "reset") return jsonError("Unknown action");

  const settings = await upsertSiteSettings(defaultSiteContent);
  return Response.json({ content: mergeSiteContent(settings.content) });
}
