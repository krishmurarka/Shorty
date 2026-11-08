import { NextResponse, type NextRequest } from "next/server";
import { authIsConfigured, getAuth } from "@/lib/auth/server";

export default async function proxy(request: NextRequest) {
  if (!authIsConfigured()) {
    return request.nextUrl.pathname.startsWith("/account")
      ? NextResponse.redirect(new URL("/?login=1", request.url))
      : NextResponse.next();
  }
  // Neon exchanges the OAuth verifier and sets HTTP-only session cookies here.
  return getAuth().middleware({
    loginUrl: "/?login=1",
    publicRoutes: ["/auth/callback"],
  })(request);
}

export const config = { matcher: ["/auth/callback", "/account/:path*"] };
