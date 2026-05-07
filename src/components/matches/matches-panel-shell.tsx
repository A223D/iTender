"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
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

  useEffect(() => {
    const matchId = pathname.startsWith("/matches/") ? pathname.slice("/matches/".length) : null;
    if (!matchId) return;
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        matches: group.matches.map((m) =>
          m.id === matchId ? { ...m, unreadCount: 0 } : m,
        ),
      })),
    );
  }, [pathname]);

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

  const totalUnread = groups.reduce(
    (sum, g) => sum + g.matches.reduce((s, m) => s + m.unreadCount, 0),
    0,
  );

  const isInChat = pathname !== "/matches";

  return (
    <div className="flex h-screen bg-white">
      {/* ── Left panel: dark conversation list ─────────────────────────── */}
      <div
        className={`relative flex flex-col overflow-hidden ${
          isInChat ? "hidden lg:flex lg:w-72 lg:shrink-0" : "w-full lg:w-72 lg:shrink-0"
        }`}
        style={{ background: "linear-gradient(145deg, #07070E 0%, #0F0F1A 60%, #161628 100%)" }}
      >
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 -top-8 h-[240px] w-[240px] rounded-full bg-violet/[0.12] blur-[70px]" />
          <div className="absolute bottom-1/3 right-0 h-[180px] w-[180px] rounded-full bg-coral/[0.09] blur-[60px]" />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm text-white/45 transition hover:text-white/80"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11L5 7l4-4" />
              </svg>
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-semibold text-white">Messages</h1>
              <UnreadBadge count={totalUnread} />
            </div>
          </header>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 pb-6 pt-3">
              <MatchesList groups={groups} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: chat or empty state ───────────────────────────── */}
      <div className={`flex flex-1 flex-col bg-[#F7F6FF] ${isInChat ? "flex" : "hidden lg:flex"}`}>
        {children}
      </div>
    </div>
  );
}
