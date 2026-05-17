import { getCampaignSummaryLine, getCompensationLabel } from "@/lib/jobs";
import { Campaign } from "@/types/jobs";

type JobDetailProps = {
  job: Campaign | null;
  onBack?: () => void;
  totalMatches: number;
};

export function JobDetail({ job, onBack, totalMatches }: JobDetailProps) {
  if (!job) {
    return (
      <div className="glass rounded-[2rem] p-10 text-center opacity-60 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
        <p className="font-display text-2xl font-semibold text-[var(--color-text)]">No campaigns matched those filters.</p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
          Try broadening the description search or resetting a few filter selections.
        </p>
      </div>
    );
  }

  const deadlineFormatted = new Date(job.deadline).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="glass rounded-[2rem] p-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden lg:p-8">
      {onBack ? (
        <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4 lg:hidden">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-white/20 hover:bg-white/[0.04]"
          >
            Back to campaigns
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-hint)]">{totalMatches} matched</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-fg)]">
            {job.brand_categories[0] ?? "Brand"}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
            {job.brand_name}
          </h2>
          <p className="mt-1 text-lg font-medium text-[var(--color-text-muted)]">{job.title}</p>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">{getCampaignSummaryLine(job)}</p>
        </div>

        <div className="rounded-[1.5rem] bg-white/[0.06] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Compensation</p>
          <p className="mt-2 text-xl font-bold text-[var(--color-text)]">{getCompensationLabel(job.compensation_type)}</p>
          {job.compensation_details ? (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{job.compensation_details}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-transparent px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Interested</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">{job.interested_count} creators</p>
        </div>
        <div className="rounded-2xl bg-transparent px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Deadline</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">{deadlineFormatted}</p>
        </div>
        <div className="rounded-2xl bg-transparent px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Creators needed</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">{job.creators_needed}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {job.content_types.map((type) => (
          <span
            key={type}
            className="glass rounded-full px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="mt-8 border-t border-white/[0.08] pt-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text-hint)]">Campaign brief</p>
        <div className="mt-4 space-y-5 text-sm leading-7 text-[var(--color-text-muted)]">
          {job.description.split("\n\n").map((paragraph, index) => (
            <p key={`${job.id}-p-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

