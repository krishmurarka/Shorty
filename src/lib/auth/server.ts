import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";
import { cookies } from "next/headers";

let auth: ReturnType<typeof createNeonAuth> | undefined;

export function authIsConfigured() {
  return Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);
}

export function getAuth() {
  if (auth) return auth;
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret) throw new Error("Configure NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.");
  auth = createNeonAuth({ baseUrl, cookies: { secret, sameSite: "lax" } });
  return auth;
}

export async function getCurrentUser() {
  const jar = await cookies();
  if (!authIsConfigured() || !jar.has("__Secure-neon-auth.session_token")) return null;
  const { data, error } = await getAuth().getSession();
  if (error) return null; // Fail closed: a guest preference never establishes identity.
  return data?.user ?? null;
}
