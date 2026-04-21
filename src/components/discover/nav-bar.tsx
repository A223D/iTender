import Link from "next/link";

export function NavBar() {
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

        <nav aria-label="Primary navigation">
          <Link
            href="/discover-campaigns"
            className="rounded-full border border-moss/20 bg-moss px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss/90"
          >
            Discover Campaigns
          </Link>
        </nav>
      </div>
    </header>
  );
}
