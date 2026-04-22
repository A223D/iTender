import { JobRecord } from "@/types/jobs";

type JobListItemProps = {
  isActive: boolean;
  job: JobRecord;
  onSelect: (jobId: string) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getBriefPreview(brief: string) {
  const normalized = brief.replace(/\s+/g, " ").trim();

  if (normalized.length <= 150) {
    return normalized;
  }

  return `${normalized.slice(0, 147).trimEnd()}...`;
}

export function JobListItem({ isActive, job, onSelect }: JobListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(job.id)}
      className={`w-full rounded-[1.5rem] border p-5 text-left transition ${
        isActive
          ? "border-moss/35 bg-moss/[0.08] shadow-card"
          : "border-black/5 bg-white/85 hover:border-black/10 hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">{job.companyCategory}</p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">{job.companyName}</h3>
          <p className="mt-1 text-sm text-ink/60">
            {job.jobCategory}
            {" · "}
            {job.platform.join(", ")}
          </p>
        </div>
        <span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-ink">
          {formatCurrency(job.maxBudget)}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/72">{getBriefPreview(job.brief)}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-ink/55">
        <span className="rounded-full bg-paper px-3 py-1">{job.bidCount} bids</span>
        <span className="rounded-full bg-paper px-3 py-1">{job.auctionEndsInHours} hrs left</span>
      </div>
    </button>
  );
}
