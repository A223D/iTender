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
          className="mt-6 rounded-xl bg-[var(--color-text)] px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:opacity-80 active:scale-95 dark:text-slate-950"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.campaign.id}>
          {/* Campaign section header */}
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">📣</span>
              <h2 className="truncate text-xs font-semibold uppercase tracking-wide text-[var(--color-text-hint)]">
                {group.campaign.title ?? "Untitled Campaign"}
              </h2>
            </div>
            <Link
              href={`/campaigns/${group.campaign.id}`}
              className="shrink-0 text-xs font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            >
              View ↗
            </Link>
          </div>

          {/* Match tiles */}
          <div className="overflow-hidden rounded-xl glass divide-y divide-white/[0.06]">
            {group.matches.map((match) => {
              const isActive = pathname === `/matches/${match.id}`;
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className={`flex items-center gap-3 px-3.5 py-3 transition ${
                    isActive
                      ? "bg-white/[0.12]"
                      : "hover:bg-white/[0.06]"
                  }`}
                >
                  <CreatorAvatar
                    name={match.creator?.name}
                    photoUrl={match.creator?.profile_photo_url ?? match.creator?.avatar_url}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {match.creator?.name ?? "Unknown Creator"}
                      </p>
                      {match.lastMessage ? (
                        <span className="shrink-0 text-[10px] text-[var(--color-text-hint)]">
                          {relativeTime(match.lastMessage.created_at)}
                        </span>
                      ) : null}
                    </div>
                    {match.lastMessage ? (
                      <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
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
