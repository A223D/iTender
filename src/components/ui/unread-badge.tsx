import { UNREAD_BADGE_MAX } from "@/lib/app-config";

export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white ${className ?? ""}`}>
      {count > UNREAD_BADGE_MAX ? `${UNREAD_BADGE_MAX}+` : count}
    </span>
  );
}
