import {
  countAdmins,
  createAdmin,
  findAdminByEmail,
} from "@/lib/repository";
import {
  ADMIN_COOKIE,
  hashPassword,
  jsonError,
  setAuthCookie,
  signToken,
  verifyPassword,
  clearAuthCookie,
  requireAdmin,
} from "@/lib/auth-server";
import { NextRequest } from "next/server";
import { z } from "zod";

const DEFAULT_ADMIN_EMAIL = "nungseplangnan@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "William";

const loginSchema = z.object({
  password: z.string().min(1),
  email: z.string().email().optional(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Unauthorized", 401);
  return Response.json({ authenticated: true, email: admin.email });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid credentials");

  const email = (parsed.data.email ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
  let admin = await findAdminByEmail(email);

  if (!admin) {
    const count = await countAdmins();
    if (count === 0) {
      const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
      const bootstrapEmail =
        process.env.ADMIN_EMAIL?.toLowerCase() || DEFAULT_ADMIN_EMAIL;
      admin = await createAdmin(bootstrapEmail, await hashPassword(password));
      if (!admin || admin.email !== email) {
        return jsonError("Invalid credentials", 401);
      }
    }
  }

  if (!admin) return jsonError("Invalid credentials", 401);
  const ok = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!ok) return jsonError("Invalid credentials", 401);

  const token = await signToken({
    role: "admin",
    adminId: admin.id,
    email: admin.email,
  });
  await setAuthCookie(ADMIN_COOKIE, token);

  return Response.json({ authenticated: true, email: admin.email });
}

export async function DELETE() {
  await clearAuthCookie(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
