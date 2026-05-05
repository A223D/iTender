"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink/60 transition hover:border-black/20 hover:text-ink"
    >
      Sign out
    </button>
  );
}
