"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { FilterPanel } from "@/components/discover/filter-panel";
import { JobCard } from "@/components/discover/job-card";
import { filterDefinitions, getFilterOptions, jobs, matchesFilter } from "@/lib/jobs";

const PAGE_SIZE = 6;

const initialFilters = Object.fromEntries(filterDefinitions.map((definition) => [String(definition.key), "All"]));

export function CampaignBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filterOptions = useMemo(
    () =>
      Object.fromEntries(
        filterDefinitions.map((definition) => [String(definition.key), getFilterOptions(jobs, definition.key)]),
      ),
    [],
  );

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch = normalizedSearch.length === 0 || job.brief.toLowerCase().includes(normalizedSearch);
      const matchesAllFilters = filterDefinitions.every((definition) =>
        matchesFilter(job[definition.key], filters[String(definition.key)] ?? "All"),
      );

      return matchesSearch && matchesAllFilters;
    });
  }, [filters, searchQuery]);

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredJobs.length));
        }
      },
      {
        rootMargin: "240px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [filteredJobs.length]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);

  function handleFilterChange(key: string, value: string) {
    setVisibleCount(PAGE_SIZE);
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSearchQueryChange(value: string) {
    setVisibleCount(PAGE_SIZE);
    setSearchQuery(value);
  }

  function handleReset() {
    setVisibleCount(PAGE_SIZE);
    setSearchQuery("");
    setFilters(initialFilters);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
      <FilterPanel
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        filters={filters}
        filterDefinitions={filterDefinitions}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        totalCount={filteredJobs.length}
        visibleCount={visibleJobs.length}
        onReset={handleReset}
      />

      <section>
        <div className="rounded-[2.25rem] border border-black/5 bg-board-grid bg-[size:22px_22px] p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Discover campaigns</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Reverse-auction opportunities built for creators who move fast.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-ink/70">
              Browse active brand campaigns, search inside long-form briefs, and filter by platform, category, or
              creator fit without waiting on server round-trips.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5">
          {visibleJobs.length > 0 ? (
            visibleJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/70 p-10 text-center shadow-card">
              <p className="font-display text-2xl font-semibold text-ink">No campaigns matched those filters.</p>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                Try broadening the brief search or resetting a few filter selections.
              </p>
            </div>
          )}
        </div>

        <div ref={loadMoreRef} className="flex min-h-24 items-center justify-center">
          {visibleJobs.length < filteredJobs.length ? (
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/45">Loading more campaigns...</p>
          ) : filteredJobs.length > PAGE_SIZE ? (
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/45">You&apos;ve reached the end</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
