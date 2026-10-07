import { jsonError, requireCreator } from "@/lib/auth-server";
import { initiateTransfer } from "@/lib/paystack";
import {
  createWithdrawal,
  getPayoutAccountRow,
  setWithdrawalStatus,
} from "@/lib/payouts-repo";
import { mapWithdrawal } from "@/lib/mappers";
import { NextRequest } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  amount: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const session = await requireCreator(req);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Enter a valid amount in naira");

  const account = await getPayoutAccountRow(session.creatorId);
  if (!account) return jsonError("Add your bank account before withdrawing");

  // Reserves the amount first (row-locked), so the balance can't be spent twice.
  const created = await createWithdrawal({
    creatorId: session.creatorId,
    amount: parsed.data.amount,
    account,
  });
  if (!created.ok) return jsonError(created.reason);

  const { withdrawal } = created;

  try {
    const transfer = await initiateTransfer({
      amount: withdrawal.amount,
      recipientCode: account.recipientCode,
      reference: withdrawal.reference,
      reason: "UpNext Creators earnings withdrawal",
    });

    if (transfer.outcome === "failed") {
      // Money never left, so release the reservation.
      console.error(`[withdraw] transfer refused for ${withdrawal.id}: ${transfer.message}`);
      // Don't expose UpNext's own Paystack balance state to creators.
      const friendly = /balance|otp/i.test(transfer.message)
        ? "Withdrawals are temporarily unavailable. Please try again shortly."
        : transfer.message ||
          "The transfer could not be started. Try again later.";
      await setWithdrawalStatus(withdrawal.reference, "failed", friendly);
      return jsonError(friendly, 502);
    }

    const updated = await setWithdrawalStatus(
      withdrawal.reference,
      transfer.outcome === "success" ? "success" : "processing"
    );
    return Response.json({
      withdrawal: updated ?? mapWithdrawal(withdrawal),
    });
  } catch (err) {
    // Network error: Paystack may or may not have received it. Leave it as
    // "pending" (still reserved) and let the transfer webhook settle it.
    console.error(`[withdraw] transfer call errored for ${withdrawal.id}`, err);
    return Response.json(
      {
        withdrawal: mapWithdrawal(withdrawal),
        notice:
          "Your withdrawal is being processed. It will update here shortly.",
      },
      { status: 202 }
    );
  }
}
