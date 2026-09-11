import { fulfillPaystackPayment, isValidPaystackSignature } from "@/lib/paystack";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!isValidPaystackSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    data?: { reference?: string };
  };

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await fulfillPaystackPayment(event.data.reference);
    } catch {
      return Response.json({ error: "Could not fulfill payment" }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
