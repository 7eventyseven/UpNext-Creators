import { bookingEmailInfo } from "@/lib/booking-response";
import { clientBookingOutcomeEmail, sendEmail } from "@/lib/email";
import { claimExpiredBookings, sweepExpiredSubscriptions } from "@/lib/expiry-repo";
import { refundTransaction } from "@/lib/paystack";
import { respondToPendingBooking, setRefundStatus } from "@/lib/payouts-repo";
import { findBookingById } from "@/lib/repository";
import type { Booking } from "@/types";

export type RespondResult =
  | { ok: true; booking: Booking; refundFailed: boolean }
  | { ok: false; reason: "not_found" | "already_answered" | "expired" };

/**
 * Refunds a booking that has just been cancelled (declined or expired) and
 * tells the client. The booking row must already be in the cancelled state,
 * which is what guarantees this runs at most once per booking.
 */
async function refundAndNotify(
  booking: Booking,
  outcome: "declined" | "expired"
): Promise<{ booking: Booking; refundFailed: boolean }> {
  let refundFailed = false;
  let result = booking;

  if (booking.paymentReference) {
    try {
      await refundTransaction(booking.paymentReference);
      await setRefundStatus(booking.id, "requested");
      result = { ...booking, refundStatus: "requested" };
    } catch (err) {
      // Already cancelled; flag it so an admin can refund by hand.
      console.error(`[booking] refund failed for ${booking.id}`, err);
      await setRefundStatus(booking.id, "failed");
      result = { ...booking, refundStatus: "failed" };
      refundFailed = true;
    }
  }

  if (booking.clientEmail) {
    await sendEmail(
      clientBookingOutcomeEmail({
        to: booking.clientEmail,
        info: bookingEmailInfo(booking),
        outcome,
      })
    ).catch((err) => console.error("[booking] client outcome email failed", err));
  }

  return { booking: result, refundFailed };
}

/**
 * Accepts or declines a paid booking. Declining refunds the client in full
 * through Paystack. Used by both the emailed link and the creator dashboard.
 *
 * The creator has 30 minutes from payment. A late answer is rejected and the
 * booking is expired (and refunded) on the spot.
 *
 * `creatorId` (when given) must own the booking.
 */
export async function respondToBooking(input: {
  bookingId: string;
  action: "accept" | "decline";
  creatorId?: string;
}): Promise<RespondResult> {
  const existing = await findBookingById(input.bookingId);
  if (!existing) return { ok: false, reason: "not_found" };
  if (input.creatorId && existing.creatorId !== input.creatorId) {
    return { ok: false, reason: "not_found" };
  }

  const accepted = input.action === "accept";
  const updated = await respondToPendingBooking(
    input.bookingId,
    accepted ? "confirmed" : "cancelled"
  );

  if (!updated) {
    // Too late? Settle it now rather than waiting for the next sweep.
    if (existing.status === "pending") {
      const [expired] = await claimExpiredBookings({ bookingId: input.bookingId });
      if (expired) await refundAndNotify(expired, "expired");
      return { ok: false, reason: "expired" };
    }
    return { ok: false, reason: "already_answered" };
  }

  if (accepted) {
    if (updated.clientEmail) {
      await sendEmail(
        clientBookingOutcomeEmail({
          to: updated.clientEmail,
          info: bookingEmailInfo(updated),
          outcome: "accepted",
        })
      ).catch((err) => console.error("[booking] client outcome email failed", err));
    }
    return { ok: true, booking: updated, refundFailed: false };
  }

  const settled = await refundAndNotify(updated, "declined");
  return { ok: true, booking: settled.booking, refundFailed: settled.refundFailed };
}

let lastSweep = 0;

/**
 * Cancels and refunds every paid booking the creator left unanswered for 30
 * minutes, and drops lapsed paid plans back to Free.
 *
 * It runs from the scheduled endpoint (every minute) and, throttled, from
 * normal page loads as a safety net. Pass `force` to skip the throttle.
 */
export async function sweepExpired(force = false) {
  const now = Date.now();
  if (!force && now - lastSweep < 20_000) return { bookings: 0, subscriptions: 0 };
  lastSweep = now;

  let bookings = 0;
  try {
    const expired = await claimExpiredBookings({ limit: 25 });
    for (const booking of expired) {
      await refundAndNotify(booking, "expired");
      bookings += 1;
    }
  } catch (err) {
    console.error("[sweep] booking expiry failed", err);
  }

  let subscriptions = 0;
  try {
    subscriptions = await sweepExpiredSubscriptions(true);
  } catch (err) {
    console.error("[sweep] subscription expiry failed", err);
  }

  return { bookings, subscriptions };
}
