import { jsonError, requireCreator } from "@/lib/auth-server";
import { defaultAppSettings, mergeAppSettings } from "@/lib/app-settings";
import { getAppSettingsRow } from "@/lib/repository";
import { getReferralSummary } from "@/lib/referral-repo";
import { NextRequest } from "next/server";

/** The signed-in creator's referral code, reward and invited creators. */
export async function GET(req: NextRequest) {
  const session = await requireCreator(req);
  if (!session) return jsonError("Sign in to see your referrals", 401);

  const [summary, row] = await Promise.all([
    getReferralSummary(session.creatorId),
    getAppSettingsRow(),
  ]);
  if (!summary) return jsonError("Creator not found", 404);

  const settings = row ? mergeAppSettings(row.settings) : defaultAppSettings;
  return Response.json({ ...summary, rewardDays: settings.referralRewardDays });
}
