"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { BgStack } from "@/components/ui/bg-stack";
import { MatchesList, type MatchGroup } from "./matches-list";
import { UnreadBadge } from "@/components/ui/unread-badge";

type RealtimeMsg = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

function sortGroups(groups: MatchGroup[]): MatchGroup[] {
  return groups
    .map((group) => ({
      ...group,
      matches: [...group.matches].sort((a, b) => {
        const ta = a.lastMessage?.created_at ?? a.created_at;
        const tb = b.lastMessage?.created_at ?? b.created_at;
        return tb.localeCompare(ta);
      }),
    }))
    .sort((a, b) => {
      const ta = a.matches[0]?.lastMessage?.created_at ?? a.matches[0]?.created_at ?? "";
      const tb = b.matches[0]?.lastMessage?.created_at ?? b.matches[0]?.created_at ?? "";
      return tb.localeCompare(ta);
    });
}

// ── Pane 1: Campaign selector (desktop only) ─────────────────────────────
function CampaignsPane({
  groups,
  activeCampaignId,
  setActiveCampaignId,
  totalUnread,
}: {
  groups: MatchGroup[];
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
  totalUnread: number;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => (g.campaign.title ?? "").toLowerCase().includes(q));
  }, [groups, search]);

  const totalThreads = groups.reduce((s, g) => s + g.matches.length, 0);

  return (
    <aside className="glass hidden lg:flex shrink-0 flex-col overflow-hidden rounded-none border-t-0 border-b-0 border-l-0 border-r border-r-white/[0.08]" style={{ width: 248 }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11L5 7l4-4" />
          </svg>
          Dashboard
        </Link>
        <UnreadBadge count={totalUnread} />
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 py-2">
        <div className="relative">
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-hint)]"
          >
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns"
            className="input-recessed w-full rounded-xl py-1.5 pl-7 pr-3 text-xs"
          />
        </div>
      </div>

      {/* Campaign rows */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {/* All conversations */}
        <button
          type="button"
          onClick={() => setActiveCampaignId(null)}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${
            activeCampaignId === null
              ? "bg-white/[0.12] border border-white/[0.14]"
              : "border border-transparent hover:bg-white/[0.06]"
          }`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.06]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-6l-2 3h-4l-2-3H2" />
              <path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--color-text)]">All conversations</p>
            <p className="font-mono text-[10px] text-[var(--color-text-hint)]">
              {totalThreads} thread{totalThreads !== 1 ? "s" : ""}
            </p>
          </div>
          {totalUnread > 0 ? <UnreadBadge count={totalUnread} /> : null}
        </button>

        {filtered.length > 0 ? (
          <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-hint)]">
            Campaigns
          </p>
        ) : null}

        {filtered.map((g) => {
          const unread = g.matches.reduce((s, m) => s + m.unreadCount, 0);
          const isActive = activeCampaignId === g.campaign.id;
          return (
            <button
              key={g.campaign.id}
              type="button"
              onClick={() => setActiveCampaignId(g.campaign.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${
                isActive
                  ? "bg-white/[0.12] border border-white/[0.14]"
                  : "border border-transparent hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.06] text-xs font-bold text-[var(--color-text-muted)]">
                {(g.campaign.title ?? "C")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[var(--color-text)]">
                  {g.campaign.title ?? "Untitled Campaign"}
                </p>
                <p className="font-mono text-[10px] text-[var(--color-text-hint)]">
                  {g.matches.length} thread{g.matches.length !== 1 ? "s" : ""}
                </p>
              </div>
              {unread > 0 ? <UnreadBadge count={unread} /> : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function MatchesPanelShell({
  groups: initialGroups,
  userId,
  children,
}: {
  groups: MatchGroup[];
  userId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const [groups, setGroups] = useState(initialGroups);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Realtime message subscription — only calls setState in a callback, which is allowed
  useEffect(() => {
    const channel = supabase
      .channel("sidebar-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as RealtimeMsg;
          const isActiveChat = pathnameRef.current === `/matches/${msg.match_id}`;

          setGroups((prev) => {
            const inOurMatches = prev.some((g) => g.matches.some((m) => m.id === msg.match_id));
            if (!inOurMatches) return prev;

            const updated = prev.map((group) => ({
              ...group,
              matches: group.matches.map((match) => {
                if (match.id !== msg.match_id) return match;
                return {
                  ...match,
                  lastMessage: {
                    content: msg.content,
                    fromMe: msg.sender_id === userId,
                    created_at: msg.created_at,
                  },
                  unreadCount: isActiveChat ? match.unreadCount : match.unreadCount + 1,
                };
              }),
            }));

            return sortGroups(updated);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // Derive the currently-open match ID from the URL (no effect needed)
  const activeMatchId = pathname.startsWith("/matches/") ? pathname.slice("/matches/".length) : null;

  // Derive the campaign that owns the active thread (no effect needed)
  const urlCampaignId = useMemo(() => {
    if (!activeMatchId) return null;
    return groups.find((g) => g.matches.some((m) => m.id === activeMatchId))?.campaign.id ?? null;
  }, [activeMatchId, groups]);

  // Active campaign: user can override, but URL navigation syncs it automatically.
  // We use the "derived state during render" pattern (React docs recommended approach)
  // to sync activeCampaignId whenever the URL moves to a different campaign.
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(urlCampaignId);
  const [prevUrlCampaignId, setPrevUrlCampaignId] = useState(urlCampaignId);
  if (urlCampaignId !== null && urlCampaignId !== prevUrlCampaignId) {
    setPrevUrlCampaignId(urlCampaignId);
    setActiveCampaignId(urlCampaignId);
  }

  // Zero the active thread's unread count in the display layer — no setState in effect needed
  const displayGroups = useMemo(() => {
    if (!activeMatchId) return groups;
    return groups.map((g) => ({
      ...g,
      matches: g.matches.map((m) =>
        m.id === activeMatchId ? { ...m, unreadCount: 0 } : m,
      ),
    }));
  }, [groups, activeMatchId]);

  const totalUnread = displayGroups.reduce(
    (sum, g) => sum + g.matches.reduce((s, m) => s + m.unreadCount, 0),
    0,
  );

  // Filter thread list to selected campaign (or show all)
  const threadGroups = useMemo(() => {
    if (!activeCampaignId) return displayGroups;
    return displayGroups.filter((g) => g.campaign.id === activeCampaignId);
  }, [displayGroups, activeCampaignId]);

  const isInChat = pathname !== "/matches";

  const activeCampaignTitle = activeCampaignId
    ? (groups.find((g) => g.campaign.id === activeCampaignId)?.campaign.title ?? "Campaign")
    : "All conversations";

  const threadCount = threadGroups.reduce((s, g) => s + g.matches.length, 0);

  return (
    <div className="relative flex h-screen">
      <BgStack />

      {/* ── Pane 1: Campaigns (desktop only) ────────────────────────────── */}
      <CampaignsPane
        groups={displayGroups}
        activeCampaignId={activeCampaignId}
        setActiveCampaignId={setActiveCampaignId}
        totalUnread={totalUnread}
      />

      {/* ── Pane 2: Thread list ──────────────────────────────────────────── */}
      <div
        className={`glass relative flex flex-col overflow-hidden rounded-none border-t-0 border-b-0 border-l-0 border-r border-r-white/[0.08] ${
          isInChat ? "hidden lg:flex lg:w-72 lg:shrink-0" : "w-full lg:w-72 lg:shrink-0"
        }`}
      >
        <div className="relative z-10 flex h-full flex-col">
          {/* Mobile header — shows Dashboard back link */}
          <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3.5 lg:hidden">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11L5 7l4-4" />
              </svg>
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-[var(--color-text)]">Messages</h1>
              <UnreadBadge count={totalUnread} />
            </div>
          </header>

          {/* Desktop thread pane header — shows active campaign context */}
          <header className="hidden shrink-0 items-center gap-2 border-b border-white/[0.08] px-4 py-3.5 lg:flex">
            <h2 className="flex-1 truncate text-sm font-semibold text-[var(--color-text)]">
              {activeCampaignTitle}
            </h2>
            <span className="font-mono text-xs text-[var(--color-text-hint)]">{threadCount}</span>
          </header>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 pb-6 pt-3">
              <MatchesList groups={threadGroups} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Pane 3: Active chat or empty state ──────────────────────────── */}
      <div className={`flex flex-1 flex-col ${isInChat ? "flex" : "hidden lg:flex"}`}>
        {children}
      </div>
    </div>
  );
}
