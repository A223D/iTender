"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { ChatMatch, ChatMessage } from "@/app/matches/[id]/page";
import { createClient } from "@/utils/supabase/client";
import { COMP_LABELS } from "@/lib/campaign-constants";
import { CreatorAvatar } from "@/components/ui/creator-avatar";
import { Spinner } from "@/components/ui/spinner";

function MessageBubble({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  const [showTime, setShowTime] = useState(false);
  const time = new Date(msg.created_at).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <button
        type="button"
        onClick={() => setShowTime((v) => !v)}
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed focus:outline-none ${
          isMe
            ? "glass text-[var(--color-text)] rounded-br-sm"
            : "glass text-[var(--color-text)] rounded-bl-sm opacity-70"
        } ${msg.id.startsWith("temp-") ? "opacity-50" : ""}`}
      >
        {msg.content}
      </button>
      {showTime ? (
        <p className="mt-1 px-1 text-[10px] text-[var(--color-text-hint)]">{time}</p>
      ) : null}
    </div>
  );
}

function CampaignBrief({ match }: { match: ChatMatch }) {
  const [open, setOpen] = useState(false);
  const camp = match.campaigns;
  if (!camp) return null;

  return (
    <div className="border-b border-white/[0.08] glass rounded-none border-t-0 border-l-0 border-r-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">📣</span>
          <span className="text-xs font-semibold text-[var(--color-text-muted)] truncate max-w-[200px]">
            {camp.title ?? "Campaign brief"}
          </span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-[var(--color-text-hint)] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open ? (
        <div className="border-t border-white/[0.08] px-4 pb-3 pt-2">
          {camp.description ? (
            <p className="text-xs leading-relaxed text-[var(--color-text-muted)] line-clamp-3">{camp.description}</p>
          ) : null}
          {camp.compensation_type ? (
            <p className="mt-1.5 text-xs font-semibold text-[var(--color-accent-fg)]">
              {COMP_LABELS[camp.compensation_type] ?? camp.compensation_type}
              {camp.compensation_details ? ` · ${camp.compensation_details}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ChatView({
  match,
  initialMessages,
  userId,
}: {
  match: ChatMatch;
  initialMessages: ChatMessage[];
  userId: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const markAsRead = useCallback(async () => {
    await supabase.from("match_reads").upsert({
      match_id: match.id,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    });
  }, [match.id, userId, supabase]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    markAsRead();
    scrollToBottom("instant");
  }, [markAsRead, scrollToBottom]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${match.id}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const tempIdx = prev.findIndex(
              (m) => m.id.startsWith("temp-") && m.sender_id === msg.sender_id && m.content === msg.content,
            );
            if (tempIdx !== -1) {
              const next = [...prev];
              next[tempIdx] = msg;
              return next;
            }
            return [...prev, msg];
          });
          markAsRead();
          scrollToBottom();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, supabase, markAsRead, scrollToBottom]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [input]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      match_id: match.id,
      sender_id: userId,
      content: text,
      created_at: new Date().toISOString(),
    };

    setInput("");
    setSending(true);
    setSendError(null);
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    const { error } = await supabase.from("messages").insert({
      match_id: match.id,
      sender_id: userId,
      content: text,
    });

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
      setSendError("Failed to send. Try again.");
    }
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="glass flex items-center gap-3 rounded-none border-t-0 border-l-0 border-r-0 border-b border-b-white/[0.08] px-4 py-3">
        <Link
          href="/matches"
          className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] lg:hidden"
          aria-label="Back to messages"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13L5 8l5-5" />
          </svg>
        </Link>

        <Link
          href={`/creators/${match.creator?.id}`}
          target="_blank"
          className="flex items-center gap-2.5 flex-1 min-w-0 transition hover:opacity-80"
        >
          <CreatorAvatar
            name={match.creator?.name}
            photoUrl={match.creator?.profile_photo_url ?? match.creator?.avatar_url}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{match.creator?.name ?? "Creator"}</p>
            <p className="text-xs text-[var(--color-text-hint)]">View profile ↗</p>
          </div>
        </Link>
      </header>

      {/* ── Collapsible campaign brief ─────────────────────────────────── */}
      <CampaignBrief match={match} />

      {/* ── Message list ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isMe={msg.sender_id === userId} />
          ))}
        </div>
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      <div className="glass rounded-none border-t border-t-white/[0.08] border-b-0 border-l-0 border-r-0 px-4 pb-4 pt-3">
        {sendError ? (
          <p className="mb-2 text-center text-xs text-error">{sendError}</p>
        ) : null}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            className="input-recessed flex-1 resize-none text-sm"
            style={{ maxHeight: 96 }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-text)] text-slate-950 transition hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 dark:text-slate-950"
          >
            {sending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2L2 8l5 2 2 5 5-13z" />
              </svg>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
