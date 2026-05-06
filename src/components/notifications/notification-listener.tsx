"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { createClient } from "@/utils/supabase/client";

const MAX_TOASTS = 4;

type Toast = {
  id: string;
  type: "application" | "message";
  title: string;
  message: string;
  meta?: string;
  actionLabel?: string;
  href?: string;
};

function useNotificationAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      ctxRef.current = new AudioContext();
    } catch {
      // AudioContext can be unavailable in restricted browsers.
    }
  }, []);

  useEffect(() => {
    function resume() {
      ctxRef.current?.resume().catch(() => {});
    }

    document.addEventListener("click", resume);
    document.addEventListener("keydown", resume);
    return () => {
      document.removeEventListener("click", resume);
      document.removeEventListener("keydown", resume);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const ctx = ctxRef.current;
      if (!ctx || ctx.state !== "running") return;

      const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }, 20_000);

    return () => clearInterval(id);
  }, []);

  function play() {
    const ctx = ctxRef.current;
    if (!ctx) return;

    function beep() {
      const activeCtx = ctxRef.current;
      if (!activeCtx) return;

      const osc = activeCtx.createOscillator();
      const gain = activeCtx.createGain();
      osc.connect(gain);
      gain.connect(activeCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, activeCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, activeCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.001, activeCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.11, activeCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, activeCtx.currentTime + 0.32);
      osc.start(activeCtx.currentTime);
      osc.stop(activeCtx.currentTime + 0.34);
    }

    if (ctx.state === "running") {
      beep();
    } else {
      ctx.resume().then(beep).catch(() => {});
    }
  }

  return play;
}

export function NotificationListener({
  userId,
  campaignIds,
}: {
  userId: string;
  campaignIds: string[];
}) {
  const supabase = createClient();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const campaignIdsRef = useRef(campaignIds);
  const play = useNotificationAudio();

  useEffect(() => {
    campaignIdsRef.current = campaignIds;
  }, [campaignIds]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  function addToast(toast: Omit<Toast, "id">) {
    play();

    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, ...toast }].slice(-MAX_TOASTS));
  }

  useEffect(() => {
    const channel = supabase
      .channel(`business-swipes:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "swipes" },
        async (payload) => {
          const row = payload.new as {
            direction?: string;
            creator_id?: string;
            campaign_id?: string;
          };

          if (row.direction !== "right") return;
          if (!row.campaign_id || !campaignIdsRef.current.includes(row.campaign_id)) return;

          const [{ data: creator }, { data: campaign }, { data: match }] = await Promise.all([
            row.creator_id
              ? supabase.from("users").select("name").eq("id", row.creator_id).single()
              : Promise.resolve({ data: null }),
            supabase.from("campaigns").select("title").eq("id", row.campaign_id).single(),
            row.creator_id
              ? supabase
                  .from("matches")
                  .select("id")
                  .eq("campaign_id", row.campaign_id)
                  .eq("creator_id", row.creator_id)
                  .eq("business_id", userId)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          const creatorName = creator?.name ?? "A creator";
          const matchId = (match as { id?: string } | null)?.id;

          addToast({
            type: "application",
            title: "New creator application",
            message: `${creatorName} applied to your campaign.`,
            meta: campaign?.title ?? "Campaign application",
            actionLabel: matchId ? "Open chat" : "Review applicant",
            href: matchId ? `/matches/${matchId}` : `/campaigns/${row.campaign_id}`,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Re-subscribing on supabase/play changes is unnecessary and causes duplicate channels.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const channel = supabase
      .channel(`business-messages:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const row = payload.new as {
            sender_id?: string;
            match_id?: string;
          };

          if (row.sender_id === userId) return;
          if (!row.match_id) return;

          const { data: match } = await supabase
            .from("matches")
            .select("business_id, creator:users!matches_creator_id_fkey(name)")
            .eq("id", row.match_id)
            .single();

          if (!match || (match as { business_id?: string }).business_id !== userId) return;

          const creatorName = (match as { creator?: { name?: string } }).creator?.name ?? "A creator";

          addToast({
            type: "message",
            title: "New creator message",
            message: `${creatorName} sent you a message.`,
            meta: "Unread conversation",
            actionLabel: "Open chat",
            href: `/matches/${row.match_id}`,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Re-subscribing on supabase/play changes is unnecessary and causes duplicate channels.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex flex-col-reverse gap-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[390px]"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastShell key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastShell({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const inner = (
    <div
      className={`itender-toast group relative overflow-hidden rounded-2xl border bg-white shadow-[0_16px_36px_rgba(22,20,18,0.12)] ring-1 ring-white/70 ${
        toast.type === "application"
          ? "border-coral/20"
          : "border-moss/20"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1.5 ${
          toast.type === "application" ? "bg-coral" : "bg-moss"
        }`}
      />
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-blush/55 blur-2xl" />
      <div className="relative flex gap-3 px-4 py-4 pl-5 text-ink">
        <div
          className={`relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            toast.type === "application"
              ? "border-coral/20 bg-coral/10 text-coral"
              : "border-moss/20 bg-moss/10 text-moss"
          }`}
        >
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
              toast.type === "application" ? "bg-coral" : "bg-moss"
            }`}
          />
          {toast.type === "application" ? <ApplicationIcon /> : <MessageIcon />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    toast.type === "application" ? "bg-coral" : "bg-moss"
                  }`}
                />
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40">
                  Live update
                </p>
              </div>
              <p className="mt-1 text-sm font-bold leading-snug text-ink">{toast.title}</p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDismiss();
              }}
              className="pointer-events-auto -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/30 transition hover:bg-black/[0.04] hover:text-ink"
              aria-label="Dismiss notification"
            >
              <CloseIcon />
            </button>
          </div>

          <p className="mt-1.5 text-sm leading-5 text-ink/65">{toast.message}</p>
          {toast.meta ? <p className="mt-1 truncate text-xs font-medium text-ink/40">{toast.meta}</p> : null}

          {toast.href ? (
            <div
              className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold ${
                toast.type === "application" ? "text-coral" : "text-moss"
              }`}
            >
              {toast.actionLabel ?? (toast.type === "application" ? "Review applicant" : "Open chat")}
              <ArrowIcon />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return toast.href ? (
    <Link href={toast.href} className="pointer-events-auto block transition hover:-translate-y-0.5 active:scale-[0.98]">
      {inner}
    </Link>
  ) : (
    <div className="pointer-events-auto">{inner}</div>
  );
}

function ApplicationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7.5H16M8 11.5H14M8 15.5H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6.5 3.75H17.5C18.88 3.75 20 4.87 20 6.25V17.75C20 19.13 18.88 20.25 17.5 20.25H6.5C5.12 20.25 4 19.13 4 17.75V6.25C4 4.87 5.12 3.75 6.5 3.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M16.25 15.75L18 17.5L21 14.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 17.25V7.75C5 6.23 6.23 5 7.75 5H16.25C17.77 5 19 6.23 19 7.75V13.25C19 14.77 17.77 16 16.25 16H10L6.6 18.55C5.94 19.05 5 18.58 5 17.75V17.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.5 9.25H15.5M8.5 12.25H13.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.25 4.25L11.75 11.75M11.75 4.25L4.25 11.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M4.25 2.5L8.25 6.5L4.25 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
