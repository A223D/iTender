"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { relativeTime } from "@/lib/formatters";

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

function CreatorAvatar({ creator }: { creator: MatchItem["creator"] }) {
  const photo = creator?.profile_photo_url ?? creator?.avatar_url ?? null;
  const initial = creator?.name?.[0]?.toUpperCase() ?? "?";
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo} alt={creator?.name ?? ""} className="h-11 w-11 rounded-full object-cover" />
  ) : (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-coral to-violet text-sm font-bold text-white">
      {initial}
    </div>
  );
}

export function MatchesList({ groups }: { groups: MatchGroup[] }) {
  const pathname = usePathname();

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-white px-6 py-20 text-center">
        <span className="mb-3 text-4xl">💬</span>
        <h2 className="mb-1 font-display text-lg font-semibold text-ink">No matches yet</h2>
        <p className="text-sm text-ink/50">
          Accept a creator from a campaign to start chatting.
        </p>
        <Link href="/dashboard" className="mt-6 rounded-2xl bg-moss px-6 py-3 text-sm font-bold text-white transition hover:bg-moss/90">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.campaign.id}>
          {/* Campaign section header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📣</span>
              <h2 className="font-display text-sm font-semibold text-ink">
                {group.campaign.title ?? "Untitled Campaign"}
              </h2>
            </div>
            <Link
              href={`/campaigns/${group.campaign.id}`}
              className="text-xs font-medium text-moss/70 transition hover:text-moss"
            >
              View campaign ↗
            </Link>
          </div>

          {/* Match tiles */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm divide-y divide-black/[0.06]">
            {group.matches.map((match) => {
              const isActive = pathname === `/matches/${match.id}`;
              return (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className={`flex items-center gap-3 px-4 py-3.5 transition ${
                  isActive ? "bg-moss/[0.07]" : "hover:bg-black/[0.025]"
                }`}
              >
                <CreatorAvatar creator={match.creator} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">
                      {match.creator?.name ?? "Unknown Creator"}
                    </p>
                    {match.lastMessage ? (
                      <span className="shrink-0 text-xs text-ink/35">
                        {relativeTime(match.lastMessage.created_at)}
                      </span>
                    ) : null}
                  </div>
                  {match.lastMessage ? (
                    <p className="mt-0.5 truncate text-xs text-ink/50">
                      {match.lastMessage.fromMe ? (
                        <span className="text-ink/35">You: </span>
                      ) : null}
                      {match.lastMessage.content}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs italic text-ink/30">No messages yet</p>
                  )}
                </div>

                {match.unreadCount > 0 ? (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                    {match.unreadCount > 9 ? "9+" : match.unreadCount}
                  </span>
                ) : null}
              </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
