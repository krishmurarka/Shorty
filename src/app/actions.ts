"use server";

import { cookies } from "next/headers";

export async function continueAsGuest() {
  const jar = await cookies();
  // This is a UI preference, never an authentication or ownership credential.
  jar.set("shorty_guest", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearGuestPreference() {
  (await cookies()).delete("shorty_guest");
}
