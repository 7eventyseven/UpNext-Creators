import { query, queryAll, withTransaction } from "@/lib/db";
import { BookingRow, mapBooking } from "@/lib/mappers";

/** A creator has this long, from payment, to accept or decline a booking. */
export const BOOKING_RESPONSE_MINUTES = 30;

/** Each paid subscription payment buys this many days of the plan. */
export const SUBSCRIPTION_DAYS = 30;

/**
 * SQL expression: seconds left for the creator to answer a booking row.
 * Interpolating the constant is safe (it is a number we control).
 */
export function secondsLeftSql(alias = "") {
  const col = alias ? `${alias}."createdAt"` : `"createdAt"`;
  return `GREATEST(0, EXTRACT(EPOCH FROM (${col} + interval '${BOOKING_RESPONSE_MINUTES} minutes' - CURRENT_TIMESTAMP)))::int`;
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

/**
 * Atomically cancels paid bookings nobody answered in time and returns them.
 * `FOR UPDATE SKIP LOCKED` means two overlapping sweeps (cron + a page view)
 * never claim the same booking, so no client is refunded twice.
 */
export async function claimExpiredBookings(options: {
  limit?: number;
  bookingId?: string;
} = {}) {
  const rows = await queryAll<BookingRow>(
    `UPDATE "Booking"
        SET status = 'cancelled',
            "expiredAt" = CURRENT_TIMESTAMP,
            "updatedAt" = CURRENT_TIMESTAMP
      WHERE id IN (
        SELECT id FROM "Booking"
         WHERE status = 'pending'
           AND "paymentStatus" = 'paid'
           AND "createdAt" <= CURRENT_TIMESTAMP - interval '${BOOKING_RESPONSE_MINUTES} minutes'
           AND ($2::text IS NULL OR id = $2)
         ORDER BY "createdAt"
         LIMIT $1
         FOR UPDATE SKIP LOCKED
      )
      RETURNING *`,
    [options.limit ?? 25, options.bookingId ?? null]
  );
  return rows.map(mapBooking);
}

/* ------------------------------------------------------------------ */
/* Subscriptions                                                       */
/* ------------------------------------------------------------------ */

/**
 * Records a paid subscription and extends the plan by 30 days. Safe to call
 * repeatedly for the same Paystack reference (redirect + webhook): only the
 * first call has any effect.
 *
 * Renewing the same plan while it is still active adds time on top of the
 * current end date; switching plans, or renewing after expiry, starts a
 * fresh 30 days from now.
 */
export async function activateSubscription(input: {
  creatorId: string;
  tier: "pro" | "premium";
  reference: string;
}) {
  await withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO "SubscriptionPayment" (reference, "creatorId", tier)
       VALUES ($1, $2, $3)
       ON CONFLICT (reference) DO NOTHING
       RETURNING reference`,
      [input.reference, input.creatorId, input.tier]
    );
    if (inserted.rowCount === 0) return;

    await client.query(
      `UPDATE "Creator"
          SET "subscriptionEndsAt" = CASE
                WHEN "isSubscribed"
                 AND "subscriptionTier" = $2::"SubscriptionTier"
                 AND "subscriptionEndsAt" > CURRENT_TIMESTAMP
                THEN "subscriptionEndsAt" + interval '${SUBSCRIPTION_DAYS} days'
                ELSE CURRENT_TIMESTAMP + interval '${SUBSCRIPTION_DAYS} days'
              END,
              "isSubscribed" = true,
              "subscriptionTier" = $2::"SubscriptionTier",
              "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $1`,
      [input.creatorId, input.tier]
    );
  });
}

let lastSubscriptionSweep = 0;

/**
 * Drops creators whose paid plan has run out back to Free. Creators with no
 * end date (admin-granted) are never touched. Throttled to once a minute per
 * server instance so it can run on public reads without cost.
 */
export async function sweepExpiredSubscriptions(force = false) {
  const now = Date.now();
  if (!force && now - lastSubscriptionSweep < 60_000) return 0;
  lastSubscriptionSweep = now;

  const result = await query(
    `UPDATE "Creator"
        SET "isSubscribed" = false,
            "subscriptionTier" = 'free',
            "subscriptionEndsAt" = NULL,
            "updatedAt" = CURRENT_TIMESTAMP
      WHERE "subscriptionEndsAt" IS NOT NULL
        AND "subscriptionEndsAt" <= CURRENT_TIMESTAMP`
  );
  return result.rowCount ?? 0;
}
