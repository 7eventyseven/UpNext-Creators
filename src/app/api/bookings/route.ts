import { jsonError, requireAdmin } from "@/lib/auth-server";
import {
  createBooking,
  deleteBooking,
  findCreatorRowById,
  listBookings,
  updateBookingStatus,
} from "@/lib/repository";
import { bookingSchema } from "@/lib/validators";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");
  const bookings = await listBookings(creatorId);
  return Response.json({ bookings });
}

export async function POST(req: NextRequest) {
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
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
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
