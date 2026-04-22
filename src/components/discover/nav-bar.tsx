"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  const isDiscoverActive = pathname === "/discover-campaigns";

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white shadow-card">
            iT
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-ink">iTender</p>
            <p className="text-sm text-ink/60">Brand campaigns for creators</p>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="flex items-center gap-6">
          <Link
            href="/discover-campaigns"
            aria-current={isDiscoverActive ? "page" : undefined}
            className={`text-sm font-semibold transition hover:underline hover:underline-offset-4 ${
              isDiscoverActive ? "text-ink" : "text-ink/65"
            }`}
          >
            Discover Campaigns
          </Link>
        </nav>
      </div>
    </header>
  );
}
