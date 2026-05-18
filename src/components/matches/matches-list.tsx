"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { relativeTime } from "@/lib/formatters";
import { CreatorAvatar } from "@/components/ui/creator-avatar";
import { UnreadBadge } from "@/components/ui/unread-badge";

export type MatchItem = {
  id: string;
  campaign_id: string;
  created_at: string;
  creator: {
    id: string;
    name: string;
    avatar_url: string | null;
    profile_photo_url: string | null;
  } | null;
  lastMessage: { content: string; fromMe: boolean; created_at: string } | null;
  unreadCount: number;
};

export type MatchGroup = {
  campaign: { id: string; title: string | null };
  matches: MatchItem[];
};

export function MatchesList({ groups }: { groups: MatchGroup[] }) {
  const pathname = usePathname();

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center glass rounded-2xl px-6 py-16 text-center">
        <span className="mb-3 text-4xl">💬</span>
        <h2 className="mb-1 text-base font-semibold text-[var(--color-text)]">No matches yet</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Accept a creator from a campaign to start chatting.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-xl bg-[var(--color-text)] px-5 py-2.5 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-95"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.campaign.id}>
          {/* Campaign section header */}
          <div className="mb-1.5 flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">📣</span>
              <h2 className="truncate text-xs font-semibold uppercase tracking-wide text-[var(--color-text-hint)]">
                {group.campaign.title ?? "Untitled Campaign"}
              </h2>
            </div>
            <Link
              href={`/campaigns/${group.campaign.id}`}
              className="flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            >
              View
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10L10 2M10 2H5M10 2V7" />
              </svg>
            </Link>
          </div>

          {/* Match tiles */}
          <div className="overflow-hidden rounded-xl glass">
            {group.matches.map((match, idx) => {
              const isActive = pathname === `/matches/${match.id}`;
              const hasUnread = match.unreadCount > 0;
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className={`relative flex items-center gap-3 px-3.5 py-3 transition ${
                    idx > 0 ? "border-t border-white/[0.05]" : ""
                  } ${isActive ? "bg-white/[0.14]" : "hover:bg-white/[0.06]"}`}
                >
                  {/* Active / unread indicator */}
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r transition-all"
                    style={{
                      height: isActive ? "60%" : hasUnread ? "40%" : "0%",
                      background: isActive
                        ? "rgba(103,232,249,0.9)"
                        : "rgba(103,232,249,0.5)",
                    }}
                  />

                  <CreatorAvatar
                    name={match.creator?.name}
                    photoUrl={match.creator?.profile_photo_url ?? match.creator?.avatar_url}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`truncate text-sm text-[var(--color-text)] ${hasUnread || isActive ? "font-semibold" : "font-medium"}`}>
                        {match.creator?.name ?? "Unknown Creator"}
                      </p>
                      {match.lastMessage ? (
                        <span className={`shrink-0 text-[10px] ${hasUnread ? "text-[rgba(103,232,249,0.8)]" : "text-[var(--color-text-hint)]"}`}>
                          {relativeTime(match.lastMessage.created_at)}
                        </span>
                      ) : null}
                    </div>
                    {match.lastMessage ? (
                      <p className={`mt-0.5 truncate text-xs ${hasUnread ? "text-[var(--color-text-muted)] font-medium" : "text-[var(--color-text-hint)]"}`}>
                        {match.lastMessage.fromMe ? (
                          <span className="text-[var(--color-text-hint)]">You: </span>
                        ) : null}
                        {match.lastMessage.content}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs italic text-[var(--color-text-hint)]">No messages yet</p>
                    )}
                  </div>

                  <UnreadBadge count={match.unreadCount} className="ml-auto shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
