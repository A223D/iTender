"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={className ?? "rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-white/20 hover:text-[var(--color-text)]"}
    >
      Sign out
    </button>
  );
}

