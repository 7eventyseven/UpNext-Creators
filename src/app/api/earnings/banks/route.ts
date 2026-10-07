import { jsonError, requireCreator } from "@/lib/auth-server";
import { listNigerianBanks } from "@/lib/paystack";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireCreator(req);
  if (!session) return jsonError("Unauthorized", 401);

  try {
    return Response.json({ banks: await listNigerianBanks() });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Could not load banks",
      502
    );
  }
}
