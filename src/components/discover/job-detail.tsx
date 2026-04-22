import { JobRecord } from "@/types/jobs";

type JobDetailProps = {
  job: JobRecord | null;
  totalMatches: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function JobDetail({ job, totalMatches }: JobDetailProps) {
  if (!job) {
    return (
      <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/70 p-10 text-center shadow-card lg:flex lg:h-full lg:min-h-0 lg:flex-col">
        <p className="font-display text-2xl font-semibold text-ink">No campaigns matched those filters.</p>
        <p className="mt-3 text-sm leading-7 text-ink/65">
          Try broadening the brief search or resetting a few filter selections.
        </p>
      </div>
    );
  }

  return (
    <article className="rounded-[2rem] border border-black/5 bg-white/88 p-8 shadow-card lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-moss">{job.companyCategory}</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">{job.companyName}</h2>
          <p className="mt-3 text-base text-ink/62">
            {job.jobCategory} campaign
            {" · "}
            {job.platform.join(", ")}
          </p>
        </div>

        <div className="rounded-[1.5rem] bg-blush px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/55">Max budget</p>
          <p className="mt-2 text-2xl font-bold text-ink">{formatCurrency(job.maxBudget)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-paper px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Bids</p>
          <p className="mt-2 text-lg font-semibold text-ink">{job.bidCount} creators</p>
        </div>
        <div className="rounded-2xl bg-paper px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Auction ends</p>
          <p className="mt-2 text-lg font-semibold text-ink">{job.auctionEndsInHours} hrs</p>
        </div>
        <div className="rounded-2xl bg-paper px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Matching campaigns</p>
          <p className="mt-2 text-lg font-semibold text-ink">{totalMatches}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {job.platform.map((platform) => (
          <span
            key={platform}
            className="rounded-full border border-moss/20 bg-moss/10 px-3 py-1 text-xs font-semibold text-moss"
          >
            {platform}
          </span>
        ))}
      </div>

      <div className="mt-8 border-t border-black/6 pt-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/48">Full brief</p>
        <div className="mt-4 space-y-5 text-sm leading-7 text-ink/80">
          {job.brief.split("\n\n").map((paragraph, index) => (
            <p key={`${job.id}-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
