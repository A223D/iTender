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
    <div className="relative flex h-screen">
      <BgStack />

      {/* ── Left panel: conversation list ─────────────────────────────── */}
      <div
        className={`glass relative flex flex-col overflow-hidden rounded-none border-t-0 border-b-0 border-l-0 border-r border-r-white/[0.08] ${
          isInChat ? "hidden lg:flex lg:w-72 lg:shrink-0" : "w-full lg:w-72 lg:shrink-0"
        }`}
      >
        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
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

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 pb-6 pt-3">
              <MatchesList groups={groups} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: chat or empty state ───────────────────────────── */}
      <div className={`flex flex-1 flex-col ${isInChat ? "flex" : "hidden lg:flex"}`}>
        {children}
      </div>
    </div>
  );
}
