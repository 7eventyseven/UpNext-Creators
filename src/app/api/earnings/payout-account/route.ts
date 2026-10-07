import { jsonError, requireCreator } from "@/lib/auth-server";
import {
  createTransferRecipient,
  resolveBankAccount,
} from "@/lib/paystack";
import { upsertPayoutAccount } from "@/lib/payouts-repo";
import { NextRequest } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  bankName: z.string().min(1),
  bankCode: z.string().min(1),
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
});

/**
 * Saves where withdrawals go. The account holder name always comes from the
 * bank lookup, never from the client, so it can't be spoofed.
 */
export async function PUT(req: NextRequest) {
  const session = await requireCreator(req);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid bank details");
  }
  const input = parsed.data;

  try {
    const { accountName } = await resolveBankAccount(
      input.accountNumber,
      input.bankCode
    );
    const recipientCode = await createTransferRecipient({
      accountName,
      accountNumber: input.accountNumber,
      bankCode: input.bankCode,
    });

    const payoutAccount = await upsertPayoutAccount({
      creatorId: session.creatorId,
      bankName: input.bankName,
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      accountName,
      recipientCode,
    });
    return Response.json({ payoutAccount });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Could not save bank account",
      400
    );
  }
}
