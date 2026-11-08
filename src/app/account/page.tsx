import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { SignOutButton } from "@/components/sign-out-button";

async function AccountContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/?login=1");
  return <main className="account-page">
    <Link className="back-link" href="/">Back to Shorty</Link>
    <section className="account-card">
      <span className="account-avatar" aria-hidden="true">{user.name?.slice(0, 1) || "S"}</span>
      <h1>Your account</h1>
      <p className="account-name">{user.name}</p>
      <p>{user.email}</p>
      <p className="account-note">Signed in with Google. You’re ready for your first short link.</p>
      <SignOutButton />
    </section>
  </main>;
}

export default function Account() {
  return <Suspense fallback={<main className="page-loading" role="status">Checking your account…</main>}>
    <AccountContent />
  </Suspense>;
}
