import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { MatchesPanelShell } from "@/components/matches/matches-panel-shell";
import type { MatchGroup, MatchItem } from "@/components/matches/matches-list";
import { createClient } from "@/utils/supabase/server";
import { type RawMatchRow, extractProfilePhoto } from "@/types/models";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: "Matches",
  description: "Chat with Scout creator matches.",
};

export default async function MatchesLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: matchesRaw }, { data: unreadData }] = await Promise.all([
    supabase
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
      .order("created_at", { ascending: false }),
    supabase.rpc("get_unread_counts", { p_user_id: user.id }),
  ]);

  const unreadMap = new Map<string, number>(
    ((unreadData ?? []) as { match_id: string; unread_count: number }[]).map((r) => [
      r.match_id,
      Number(r.unread_count),
    ]),
  );

  const matches: MatchItem[] = ((matchesRaw ?? []) as unknown as RawMatchRow[]).map((m) => {
    const msgs = (m.messages ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    const lastMsg = msgs[0] ?? null;

    return {
      id: m.id,
      campaign_id: m.campaign_id,
      created_at: m.created_at,
      creator: m.creator
        ? {
            id: m.creator.id,
            name: m.creator.name,
            avatar_url: m.creator.avatar_url,
            profile_photo_url: extractProfilePhoto(m.creator),
          }
        : null,
      lastMessage: lastMsg
        ? { content: lastMsg.content, fromMe: lastMsg.sender_id === user.id, created_at: lastMsg.created_at }
        : null,
      unreadCount: unreadMap.get(m.id) ?? 0,
    };
  });

  const groupMap = new Map<string, MatchGroup>();
  for (const m of matches) {
    const key = m.campaign_id;
    const rawCampaign = ((matchesRaw ?? []) as unknown as RawMatchRow[]).find(
      (r) => r.campaign_id === key,
    )?.campaigns ?? { id: key, title: null };
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        campaign: { id: rawCampaign?.id ?? key, title: rawCampaign?.title ?? null },
        matches: [],
      });
    }
    groupMap.get(key)!.matches.push(m);
  }

  for (const g of groupMap.values()) {
    g.matches.sort((a, b) => {
      const ta = a.lastMessage?.created_at ?? a.created_at;
      const tb = b.lastMessage?.created_at ?? b.created_at;
      return tb.localeCompare(ta);
    });
  }

  const groups = [...groupMap.values()].sort((a, b) => {
    const ta = a.matches[0]?.lastMessage?.created_at ?? a.matches[0]?.created_at ?? "";
    const tb = b.matches[0]?.lastMessage?.created_at ?? b.matches[0]?.created_at ?? "";
    return tb.localeCompare(ta);
  });

  return (
    <MatchesPanelShell groups={groups} userId={user.id}>
      {children}
    </MatchesPanelShell>
  );
}
