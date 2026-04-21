import { JobRecord } from "@/types/jobs";

type JobCardProps = {
  job: JobRecord;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="group rounded-[2rem] border border-black/5 bg-white/85 p-6 shadow-card transition hover:-translate-y-1 hover:border-moss/25">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-moss">{job.companyCategory}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">{job.companyName}</h3>
          <p className="mt-2 text-sm text-ink/60">
            {job.jobCategory} campaign
            {" · "}
            {job.platform.join(", ")}
          </p>
        </div>
        <div className="rounded-2xl bg-blush px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/55">Max budget</p>
          <p className="mt-1 text-xl font-bold text-ink">{formatCurrency(job.maxBudget)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-paper px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Bids</p>
          <p className="mt-2 text-lg font-semibold text-ink">{job.bidCount} creators</p>
        </div>
        <div className="rounded-2xl bg-paper px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Auction ends</p>
          <p className="mt-2 text-lg font-semibold text-ink">{job.auctionEndsInHours} hrs</p>
        </div>
      </div>

      <p className="mt-6 text-sm leading-7 text-ink/78">{job.brief}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {job.platform.map((platform) => (
          <span
            key={platform}
            className="rounded-full border border-moss/20 bg-moss/10 px-3 py-1 text-xs font-semibold text-moss"
          >
            {platform}
          </span>
        ))}
      </div>
    </article>
  );
}
