"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { clearGuestPreference } from "@/app/actions";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      await clearGuestPreference();
      router.replace("/");
      router.refresh();
    } catch {
      setError("Couldn't sign out. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="button button-secondary" onClick={signOut} disabled={busy}>
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error ? <p role="alert" className="form-error">{error}</p> : null}
    </div>
  );
}
