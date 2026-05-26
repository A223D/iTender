"use client";

import { CreatorCard, type NormalizedCreator } from "./creator-card";

export function CreatorPipeline({
  creators,
  filteredCreators,
  sortBy,
  setSortBy,
  minFollowers,
  setMinFollowers,
  nicheFilter,
  setNicheFilter,
  allNiches,
  sticky,
  localMatches,
  accepting,
  onAccept,
}: {
  creators: NormalizedCreator[];
  filteredCreators: NormalizedCreator[];
  sortBy: "followers" | "recent";
  setSortBy: (v: "followers" | "recent") => void;
  minFollowers: number;
  setMinFollowers: (v: number) => void;
  nicheFilter: string;
  setNicheFilter: (v: string) => void;
  allNiches: string[];
  sticky: boolean;
  localMatches: Map<string, string>;
  accepting: string | null;
  onAccept: (creator: NormalizedCreator) => void;
}) {
  return (
    <div>
      {/* Panel header */}
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">Creator Pipeline</h2>
        {creators.length > 0 ? (
          <span className="rounded-full glass/20 px-2.5 py-0.5 text-sm font-semibold text-[var(--color-text-muted)]">
            {filteredCreators.length}
            {filteredCreators.length !== creators.length ? ` / ${creators.length}` : ""}
          </span>
        ) : null}
      </div>

      {creators.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center opacity-70">
          <span className="mb-3 text-4xl">👀</span>
          <p className="font-semibold text-[var(--color-text)]">No creators yet</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Creators who express interest will appear here.</p>
        </div>
      ) : (
        <>
          {/* Sticky filter bar */}
          <div className={`mb-4 flex flex-wrap gap-2 ${sticky ? "sticky top-0 z-10 transparent/95 pb-3 pt-1 backdrop-blur" : ""}`}>
            {/* Sort toggle */}
            <div className="flex overflow-hidden rounded-xl border border-white/10">
              {(["followers", "recent"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${sortBy === s ? "transparent text-[var(--color-text-muted)]" : "glass text-[var(--color-text-muted)] hover:bg-white/[0.04]"}`}
                >
                  {s === "followers" ? "Most Followers" : "Most Recent"}
                </button>
              ))}
            </div>

            {/* Min-followers filter */}
            <div className="flex overflow-hidden rounded-xl border border-white/10">
              {[
                { label: "Any", value: 0 },
                { label: "1K+", value: 1_000 },
                { label: "5K+", value: 5_000 },
                { label: "10K+", value: 10_000 },
                { label: "50K+", value: 50_000 },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setMinFollowers(f.value)}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${minFollowers === f.value ? "transparent text-[var(--color-text-muted)]" : "glass text-[var(--color-text-muted)] hover:bg-white/[0.04]"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Niche filter */}
            {allNiches.length > 0 ? (
              <select
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="rounded-xl border border-white/10 glass px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] outline-none transition focus:border-white/30"
              >
                <option value="all">All Niches</option>
                {allNiches.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            ) : null}
          </div>

          {filteredCreators.length === 0 ? (
            <p className="glass rounded-2xl px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
              No creators match the current filters.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredCreators.map((creator, i) => (
                <CreatorCard
                  key={creator.id || i}
                  creator={creator}
                  matchId={localMatches.get(creator.id) ?? null}
                  accepting={accepting === creator.id}
                  onAccept={() => onAccept(creator)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


