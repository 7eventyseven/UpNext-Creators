import { jsonError } from "@/lib/auth-server";
import { respondToBooking } from "@/lib/booking-actions";
import { verifyBookingResponseToken } from "@/lib/booking-response";
import { findBookingById } from "@/lib/repository";
import { NextRequest } from "next/server";
import { z } from "zod";

/**
 * The accept/decline link from the creator's email. The token is the
 * credential, so no sign-in is needed. Reading is a GET, but answering is a
 * POST so mail scanners that pre-open links can't accept or decline anything.
 */
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const bookingId = await verifyBookingResponseToken(token);
  if (!bookingId) {
    return jsonError("This link is invalid or has expired.", 401);
  }

  const booking = await findBookingById(bookingId);
  if (!booking) return jsonError("Booking not found", 404);

  return Response.json({
    booking: {
      id: booking.id,
      creatorName: booking.creatorName,
      serviceName: booking.serviceName,
      clientName: booking.clientName,
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
      price: booking.price,
      creatorPayout: booking.creatorPayout ?? booking.price,
      status: booking.status,
    },
  });
}

const bodySchema = z.object({
  token: z.string().min(1),
  action: z.enum(["accept", "decline"]),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid request");

  const bookingId = await verifyBookingResponseToken(parsed.data.token);
  if (!bookingId) return jsonError("This link is invalid or has expired.", 401);

  const result = await respondToBooking({
    bookingId,
    action: parsed.data.action,
  });

  if (!result.ok) {
    return result.reason === "not_found"
      ? jsonError("Booking not found", 404)
      : jsonError("This booking has already been answered.", 409);
  }

  return Response.json({
    ok: true,
    status: result.booking.status,
    refundFailed: result.refundFailed,
  });
}
