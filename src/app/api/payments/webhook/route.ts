import { fulfillPaystackPayment, isValidPaystackSignature } from "@/lib/paystack";
import { setWithdrawalStatus } from "@/lib/payouts-repo";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!isValidPaystackSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    data?: { reference?: string; reason?: string; gateway_response?: string };
  };

  // Payout results for creator withdrawals.
  const transferStatus: Record<string, "success" | "failed" | "reversed"> = {
    "transfer.success": "success",
    "transfer.failed": "failed",
    "transfer.reversed": "reversed",
  };
  const outcome = event.event ? transferStatus[event.event] : undefined;
  if (outcome && event.data?.reference) {
    try {
      await setWithdrawalStatus(
        event.data.reference,
        outcome,
        outcome === "success"
          ? undefined
          : event.data.reason || event.data.gateway_response || "Transfer failed"
      );
    } catch {
      return Response.json({ error: "Could not update withdrawal" }, { status: 500 });
    }
    return Response.json({ received: true });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await fulfillPaystackPayment(event.data.reference);
    } catch {
      return Response.json({ error: "Could not fulfill payment" }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
