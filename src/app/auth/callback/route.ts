import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const response = NextResponse.redirect(new URL(user ? "/" : "/?authError=1", request.url));
  if (user) response.cookies.delete("shorty_guest");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
