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
    <section className="glass rounded-[2rem] p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:flex xl:items-end">
          <label className="block xl:min-w-[320px] xl:flex-[1.3]">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-text)]">Search within briefs</span>
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search keywords like brunch, skincare, gym, launch..."
              className="input-recessed w-full text-sm placeholder:text-[var(--color-text-hint)]"
            />
          </label>

          {filterDefinitions.map((definition) => {
            const key = String(definition.key);

            return (
              <label key={key} className="block xl:min-w-[190px] xl:flex-1">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-text)]">{definition.label}</span>
                <select
                  value={filters[key] ?? "All"}
                  onChange={(event) => onFilterChange(key, event.target.value)}
                  className="input-recessed w-full text-sm"
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
            className="h-[50px] rounded-2xl border border-white/10 px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-white/20 hover:bg-white/[0.04] xl:self-end"
          >
            Reset
          </button>
      </div>
    </section>
  );
}

