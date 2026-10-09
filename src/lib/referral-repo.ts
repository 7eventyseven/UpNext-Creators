import type { PoolClient } from "pg";
import { queryAll, queryOne } from "@/lib/db";

export function normalizeReferralCode(raw: string | null | undefined) {
  return (raw ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
}

/** Who a code belongs to. Only the name is returned, never anything private. */
export async function findReferrerByCode(rawCode: string) {
  const code = normalizeReferralCode(rawCode);
  if (!code) return null;
  return queryOne<{ id: string; name: string }>(
    `SELECT id, name FROM "Creator" WHERE "referralCode" = $1`,
    [code]
  );
}

/**
 * Links a brand-new creator to whoever invited them. Does nothing for an
 * unknown code, for the creator's own code, or if they were already linked,
 * so it is safe to call blindly after registration.
 */
export async function recordReferral(creatorId: string, rawCode: string | undefined) {
  const code = normalizeReferralCode(rawCode);
  if (!code) return null;
  return queryOne<{ referrerId: string }>(
    `UPDATE "Creator" AS c
        SET "referredBy" = r.id
       FROM "Creator" AS r
      WHERE c.id = $1
        AND c."referredBy" IS NULL
        AND r."referralCode" = $2
        AND r.id <> c.id
      RETURNING r.id AS "referrerId"`,
    [creatorId, code]
  );
}

/**
 * Pays the referrer once, the first time the creator they invited pays for a
 * plan. Runs inside the subscription-payment transaction. The
 * "referralRewardedAt IS NULL" guard makes a second payment (or the webhook
 * and redirect both landing) a no-op.
 *
 * - Referrer on a live paid plan: their end date moves out by `days`.
 * - Referrer on Free (or an expired plan): they get Pro for `days`.
 * - Referrer on an admin-granted plan with no end date: nothing to extend.
 */
export async function rewardReferrerOnFirstPayment(
  client: PoolClient,
  referredCreatorId: string,
  days: number
) {
  if (!Number.isInteger(days) || days <= 0) return null;

  const claimed = await client.query<{ referredBy: string }>(
    `UPDATE "Creator"
        SET "referralRewardedAt" = CURRENT_TIMESTAMP,
            "referralRewardDays" = $2
      WHERE id = $1
        AND "referredBy" IS NOT NULL
        AND "referralRewardedAt" IS NULL
      RETURNING "referredBy"`,
    [referredCreatorId, days]
  );
  const referrerId = claimed.rows[0]?.referredBy;
  if (!referrerId) return null;

  await client.query(
    `UPDATE "Creator"
        SET "subscriptionEndsAt" = CASE
              WHEN "isSubscribed" AND "subscriptionEndsAt" IS NULL THEN NULL
              WHEN "isSubscribed" AND "subscriptionEndsAt" > CURRENT_TIMESTAMP
                THEN "subscriptionEndsAt" + make_interval(days => $2::int)
              ELSE CURRENT_TIMESTAMP + make_interval(days => $2::int)
            END,
            "subscriptionTier" = CASE
              WHEN "isSubscribed"
               AND ("subscriptionEndsAt" IS NULL OR "subscriptionEndsAt" > CURRENT_TIMESTAMP)
                THEN "subscriptionTier"
              ELSE 'pro'::"SubscriptionTier"
            END,
            "isSubscribed" = true,
            "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1`,
    [referrerId, days]
  );

  return { referrerId, days };
}

export interface ReferredCreator {
  name: string;
  joinedAt: string;
  rewarded: boolean;
  rewardDays: number | null;
}

export interface ReferralSummary {
  code: string;
  joined: number;
  rewarded: number;
  daysEarned: number;
  referred: ReferredCreator[];
}

export async function getReferralSummary(creatorId: string): Promise<ReferralSummary | null> {
  const me = await queryOne<{ referralCode: string }>(
    `SELECT "referralCode" FROM "Creator" WHERE id = $1`,
    [creatorId]
  );
  if (!me) return null;

  const rows = await queryAll<{
    name: string;
    createdAt: Date;
    referralRewardedAt: Date | null;
    referralRewardDays: number | null;
  }>(
    `SELECT name, "createdAt", "referralRewardedAt", "referralRewardDays"
       FROM "Creator"
      WHERE "referredBy" = $1
      ORDER BY "createdAt" DESC
      LIMIT 100`,
    [creatorId]
  );

  const referred = rows.map((r) => ({
    name: r.name,
    joinedAt: r.createdAt.toISOString(),
    rewarded: r.referralRewardedAt !== null,
    rewardDays: r.referralRewardDays,
  }));

  return {
    code: me.referralCode,
    joined: referred.length,
    rewarded: referred.filter((r) => r.rewarded).length,
    daysEarned: referred.reduce((sum, r) => sum + (r.rewardDays ?? 0), 0),
    referred,
  };
}
