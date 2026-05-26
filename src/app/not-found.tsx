import Link from "next/link";
import { BgStack } from "@/components/ui/bg-stack";

export const dynamic = "force-static";

export default function NotFound() {
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
          <span className="font-sans text-lg font-semibold tracking-tight text-[var(--color-text-muted)]">Scout</span>
        </Link>

        {/* 404 */}
        <p className="font-display text-[9rem] font-bold leading-none tracking-tight sm:text-[12rem]">
          <span className="bg-gradient-to-r from-fuchsia-500 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </span>
        </p>

        <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-hint)]">
          The page you&apos;re looking for has been moved or never existed.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-white/20 hover:text-[var(--color-text)]"
          >
            ← Go home
          </Link>
          <Link
            href="/login"
            className="rounded-full glass px-6 py-2.5 text-sm font-bold text-[var(--color-text)] transition hover:opacity-80 active:scale-95"
          >
            Sign in →
          </Link>
        </div>
      </div>
    </main>
  );
}
