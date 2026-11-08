"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { continueAsGuest } from "@/app/actions";
import { SignOutButton } from "./sign-out-button";

type Props = { initialGuest: boolean; forceLogin: boolean; callbackError: boolean };

function LinkMark({ small = false }: { small?: boolean }) {
  return <span className={small ? "link-mark link-mark-small" : "link-mark"} aria-hidden="true">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 -1)" />
    </svg>
  </span>;
}

function GoogleMark() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.3 2.99-7.36Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.04.97-3.38.97-2.61 0-4.83-1.76-5.62-4.13H3.04v2.59A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.38 13.92a6 6 0 0 1 0-3.84V7.49H3.04a10 10 0 0 0 0 9.02l3.34-2.59Z" />
    <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.34 2.59C7.17 7.71 9.39 5.95 12 5.95Z" />
  </svg>;
}

export function AuthExperience({ initialGuest, forceLogin, callbackError }: Props) {
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const user = session?.user;
  const [open, setOpen] = useState(forceLogin || callbackError || !initialGuest);
  const [guest, setGuest] = useState(initialGuest);
  const [busy, setBusy] = useState<"google" | "guest" | null>(null);
  const [error, setError] = useState("");
  const [dismissedCallbackError, setDismissedCallbackError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const loginButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !isPending && !user && !element.open) element.showModal();
    else if ((!open || user) && element.open) element.close();
  }, [open, isPending, user]);

  async function googleSignIn() {
    setBusy("google");
    setError("");
    setDismissedCallbackError(true);
    try {
      const origin = window.location.origin;
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${origin}/auth/callback`,
        newUserCallbackURL: `${origin}/auth/callback`,
        errorCallbackURL: `${origin}/?authError=1`,
      });
      if (error) throw new Error("Google sign-in failed");
    } catch {
      setError("Couldn't connect to Google sign-in. Please try again, or continue as guest.");
      setBusy(null);
    }
  }

  async function chooseGuest() {
    setBusy("guest");
    setError("");
    try {
      await continueAsGuest();
      setGuest(true);
      setOpen(false);
      router.replace("/");
      router.refresh();
    } catch {
      setError("Couldn't save your choice. Please try again.");
    } finally { setBusy(null); }
  }

  const message = error || (callbackError && !dismissedCallbackError
    ? "Google sign-in didn't finish. Please try again, or continue as guest."
    : sessionError ? "Couldn't check your session. Please try again, or continue as guest." : "");

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Shorty home"><LinkMark small />shorty<span className="wordmark-dot">.</span></Link>
        <nav aria-label="Account">
          {isPending ? <span className="session-loading" role="status">Checking session…</span>
            : user ? <Link className="button button-secondary" href="/account">My account</Link>
              : <button className="button button-secondary" ref={loginButton} onClick={() => { setOpen(true); setError(""); }}>Log in</button>}
        </nav>
      </header>

      <main className="home-content">
        <div className="hero-copy">
          <h1>A shorter way<br />to share.</h1>
          <p>Long links have a lot to say.<br />Give yours a little room to breathe.</p>
        </div>
        <section className="workspace" aria-label="Your workspace">
          <div className="workspace-top"><span>Your space</span><span className="status-pill">{user ? "Signed in" : guest ? "Guest mode" : "Welcome"}</span></div>
          <div className="workspace-content">
            <span className="mini-link" aria-hidden="true">↗</span>
            <h2>{user ? `Welcome, ${user.name?.split(" ")[0] || "there"}.` : "Make a little space."}</h2>
            <p>Link shortening is coming soon.<br />{user ? "Your account is ready for your first link." : "Explore as a guest, or sign in to make yourself at home."}</p>
            {user ? <SignOutButton /> : <button className="text-button" onClick={() => setOpen(true)}>Sign in with Google</button>}
          </div>
        </section>
      </main>
      <footer className="site-footer"><span>Small links. Open possibilities.</span><span>Made for sharing.</span></footer>

      <dialog ref={dialog} className="login-dialog" aria-labelledby="login-title" aria-describedby="login-description"
        onCancel={() => setOpen(false)}
        onClose={() => { setOpen(false); loginButton.current?.focus(); }}>
        <button className="dialog-close" aria-label="Close login" onClick={() => setOpen(false)}>×</button>
        <LinkMark />
        <h2 id="login-title">Welcome to Shorty</h2>
        <p id="login-description">A little less link.<br />A little more possibility.</p>
        <div className="login-actions">
          <button className="button google-button" onClick={googleSignIn} disabled={busy !== null}>
            {busy === "google" ? <span className="spinner" aria-hidden="true" /> : <GoogleMark />}
            {busy === "google" ? "Connecting to Google…" : "Continue with Google"}
          </button>
          {message ? <p className="form-error" role="alert">{message}</p> : null}
          <div className="login-divider"><span>or keep it simple</span></div>
          <button className="button guest-button" onClick={chooseGuest} disabled={busy !== null}>
            {busy === "guest" ? "Opening your space…" : "Continue as guest"}
          </button>
        </div>
        <p className="login-note">No account needed to look around.<br />You can always sign in later.</p>
      </dialog>
    </div>
  );
}
