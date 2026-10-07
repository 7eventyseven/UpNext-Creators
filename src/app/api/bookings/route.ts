import {
  jsonError,
  requireAdmin,
  requireClient,
  requireCreator,
} from "@/lib/auth-server";
import {
  createBooking,
  deleteBooking,
  findCreatorRowById,
  listBookings,
  listClientBookings,
  updateBookingStatus,
} from "@/lib/repository";
import { respondToBooking } from "@/lib/booking-actions";
import { bookingSchema } from "@/lib/validators";
import { NextRequest } from "next/server";
import { z } from "zod";

/**
 * Bookings are scoped to whoever is asking: admins see everything, creators
 * see bookings for their own services, and clients see what they booked.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin) {
    const creatorId = new URL(req.url).searchParams.get("creatorId");
    return Response.json({ bookings: await listBookings(creatorId) });
  }

  const creator = await requireCreator(req);
  if (creator) {
    return Response.json({ bookings: await listBookings(creator.creatorId) });
  }

  const client = await requireClient(req);
  if (client) {
    return Response.json({ bookings: await listClientBookings(client.clientId) });
  }

  return jsonError("Sign in to view bookings", 401);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return jsonError("Bookings are created after Paystack payment", 401);
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid booking");
  }

  const input = parsed.data;
  const creator = await findCreatorRowById(input.creatorId);
  if (!creator) return jsonError("Creator not found", 404);

  const booking = await createBooking(input);
  return Response.json({ booking }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // Creators answer their own booking requests from the dashboard.
  const isCreatorAnswer =
    typeof body === "object" && body !== null && "action" in body;
  const creator = isCreatorAnswer ? await requireCreator(req) : null;
  if (isCreatorAnswer) {
    if (!creator) return jsonError("Unauthorized", 401);
    const answer = z
      .object({
        id: z.string().min(1),
        action: z.enum(["accept", "decline"]),
      })
      .safeParse(body);
    if (!answer.success) return jsonError("Invalid update");

    const result = await respondToBooking({
      bookingId: answer.data.id,
      action: answer.data.action,
      creatorId: creator.creatorId,
    });
    if (!result.ok) {
      return result.reason === "not_found"
        ? jsonError("Booking not found", 404)
        : jsonError("This booking has already been answered.", 409);
    }
    return Response.json({
      booking: result.booking,
      refundFailed: result.refundFailed,
    });
  }

  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const parsed = z
    .object({
      id: z.string().min(1),
      status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
    })
    .safeParse(body);
  if (!parsed.success) return jsonError("Invalid update");

  const booking = await updateBookingStatus(parsed.data.id, parsed.data.status);
  if (!booking) return jsonError("Booking not found", 404);
  return Response.json({ booking });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return jsonError("Booking id is required");

  await deleteBooking(id);
  return Response.json({ ok: true });
}
