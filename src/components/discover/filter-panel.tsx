"use client";

import { FilterDefinition } from "@/types/jobs";

type FilterPanelProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filters: Record<string, string>;
  filterDefinitions: FilterDefinition[];
  filterOptions: Record<string, string[]>;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
};

export function FilterPanel({
  searchQuery,
  onSearchQueryChange,
  filters,
  filterDefinitions,
  filterOptions,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-white/80 p-5 shadow-card backdrop-blur">
      <div className="grid gap-4 md:grid-cols-2 xl:flex xl:items-end">
          <label className="block xl:min-w-[320px] xl:flex-[1.3]">
            <span className="mb-2 block text-sm font-semibold text-ink">Search within briefs</span>
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search keywords like brunch, skincare, gym, launch..."
              className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm text-ink outline-none ring-0 transition placeholder:text-ink/40 focus:border-moss"
            />
          </label>

          {filterDefinitions.map((definition) => {
            const key = String(definition.key);

            return (
              <label key={key} className="block xl:min-w-[190px] xl:flex-1">
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

          <button
            type="button"
            onClick={onReset}
            className="h-[50px] rounded-2xl border border-black/10 px-5 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03] xl:self-end"
          >
            Reset
          </button>
      </div>
    </section>
  );
}
