import { Suspense } from "react";
import { cookies } from "next/headers";
import { AuthExperience } from "@/components/auth-experience";

type Props = { searchParams: Promise<{ login?: string; authError?: string }> };

async function HomeContent({ searchParams }: Props) {
  const [jar, params] = await Promise.all([cookies(), searchParams]);
  return <AuthExperience initialGuest={jar.get("shorty_guest")?.value === "1"}
    forceLogin={params.login === "1"} callbackError={params.authError === "1"} />;
}

export default function Home(props: Props) {
  return <Suspense fallback={<main className="page-loading" role="status">Opening Shorty…</main>}>
    <HomeContent {...props} />
  </Suspense>;
}
