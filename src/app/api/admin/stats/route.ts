import { jsonError, requireAdmin } from "@/lib/auth-server";
import { getAdminStats } from "@/lib/repository";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return jsonError("Unauthorized", 401);

  const stats = await getAdminStats();
  return Response.json({ stats });
}
