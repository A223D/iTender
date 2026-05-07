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
        <h2 className="font-display text-lg font-semibold text-ink">Creator Pipeline</h2>
        {creators.length > 0 ? (
          <span className="rounded-full bg-coral/10 px-2.5 py-0.5 text-sm font-semibold text-coral">
            {filteredCreators.length}
            {filteredCreators.length !== creators.length ? ` / ${creators.length}` : ""}
          </span>
        ) : null}
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <span className="mb-3 text-4xl">👀</span>
          <p className="font-semibold text-ink">No creators yet</p>
          <p className="mt-1 text-sm text-ink/50">Creators who express interest will appear here.</p>
        </div>
      ) : (
        <>
          {/* Sticky filter bar */}
          <div className={`mb-4 flex flex-wrap gap-2 ${sticky ? "sticky top-0 z-10 bg-[#F7F6FF]/95 pb-3 pt-1 backdrop-blur" : ""}`}>
            {/* Sort toggle */}
            <div className="flex overflow-hidden rounded-xl border border-black/10">
              {(["followers", "recent"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${sortBy === s ? "bg-[#07070E] text-coral" : "bg-white text-ink/55 hover:bg-black/[0.03]"}`}
                >
                  {s === "followers" ? "Most Followers" : "Most Recent"}
                </button>
              ))}
            </div>

            {/* Min-followers filter */}
            <div className="flex overflow-hidden rounded-xl border border-black/10">
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
                  className={`px-3 py-1.5 text-xs font-semibold transition ${minFollowers === f.value ? "bg-[#07070E] text-coral" : "bg-white text-ink/55 hover:bg-black/[0.03]"}`}
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
                className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink outline-none transition focus:border-coral"
              >
                <option value="all">All Niches</option>
                {allNiches.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            ) : null}
          </div>

          {filteredCreators.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-black/15 bg-white px-5 py-8 text-center text-sm text-ink/40">
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
