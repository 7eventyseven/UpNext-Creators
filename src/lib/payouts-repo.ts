import { createId, query, queryAll, queryOne, withTransaction } from "@/lib/db";
import { BOOKING_RESPONSE_MINUTES } from "@/lib/expiry-repo";
import {
  BookingRow,
  mapBooking,
  mapPayoutAccount,
  mapWithdrawal,
  PayoutAccountRow,
  RefundStatus,
  WithdrawalRow,
  WithdrawalStatus,
} from "@/lib/mappers";
import type { EarningsSummary } from "@/types";

/** Smallest amount a creator can withdraw at once (NGN). */
export const MIN_WITHDRAWAL = 1000;

/* ------------------------------------------------------------------ */
/* Booking accept / decline                                            */
/* ------------------------------------------------------------------ */

/**
 * Marks the creator email as being sent. Returns false when another request
 * (redirect vs webhook) already claimed it, so the email goes out only once.
 */
export async function claimCreatorNotification(bookingId: string) {
  const row = await queryOne<{ id: string }>(
    `UPDATE "Booking"
        SET "creatorNotifiedAt" = CURRENT_TIMESTAMP
      WHERE id = $1 AND "creatorNotifiedAt" IS NULL
      RETURNING id`,
    [bookingId]
  );
  return row !== null;
}

export async function releaseCreatorNotification(bookingId: string) {
  await query(
    `UPDATE "Booking" SET "creatorNotifiedAt" = NULL WHERE id = $1`,
    [bookingId]
  );
}

/**
 * Atomically moves a paid, still-pending booking to its new status. Returns
 * null when it was already answered or the 30-minute window has passed, so a
 * double click, a late click or a re-used email link can never accept or
 * decline the same booking.
 */
export async function respondToPendingBooking(
  id: string,
  status: "confirmed" | "cancelled"
) {
  const row = await queryOne<BookingRow>(
    `UPDATE "Booking"
        SET status = $2,
            "respondedAt" = CURRENT_TIMESTAMP,
            "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'pending' AND "paymentStatus" = 'paid'
        AND "createdAt" > CURRENT_TIMESTAMP - interval '${BOOKING_RESPONSE_MINUTES} minutes'
      RETURNING *`,
    [id, status]
  );
  return row ? mapBooking(row) : null;
}

export async function setRefundStatus(id: string, refundStatus: RefundStatus) {
  await query(
    `UPDATE "Booking"
        SET "refundStatus" = $2, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1`,
    [id, refundStatus]
  );
}

/* ------------------------------------------------------------------ */
/* Earnings                                                            */
/* ------------------------------------------------------------------ */

const IN_FLIGHT = `('pending', 'processing', 'success')`;

export async function getEarningsSummary(
  creatorId: string
): Promise<EarningsSummary> {
  const row = await queryOne<{
    totalEarned: number;
    totalCommission: number;
    pendingEarnings: number;
    withdrawn: number;
  }>(
    `SELECT
       COALESCE((SELECT SUM("creatorPayout") FROM "Booking"
                  WHERE "creatorId" = $1 AND "paymentStatus" = 'paid'
                    AND status IN ('confirmed', 'completed')), 0)::int AS "totalEarned",
       COALESCE((SELECT SUM("commission") FROM "Booking"
                  WHERE "creatorId" = $1 AND "paymentStatus" = 'paid'
                    AND status IN ('confirmed', 'completed')), 0)::int AS "totalCommission",
       COALESCE((SELECT SUM("creatorPayout") FROM "Booking"
                  WHERE "creatorId" = $1 AND "paymentStatus" = 'paid'
                    AND status = 'pending'), 0)::int AS "pendingEarnings",
       COALESCE((SELECT SUM(amount) FROM "Withdrawal"
                  WHERE "creatorId" = $1 AND status IN ${IN_FLIGHT}), 0)::int AS "withdrawn"`,
    [creatorId]
  );

  const totalEarned = row?.totalEarned ?? 0;
  const withdrawn = row?.withdrawn ?? 0;
  return {
    totalEarned,
    totalCommission: row?.totalCommission ?? 0,
    pendingEarnings: row?.pendingEarnings ?? 0,
    withdrawn,
    available: Math.max(0, totalEarned - withdrawn),
    minWithdrawal: MIN_WITHDRAWAL,
  };
}

/* ------------------------------------------------------------------ */
/* Payout account                                                      */
/* ------------------------------------------------------------------ */

export async function getPayoutAccountRow(creatorId: string) {
  return queryOne<PayoutAccountRow>(
    `SELECT * FROM "CreatorPayoutAccount" WHERE "creatorId" = $1`,
    [creatorId]
  );
}

export async function getPayoutAccount(creatorId: string) {
  const row = await getPayoutAccountRow(creatorId);
  return row ? mapPayoutAccount(row) : null;
}

export async function upsertPayoutAccount(input: {
  creatorId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  recipientCode: string;
}) {
  const row = await queryOne<PayoutAccountRow>(
    `INSERT INTO "CreatorPayoutAccount"
       ("creatorId", "bankName", "bankCode", "accountNumber", "accountName", "recipientCode", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP)
     ON CONFLICT ("creatorId") DO UPDATE SET
       "bankName" = EXCLUDED."bankName",
       "bankCode" = EXCLUDED."bankCode",
       "accountNumber" = EXCLUDED."accountNumber",
       "accountName" = EXCLUDED."accountName",
       "recipientCode" = EXCLUDED."recipientCode",
       "updatedAt" = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      input.creatorId,
      input.bankName,
      input.bankCode,
      input.accountNumber,
      input.accountName,
      input.recipientCode,
    ]
  );
  return mapPayoutAccount(row!);
}

/* ------------------------------------------------------------------ */
/* Withdrawals                                                         */
/* ------------------------------------------------------------------ */

export async function listWithdrawals(creatorId: string) {
  const rows = await queryAll<WithdrawalRow>(
    `SELECT * FROM "Withdrawal" WHERE "creatorId" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
    [creatorId]
  );
  return rows.map(mapWithdrawal);
}

export type CreateWithdrawalResult =
  | { ok: true; withdrawal: WithdrawalRow }
  | { ok: false; reason: string };

/**
 * Reserves `amount` of the creator's available balance. The creator row is
 * locked for the duration so two simultaneous requests can't both pass the
 * balance check and overdraw.
 */
export async function createWithdrawal(input: {
  creatorId: string;
  amount: number;
  account: PayoutAccountRow;
}): Promise<CreateWithdrawalResult> {
  return withTransaction(async (client) => {
    await client.query(`SELECT id FROM "Creator" WHERE id = $1 FOR UPDATE`, [
      input.creatorId,
    ]);

    const balance = await client.query<{ available: number }>(
      `SELECT
         COALESCE((SELECT SUM("creatorPayout") FROM "Booking"
                    WHERE "creatorId" = $1 AND "paymentStatus" = 'paid'
                      AND status IN ('confirmed', 'completed')), 0)
         - COALESCE((SELECT SUM(amount) FROM "Withdrawal"
                      WHERE "creatorId" = $1 AND status IN ${IN_FLIGHT}), 0)
         AS available`,
      [input.creatorId]
    );
    const available = Number(balance.rows[0]?.available ?? 0);

    if (input.amount < MIN_WITHDRAWAL) {
      return {
        ok: false as const,
        reason: `The minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString("en-NG")}.`,
      };
    }
    if (input.amount > available) {
      return {
        ok: false as const,
        reason: "That is more than your available balance.",
      };
    }

    const result = await client.query<WithdrawalRow>(
      `INSERT INTO "Withdrawal"
         (id, "creatorId", amount, status, reference, "bankName", "accountNumber", "accountName")
       VALUES ($1,$2,$3,'pending',$4,$5,$6,$7)
       RETURNING *`,
      [
        createId("wd"),
        input.creatorId,
        input.amount,
        // Paystack transfer references: lowercase, 16-50 chars, [a-z0-9_-].
        createId("upn_wd"),
        input.account.bankName,
        input.account.accountNumber,
        input.account.accountName,
      ]
    );
    return { ok: true as const, withdrawal: result.rows[0] };
  });
}

/**
 * Applies a status coming from Paystack. Failed and reversed are final, so a
 * repeated webhook can't flip them back; a "success" can still be reversed
 * later by the bank, but is never downgraded to "processing" by a slower
 * request that finishes after the webhook.
 */
export async function setWithdrawalStatus(
  reference: string,
  status: WithdrawalStatus,
  failureReason?: string
) {
  const row = await queryOne<WithdrawalRow>(
    `UPDATE "Withdrawal"
        SET status = $2,
            "failureReason" = COALESCE($3, "failureReason"),
            "updatedAt" = CURRENT_TIMESTAMP
      WHERE reference = $1
        AND status NOT IN ('failed', 'reversed')
        AND NOT (status = 'success' AND $2 IN ('pending', 'processing'))
      RETURNING *`,
    [reference, status, failureReason ?? null]
  );
  return row ? mapWithdrawal(row) : null;
}
