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
      <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/70 p-10 text-center shadow-card lg:flex lg:h-full lg:min-h-0 lg:flex-col">
        <p className="font-display text-2xl font-semibold text-ink">No campaigns matched those filters.</p>
        <p className="mt-3 text-sm leading-7 text-ink/65">
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
    <article className="rounded-[2rem] border border-black/5 bg-white/88 p-6 shadow-card lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden lg:p-8">
      {onBack ? (
        <div className="mb-5 flex items-center justify-between border-b border-black/6 pb-4 lg:hidden">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
          >
            Back to campaigns
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">{totalMatches} matched</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-moss">
            {job.brand_categories[0] ?? "Brand"}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {job.brand_name}
          </h2>
          <p className="mt-1 text-lg font-medium text-ink/80">{job.title}</p>
          <p className="mt-2 text-base text-ink/62">{getCampaignSummaryLine(job)}</p>
        </div>

        <div className="rounded-[1.5rem] bg-blush px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/55">Compensation</p>
          <p className="mt-2 text-xl font-bold text-ink">{getCompensationLabel(job.compensation_type)}</p>
          {job.compensation_details ? (
            <p className="mt-1 text-sm text-ink/65">{job.compensation_details}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-paper px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Interested</p>
          <p className="mt-2 text-lg font-semibold text-ink">{job.interested_count} creators</p>
        </div>
        <div className="rounded-2xl bg-paper px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Deadline</p>
          <p className="mt-2 text-lg font-semibold text-ink">{deadlineFormatted}</p>
        </div>
        <div className="rounded-2xl bg-paper px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Creators needed</p>
          <p className="mt-2 text-lg font-semibold text-ink">{job.creators_needed}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {job.content_types.map((type) => (
          <span
            key={type}
            className="rounded-full border border-moss/20 bg-moss/10 px-3 py-1 text-xs font-semibold text-moss"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="mt-8 border-t border-black/6 pt-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/48">Campaign brief</p>
        <div className="mt-4 space-y-5 text-sm leading-7 text-ink/80">
          {job.description.split("\n\n").map((paragraph, index) => (
            <p key={`${job.id}-p-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
