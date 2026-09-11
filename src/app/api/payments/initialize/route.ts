import { jsonError, requireCreator } from "@/lib/auth-server";
import { findCreatorById } from "@/lib/repository";
import { initializeSubscription, type PaidTier } from "@/lib/paystack";
import { NextRequest } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  tier: z.enum(["pro", "premium"]),
});

export async function POST(req: NextRequest) {
  const session = await requireCreator(req);
  if (!session) return jsonError("Sign in as a creator to subscribe", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Choose Pro or Premium");

  const creator = await findCreatorById(session.creatorId);
  if (!creator?.email) {
    return jsonError("Your creator account needs an email address to pay");
  }

  const origin = req.nextUrl.origin;
  try {
    const data = await initializeSubscription({
      email: creator.email,
      creatorId: creator.id,
      tier: parsed.data.tier as PaidTier,
      callbackUrl: `${origin}/subscribe`,
    });
    return Response.json({
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
      publicKey: data.publicKey,
      email: data.email,
      amountKobo: data.amountKobo,
      channels: data.channels,
    });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Could not start checkout",
      502
    );
  }
}
