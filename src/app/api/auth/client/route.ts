import { NextRequest } from "next/server";
import { z } from "zod";
import {
  CLIENT_COOKIE,
  clearAuthCookie,
  hashPassword,
  jsonError,
  requireClient,
  setAuthCookie,
  signToken,
  verifyPassword,
} from "@/lib/auth-server";
import {
  createClient,
  findClientByEmail,
  findClientById,
} from "@/lib/repository";
import { clientRegisterSchema } from "@/lib/validators";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function GET() {
  const session = await requireClient();
  if (!session) return Response.json({ client: null });

  const client = await findClientById(session.clientId);
  return Response.json({ client });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const action = body?.action as string | undefined;

  if (action === "register") {
    const parsed = clientRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const input = parsed.data;
    const email = input.email.toLowerCase();

    if (await findClientByEmail(email)) {
      return jsonError("An account with this email already exists.");
    }

    const client = await createClient({
      name: input.name.trim(),
      email,
      passwordHash: await hashPassword(input.password),
      phone: input.phone.replace(/\D/g, ""),
    });

    const token = await signToken({
      role: "client",
      clientId: client.id,
      email,
    });
    await setAuthCookie(CLIENT_COOKIE, token);

    return Response.json({ client }, { status: 201 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid credentials");

  const email = parsed.data.email.toLowerCase();
  const found = await findClientByEmail(email);
  if (!found) return jsonError("Invalid email or password.", 401);

  const ok = await verifyPassword(parsed.data.password, found.row.passwordHash);
  if (!ok) return jsonError("Invalid email or password.", 401);

  const token = await signToken({
    role: "client",
    clientId: found.row.id,
    email,
  });
  await setAuthCookie(CLIENT_COOKIE, token);

  return Response.json({ client: found.client });
}

export async function DELETE() {
  await clearAuthCookie(CLIENT_COOKIE);
  return Response.json({ ok: true });
}
