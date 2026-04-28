"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { FilterPanel } from "@/components/discover/filter-panel";
import { JobDetail } from "@/components/discover/job-detail";
import { JobListItem } from "@/components/discover/job-list-item";
import { filterDefinitions, filterJobs, getFilterOptionsMap, getInitialFilters, jobs } from "@/lib/jobs";

const PAGE_SIZE = 6;

export function CampaignBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(getInitialFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?.id ?? null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filterOptions = useMemo(() => getFilterOptionsMap(jobs), []);
  const filteredJobs = useMemo(() => filterJobs(jobs, searchQuery, filters), [filters, searchQuery]);

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
  const selectedJob = filteredJobs.find((job) => job.id === selectedJobId) ?? filteredJobs[0] ?? null;

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

  function handleSelectJob(jobId: string) {
    setSelectedJobId(jobId);
    setIsMobileDetailOpen(true);
  }

  function handleReset() {
    setVisibleCount(PAGE_SIZE);
    setSearchQuery("");
    setFilters(getInitialFilters());
    setSelectedJobId(jobs[0]?.id ?? null);
    setIsMobileDetailOpen(false);
  }

  function handleCloseMobileDetail() {
    setIsMobileDetailOpen(false);
  }

  return (
    <div className="mx-auto max-w-8xl px-4 pb-16 pt-10 sm:px-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:px-8 lg:pb-6 lg:pt-6">
      <FilterPanel
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        filters={filters}
        filterDefinitions={filterDefinitions}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <section className="mt-8 lg:mt-6 lg:min-h-0 lg:flex-1">
        <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
          <div
            className={`rounded-[2rem] border border-black/5 bg-white/78 p-3 shadow-card lg:flex lg:min-h-0 lg:flex-col ${
              isMobileDetailOpen ? "hidden lg:flex" : "block"
            }`}
          >
            <div className="border-b border-black/6 px-4 pb-4 pt-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-moss">Campaigns</p>
              <p className="mt-2 text-sm text-ink/60">
                {filteredJobs.length} match{filteredJobs.length === 1 ? "" : "es"}
              </p>
            </div>

            <div className="space-y-3 overflow-y-auto px-1 py-3 lg:min-h-0 lg:flex-1">
              {visibleJobs.length > 0 ? (
                visibleJobs.map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    isActive={job.id === selectedJob?.id}
                    onSelect={handleSelectJob}
                  />
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white/70 p-6 text-center">
                  <p className="font-display text-xl font-semibold text-ink">No campaigns found.</p>
                </div>
              )}

              <div ref={loadMoreRef} className="flex min-h-20 items-center justify-center">
                {visibleJobs.length < filteredJobs.length ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
                    Loading more campaigns...
                  </p>
                ) : filteredJobs.length > PAGE_SIZE ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
                    You&apos;ve reached the end
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className={`lg:h-full lg:min-h-0 ${isMobileDetailOpen ? "block lg:block" : "hidden lg:block"}`}>
            <JobDetail
              job={selectedJob}
              totalMatches={filteredJobs.length}
              onBack={isMobileDetailOpen ? handleCloseMobileDetail : undefined}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
