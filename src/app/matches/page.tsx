import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MatchesList } from "@/components/matches/matches-list";
import type { MatchGroup, MatchItem } from "@/components/matches/matches-list";
import { createClient } from "@/utils/supabase/server";

export default async function MatchesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch matches with embedded messages and creator info — mirrors Ambe business_dashboard_screen.dart
  const { data: matchesRaw } = await supabase
    .from("matches")
    .select(
      `id, campaign_id, created_at,
       campaigns(id, title),
       creator:users!matches_creator_id_fkey(
         id, name, avatar_url,
         creator_profiles(profile_photo_url)
       ),
       messages(content, sender_id, created_at)`,
    )
    .eq("business_id", user.id)
    .order("created_at", { ascending: false });

  // Unread counts via RPC
  const { data: unreadData } = await supabase.rpc("get_unread_counts", {
    p_user_id: user.id,
  });
  const unreadMap = new Map<string, number>(
    ((unreadData ?? []) as { match_id: string; unread_count: number }[]).map((r) => [
      r.match_id,
      Number(r.unread_count),
    ]),
  );

  // Normalize each match — pick last message, flatten creator shape
  type RawMatch = {
    id: string;
    campaign_id: string;
    created_at: string;
    campaigns: { id: string; title: string | null } | null;
    creator: {
      id: string;
      name: string;
      avatar_url: string | null;
      creator_profiles: { profile_photo_url: string | null } | null;
    } | null;
    messages: { content: string; sender_id: string; created_at: string }[] | null;
  };

  const matches: MatchItem[] = ((matchesRaw ?? []) as unknown as RawMatch[]).map((m) => {
    const msgs = (m.messages ?? []).slice().sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
    const lastMsg = msgs[0] ?? null;
    const cp = Array.isArray(m.creator?.creator_profiles)
      ? (m.creator?.creator_profiles as { profile_photo_url: string | null }[])[0] ?? null
      : m.creator?.creator_profiles ?? null;

    return {
      id: m.id,
      campaign_id: m.campaign_id,
      created_at: m.created_at,
      creator: m.creator
        ? {
            id: m.creator.id,
            name: m.creator.name,
            avatar_url: m.creator.avatar_url,
            profile_photo_url: cp?.profile_photo_url ?? null,
          }
        : null,
      lastMessage: lastMsg
        ? {
            content: lastMsg.content,
            fromMe: lastMsg.sender_id === user.id,
            created_at: lastMsg.created_at,
          }
        : null,
      unreadCount: unreadMap.get(m.id) ?? 0,
    };
  });

  // Group by campaign, sorted by most recent activity
  const groupMap = new Map<string, MatchGroup>();
  for (const m of matches) {
    const key = m.campaign_id;
    const campaign = ((matchesRaw ?? []) as unknown as RawMatch[]).find(
      (r) => r.campaign_id === key,
    )?.campaigns ?? { id: key, title: null };
    if (!groupMap.has(key)) {
      groupMap.set(key, { campaign: { id: campaign?.id ?? key, title: campaign?.title ?? null }, matches: [] });
    }
    groupMap.get(key)!.matches.push(m);
  }

  // Sort matches within each group by last activity desc
  for (const g of groupMap.values()) {
    g.matches.sort((a, b) => {
      const ta = a.lastMessage?.created_at ?? a.created_at;
      const tb = b.lastMessage?.created_at ?? b.created_at;
      return tb.localeCompare(ta);
    });
  }

  // Sort groups by their most recent match activity
  const groups = [...groupMap.values()].sort((a, b) => {
    const ta = a.matches[0]?.lastMessage?.created_at ?? a.matches[0]?.created_at ?? "";
    const tb = b.matches[0]?.lastMessage?.created_at ?? b.matches[0]?.created_at ?? "";
    return tb.localeCompare(ta);
  });

  const totalUnread = matches.reduce((sum, m) => sum + m.unreadCount, 0);

  return (
    <div className="flex h-screen flex-col bg-paper">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.08] bg-paper/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-ink/50 transition hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11L5 7l4-4" />
            </svg>
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg font-semibold text-ink">Messages</h1>
          {totalUnread > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          ) : null}
        </div>
        <div className="w-20" /> {/* spacer to centre heading */}
      </header>

      {/* Scrollable list */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
          <MatchesList groups={groups} />
        </div>
      </main>
    </div>
  );
}
