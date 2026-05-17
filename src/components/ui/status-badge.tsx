import { STATUS_LABELS, STATUS_STYLES } from "@/lib/campaign-constants";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-white/[0.06] text-[var(--color-text-muted)]"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}


