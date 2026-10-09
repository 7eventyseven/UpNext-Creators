import { findReferrerByCode } from "@/lib/referral-repo";
import { NextRequest } from "next/server";

/** Public: lets the register page say "Invited by Amina" for a valid code. */
export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  const referrer = await findReferrerByCode(code);
  return Response.json({ referrerName: referrer?.name ?? null });
}
