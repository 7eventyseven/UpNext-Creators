import crypto from "node:crypto";
import { sweepExpired } from "@/lib/booking-actions";
import { NextRequest } from "next/server";

/**
 * Scheduled job (hit it every minute). It:
 *   - cancels + refunds paid bookings the creator left unanswered for 30 min
 *   - drops lapsed paid subscriptions back to Free
 *
 * Protected by CRON_SECRET, sent as `Authorization: Bearer <secret>` (this is
 * what Vercel Cron sends) or, for schedulers that can't set headers, as
 * `?secret=<secret>`.
 */
function authorized(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return "unconfigured" as const;

  const header = req.headers.get("authorization") ?? "";
  const provided =
    (header.startsWith("Bearer ") ? header.slice(7) : "") ||
    new URL(req.url).searchParams.get("secret") ||
    "";

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b)
    ? ("ok" as const)
    : ("denied" as const);
}

async function handle(req: NextRequest) {
  const auth = authorized(req);
  if (auth === "unconfigured") {
    return Response.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  }
  if (auth === "denied") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sweepExpired(true);
  return Response.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
