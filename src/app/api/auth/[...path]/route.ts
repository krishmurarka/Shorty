import { getAuth, authIsConfigured } from "@/lib/auth/server";
import type { NextRequest } from "next/server";

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: Context) {
  const path = (await context.params).path.join("/");
  const allowed = request.method === "GET"
    ? ["get-session", "callback/google", "error"].includes(path)
    : ["sign-in/social", "sign-out"].includes(path);
  if (!allowed) return Response.json({ message: "Not found" }, { status: 404 });

  if (path === "sign-in/social") {
    const body = await request.clone().json().catch(() => null);
    const origin = new URL(request.url).origin;
    const callback = `${origin}/auth/callback`;
    if (body?.provider !== "google" || body.callbackURL !== callback ||
      (body.newUserCallbackURL && body.newUserCallbackURL !== callback) ||
      (body.errorCallbackURL && body.errorCallbackURL !== `${origin}/?authError=1`)) {
      return Response.json({ message: "Invalid sign-in request" }, { status: 400 });
    }
  }

  if (!authIsConfigured()) {
    return Response.json({ message: "Sign-in is temporarily unavailable. Please try again." }, { status: 503 });
  }
  try {
    const handler = getAuth().handler();
    const response = request.method === "GET"
      ? await handler.GET(request, context)
      : await handler.POST(request, context);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    console.error("[auth] Authentication request failed", { path });
    return Response.json({ message: "Sign-in is temporarily unavailable. Please try again." }, { status: 503 });
  }
}

export const GET = handle;
export const POST = handle;
