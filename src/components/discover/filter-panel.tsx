"use client";

import { FilterDefinition } from "@/types/jobs";

type FilterPanelProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filters: Record<string, string>;
  filterDefinitions: FilterDefinition[];
  filterOptions: Record<string, string[]>;
  onFilterChange: (key: string, value: string) => void;
  totalCount: number;
  visibleCount: number;
  onReset: () => void;
};

export function FilterPanel({
  searchQuery,
  onSearchQueryChange,
  filters,
  filterDefinitions,
  filterOptions,
  onFilterChange,
  totalCount,
  visibleCount,
  onReset,
}: FilterPanelProps) {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur xl:sticky xl:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-moss">Find the right fit</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Search and filter campaigns</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
        >
          Reset
        </button>
      </div>

      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-semibold text-ink">Search within briefs</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search keywords like brunch, skincare, gym, launch..."
          className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm text-ink outline-none ring-0 transition placeholder:text-ink/40 focus:border-moss"
        />
      </label>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {filterDefinitions.map((definition) => {
          const key = String(definition.key);

          return (
            <label key={key} className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">{definition.label}</span>
              <select
                value={filters[key] ?? "All"}
                onChange={(event) => onFilterChange(key, event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
              >
                <option value="All">All</option>
                {filterOptions[key]?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl bg-ink px-5 py-4 text-white">
        <p className="text-sm text-white/72">Showing campaigns</p>
        <p className="mt-1 font-display text-3xl font-semibold">{visibleCount}</p>
        <p className="text-sm text-white/72">out of {totalCount} matches</p>
      </div>
    </section>
  );
}
