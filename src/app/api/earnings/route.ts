import { jsonError, requireCreator } from "@/lib/auth-server";
import {
  getEarningsSummary,
  getPayoutAccount,
  listWithdrawals,
} from "@/lib/payouts-repo";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireCreator(req);
  if (!session) return jsonError("Sign in to view your earnings", 401);

  const [summary, payoutAccount, withdrawals] = await Promise.all([
    getEarningsSummary(session.creatorId),
    getPayoutAccount(session.creatorId),
    listWithdrawals(session.creatorId),
  ]);

  return Response.json({ summary, payoutAccount, withdrawals });
}
