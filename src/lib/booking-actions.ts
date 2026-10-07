import { bookingEmailInfo } from "@/lib/booking-response";
import { clientBookingOutcomeEmail, sendEmail } from "@/lib/email";
import { refundTransaction } from "@/lib/paystack";
import { respondToPendingBooking, setRefundStatus } from "@/lib/payouts-repo";
import { findBookingById } from "@/lib/repository";
import type { Booking } from "@/types";

export type RespondResult =
  | { ok: true; booking: Booking; refundFailed: boolean }
  | { ok: false; reason: "not_found" | "already_answered" };

/**
 * Accepts or declines a paid booking. Declining refunds the client in full
 * through Paystack. Used by both the emailed link and the creator dashboard.
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
  if (!updated) return { ok: false, reason: "already_answered" };

  let refundFailed = false;
  let booking = updated;
  if (!accepted && updated.paymentReference) {
    try {
      await refundTransaction(updated.paymentReference);
      await setRefundStatus(updated.id, "requested");
      booking = { ...updated, refundStatus: "requested" };
    } catch (err) {
      // The booking is already cancelled; flag it so an admin can refund by hand.
      console.error(`[booking] refund failed for ${updated.id}`, err);
      await setRefundStatus(updated.id, "failed");
      booking = { ...updated, refundStatus: "failed" };
      refundFailed = true;
    }
  }

  if (updated.clientEmail) {
    await sendEmail(
      clientBookingOutcomeEmail({
        to: updated.clientEmail,
        info: bookingEmailInfo(updated),
        outcome: accepted ? "accepted" : "declined",
      })
    ).catch((err) => console.error("[booking] client outcome email failed", err));
  }

  return { ok: true, booking, refundFailed };
}
