import { jsonError, requireCreator } from "@/lib/auth-server";
import { fulfillPaystackPayment } from "@/lib/paystack";
import { NextRequest } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  reference: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Payment reference is required");

  try {
    const result = await fulfillPaystackPayment(parsed.data.reference);
    if (!result.ok) {
      return jsonError("Payment was not completed", 402);
    }

    if (result.kind === "subscription") {
      const session = await requireCreator(req);
      if (!session) return jsonError("Sign in to confirm your payment", 401);
      if (result.creatorId !== session.creatorId) {
        return jsonError("This payment belongs to another account", 403);
      }
      return Response.json({ ok: true, kind: "subscription", tier: result.tier });
    }

    return Response.json({ ok: true, kind: "booking", booking: result.booking });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Could not verify payment",
      502
    );
  }
}
