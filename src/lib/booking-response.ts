import { SignJWT, jwtVerify } from "jose";
import {
  BookingEmailInfo,
  clientBookingReceivedEmail,
  creatorBookingRequestEmail,
  sendEmail,
} from "@/lib/email";
import {
  claimCreatorNotification,
  releaseCreatorNotification,
} from "@/lib/payouts-repo";
import { findCreatorRowById } from "@/lib/repository";
import type { Booking } from "@/types";

const PURPOSE = "booking-response";
const LINK_LIFETIME = "7d";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(value);
}

/**
 * The link in the creator's email carries a signed token for one booking. It
 * only grants the right to answer that booking, nothing else.
 */
export async function signBookingResponseToken(bookingId: string) {
  return new SignJWT({ purpose: PURPOSE, bookingId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(LINK_LIFETIME)
    .sign(secret());
}

export async function verifyBookingResponseToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== PURPOSE || typeof payload.bookingId !== "string") {
      return null;
    }
    return payload.bookingId;
  } catch {
    return null;
  }
}

export function bookingEmailInfo(
  booking: Booking,
  creatorName = booking.creatorName
): BookingEmailInfo {
  return {
    creatorName,
    clientName: booking.clientName,
    serviceName: booking.serviceName,
    date: booking.date,
    time: booking.time,
    price: booking.price,
    creatorPayout: booking.creatorPayout ?? booking.price,
    notes: booking.notes,
  };
}

/**
 * Emails the creator the accept/decline link and sends the client a receipt.
 * Safe to call from every payment-fulfilment path: only the first call sends.
 */
export async function notifyBookingCreated(booking: Booking, origin: string) {
  if (!(await claimCreatorNotification(booking.id))) return;

  const creator = await findCreatorRowById(booking.creatorId);
  const info = bookingEmailInfo(booking, creator?.name ?? booking.creatorName);

  if (creator?.email) {
    try {
      const token = await signBookingResponseToken(booking.id);
      const url = `${origin}/booking/respond?token=${encodeURIComponent(token)}`;
      await sendEmail(
        creatorBookingRequestEmail({
          to: creator.email,
          info,
          respondUrl: url,
        })
      );
    } catch (err) {
      // Let a later webhook retry send it again.
      await releaseCreatorNotification(booking.id);
      throw err;
    }
  } else {
    console.warn(
      `[booking] creator ${booking.creatorId} has no email; they will only see ${booking.id} on their dashboard`
    );
  }

  if (booking.clientEmail) {
    await sendEmail(
      clientBookingReceivedEmail({ to: booking.clientEmail, info })
    ).catch((err) => console.error("[booking] client receipt failed", err));
  }
}
