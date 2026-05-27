"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BgStack } from "@/components/ui/bg-stack";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <BgStack />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl glass">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Scout logo" width={26} height={26} className="dark:invert" />
          </div>
          <span className="font-sans text-lg font-bold text-[var(--color-text-muted)]">Scout</span>
        </Link>

        {/* 500 */}
        <p className="font-display text-[9rem] font-bold leading-none tracking-tight sm:text-[12rem]">
          <span className="bg-gradient-to-r from-fuchsia-500 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            500
          </span>
        </p>

        <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-hint)]">
          An unexpected error occurred. It&apos;s been logged and we&apos;ll look into it.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-white/20 hover:text-[var(--color-text)]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-full glass px-6 py-2.5 text-sm font-bold text-[var(--color-text)] transition hover:opacity-80 active:scale-95"
          >
            Go to Dashboard →
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-8 font-mono text-xs text-[var(--color-text-hint)]">Error ID: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
