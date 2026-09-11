import { jsonError, requireClient } from "@/lib/auth-server";
import { findCreatorById } from "@/lib/repository";
import { initializeBookingCheckout } from "@/lib/paystack";
import { NextRequest } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  creatorId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  clientName: z.string().min(1),
  clientPhone: z.string().min(1),
  clientEmail: z.string().email(),
  notes: z.string().default(""),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid booking");
  }

  const input = parsed.data;
  const creator = await findCreatorById(input.creatorId);
  if (!creator) return jsonError("Creator not found", 404);

  const service = creator.services.find((s) => s.id === input.serviceId);
  if (!service) return jsonError("Service not found", 404);

  const price = service.discountPrice ?? service.price;
  if (price <= 0) return jsonError("This service cannot be booked online");

  // Attached when the buyer is signed in, so the booking shows up under
  // their account and they can rate it later. Guest checkout still works.
  const session = await requireClient(req);

  const origin = req.nextUrl.origin;
  try {
    const data = await initializeBookingCheckout({
      email: input.clientEmail,
      creatorId: creator.id,
      creatorName: creator.name,
      serviceId: service.id,
      serviceName: service.name,
      price,
      date: input.date,
      time: input.time,
      clientId: session?.clientId ?? null,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      notes: input.notes,
      callbackUrl: `${origin}/bookings/confirmation`,
    });

    return Response.json({
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
      publicKey: data.publicKey,
      email: data.email,
      amountKobo: data.amountKobo,
    });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Could not start checkout",
      502
    );
  }
}
