import { cookies } from "next/headers";
import Link from "next/link";

import { createClient } from "@/utils/supabase/server";

export default async function NotFound() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  const initial = displayName?.[0]?.toUpperCase() ?? "?";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-4 py-16 text-center">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full bg-violet/[0.08] blur-[130px]" />
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-coral/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-teal/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center anim-fade-up">
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white shadow-glow">
            S
          </div>
          <span className="font-sans text-lg font-semibold tracking-tight text-light/80">Scout</span>
        </Link>

        {/* 404 */}
        <p className="font-display text-[9rem] font-bold leading-none tracking-tight sm:text-[12rem]">
          <span className="bg-gradient-to-r from-coral via-violet to-teal bg-clip-text text-transparent">
            404
          </span>
        </p>

        <h1 className="mt-4 font-display text-2xl font-semibold text-light sm:text-3xl">
          This page doesn&apos;t exist yet
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-light/45">
          You might be ahead of us — this section of Scout is still being built.
        </p>

        {/* Auth confirmation card — only shown when signed in */}
        {user ? (
          <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 backdrop-blur-sm">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName ?? "Avatar"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-violet/40"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-coral to-violet text-sm font-bold text-white">
                {initial}
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal/80">
                Auth succeeded ✓
              </p>
              <p className="mt-0.5 text-sm font-medium text-light/90">{displayName}</p>
              {user.user_metadata?.full_name && user.email ? (
                <p className="text-xs text-light/45">{user.email}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-light/70 transition hover:border-white/20 hover:text-light"
          >
            ← Go home
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-gradient-to-r from-coral to-violet px-6 py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90 active:scale-95"
            >
              Go to dashboard →
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-coral to-violet px-6 py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90 active:scale-95"
            >
              Sign in →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
