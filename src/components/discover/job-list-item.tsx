import { getBriefPreview, getCampaignSummaryLine, getCompensationLabel } from "@/lib/jobs";
import { Campaign } from "@/types/jobs";

type JobListItemProps = {
  isActive: boolean;
  job: Campaign;
  onSelect: (jobId: string) => void;
};

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
            {job.brand_categories[0] ?? "Brand"}
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">{job.brand_name}</h3>
          <p className="mt-0.5 text-sm font-medium text-ink/80">{job.title}</p>
          <p className="mt-1 text-sm text-ink/60">{getCampaignSummaryLine(job)}</p>
        </div>
        <span className="shrink-0 rounded-full bg-blush px-3 py-1 text-xs font-semibold text-ink">
          {getCompensationLabel(job.compensation_type)}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/72">{getBriefPreview(job.description)}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-ink/55">
        <span className="rounded-full bg-paper px-3 py-1">{job.interested_count} interested</span>
        <span className="rounded-full bg-paper px-3 py-1">{job.days_left}d left</span>
        <span className="rounded-full bg-paper px-3 py-1">{job.creators_needed} needed</span>
      </div>
    </button>
  );
}
