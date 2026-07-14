import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export const ADMIN_COOKIE = "upnext_admin_token";
export const CREATOR_COOKIE = "upnext_creator_token";

const WEEK = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export type AdminTokenPayload = {
  role: "admin";
  adminId: string;
  email: string;
};

export type CreatorTokenPayload = {
  role: "creator";
  creatorId: string;
  email: string;
};

export type AuthTokenPayload = AdminTokenPayload | CreatorTokenPayload;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: AuthTokenPayload, expiresIn = "7d") {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role === "admin" && typeof payload.adminId === "string") {
      return {
        role: "admin",
        adminId: payload.adminId,
        email: String(payload.email ?? ""),
      };
    }
    if (payload.role === "creator" && typeof payload.creatorId === "string") {
      return {
        role: "creator",
        creatorId: payload.creatorId,
        email: String(payload.email ?? ""),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setAuthCookie(name: string, token: string) {
  const jar = await cookies();
  jar.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  });
}

export async function clearAuthCookie(name: string) {
  const jar = await cookies();
  jar.delete(name);
}

export async function getTokenFromCookies(name: string) {
  const jar = await cookies();
  return jar.get(name)?.value ?? null;
}

export function getTokenFromRequest(req: NextRequest, name: string) {
  return req.cookies.get(name)?.value ?? null;
}

export async function requireAdmin(req?: NextRequest) {
  const token = req
    ? getTokenFromRequest(req, ADMIN_COOKIE)
    : await getTokenFromCookies(ADMIN_COOKIE);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function requireCreator(req?: NextRequest) {
  const token = req
    ? getTokenFromRequest(req, CREATOR_COOKIE)
    : await getTokenFromCookies(CREATOR_COOKIE);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "creator") return null;
  return payload;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
