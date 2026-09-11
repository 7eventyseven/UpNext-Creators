import { NextRequest } from "next/server";
import { jsonError, requireClient } from "@/lib/auth-server";
import {
  findBookingById,
  listCreatorReviews,
  upsertReview,
} from "@/lib/repository";
import { reviewSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const creatorId = new URL(req.url).searchParams.get("creatorId");
  if (!creatorId) return jsonError("creatorId is required");
  return Response.json({ reviews: await listCreatorReviews(creatorId) });
}

export async function POST(req: NextRequest) {
  const session = await requireClient(req);
  if (!session) return jsonError("Sign in to leave a rating", 401);

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid rating");
  }

  const booking = await findBookingById(parsed.data.bookingId);
  if (!booking) return jsonError("Booking not found", 404);
  if (booking.clientId !== session.clientId) {
    return jsonError("You can only rate your own bookings", 403);
  }
  if (booking.status !== "confirmed" && booking.status !== "completed") {
    return jsonError("You can rate a booking once it's confirmed");
  }

  const review = await upsertReview({
    bookingId: booking.id,
    creatorId: booking.creatorId,
    clientId: session.clientId,
    rating: parsed.data.rating,
    comment: parsed.data.comment.trim(),
  });

  return Response.json({ review }, { status: 201 });
}
