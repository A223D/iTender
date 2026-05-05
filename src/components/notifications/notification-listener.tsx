"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { createClient } from "@/utils/supabase/client";

const MAX_TOASTS = 4;

type Toast = {
  id: string;
  message: string;
  type: "application" | "message";
  href?: string;
};

// ── Audio ──────────────────────────────────────────────────────────────────────

function useNotificationAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  // Create context on mount — starts suspended but ready to resume on gesture
  useEffect(() => {
    try { ctxRef.current = new AudioContext(); } catch { /* unavailable */ }
  }, []);

  // Resume on any user gesture (required by browser autoplay policy)
  useEffect(() => {
    function resume() { ctxRef.current?.resume().catch(() => {}); }
    document.addEventListener("click", resume);
    document.addEventListener("keydown", resume);
    return () => {
      document.removeEventListener("click", resume);
      document.removeEventListener("keydown", resume);
    };
  }, []);

  // Keep-alive: play a silent 1-sample buffer every 20s so the browser
  // doesn't auto-suspend an idle AudioContext
  useEffect(() => {
    const id = setInterval(() => {
      const ctx = ctxRef.current;
      if (!ctx || ctx.state !== "running") return;
      const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    }, 20_000);
    return () => clearInterval(id);
  }, []);

  function play() {
    const ctx = ctxRef.current;
    if (!ctx) return;

    function beep() {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.connect(gain);
      gain.connect(ctx!.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.1, ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx!.currentTime + 0.3);
      osc.start(ctx!.currentTime);
      osc.stop(ctx!.currentTime + 0.3);
    }

    if (ctx.state === "running") {
      beep();
    } else {
      ctx.resume().then(beep).catch(() => {});
    }
  }

  return play;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function NotificationListener({
  userId,
  campaignIds,
}: {
  userId: string;
  campaignIds: string[];
}) {
  const supabase = createClient();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const play = useNotificationAudio();

  // Keep a ref so Realtime callbacks always see the latest campaignIds
  // without needing to re-subscribe every time the array changes
  const campaignIdsRef = useRef(campaignIds);
  useEffect(() => { campaignIdsRef.current = campaignIds; }, [campaignIds]);

  function addToast(toast: Omit<Toast, "id">) {
    play();
    setToasts((prev) => {
      const next = [...prev, { id: `${Date.now()}-${Math.random()}`, ...toast }];
      return next.slice(-MAX_TOASTS); // keep only the 4 most recent
    });
  }

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Swipes — new creator applications ─────────────────────────────────────
  // Subscribe to ALL swipe inserts and filter client-side.
  // Supabase Realtime's `in` filter for postgres_changes is unreliable;
  // client-side is simpler and always correct.
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

          let message = "A creator applied to your campaign";

          const [{ data: creator }, { data: campaign }] = await Promise.all([
            row.creator_id
              ? supabase.from("users").select("name").eq("id", row.creator_id).single()
              : Promise.resolve({ data: null }),
            row.campaign_id
              ? supabase.from("campaigns").select("title").eq("id", row.campaign_id).single()
              : Promise.resolve({ data: null }),
          ]);

          if (creator?.name) message = `${creator.name} applied to your campaign`;
          if (campaign?.title) message += ` "${campaign.title}"`;

          addToast({
            message,
            type: "application",
            href: row.campaign_id ? `/campaigns/${row.campaign_id}` : undefined,
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Messages — new creator messages ───────────────────────────────────────
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

          if (row.sender_id === userId) return; // ignore own messages
          if (!row.match_id) return;

          const { data: match } = await supabase
            .from("matches")
            .select("business_id, creator:users!matches_creator_id_fkey(name)")
            .eq("id", row.match_id)
            .single();

          if (!match || (match as { business_id?: string }).business_id !== userId) return;

          const creatorName =
            (match as { creator?: { name?: string } }).creator?.name ?? "A creator";

          addToast({
            message: `${creatorName} sent you a message`,
            type: "message",
            href: `/matches/${row.match_id}`,
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2.5"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const inner = (
          <div
            className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-xl ${
              toast.type === "application"
                ? "bg-coral"
                : "bg-moss"
            }`}
          >
            <span className="mt-px text-base leading-none shrink-0">
              {toast.type === "application" ? "💌" : "💬"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-snug">
                {toast.message}
              </p>
              {toast.href ? (
                <p className="mt-0.5 text-xs text-white/65">
                  {toast.type === "application" ? "View applicants →" : "Open chat →"}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dismiss(toast.id);
              }}
              className="shrink-0 mt-0.5 text-lg leading-none text-white/50 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );

        return toast.href ? (
          <Link
            key={toast.id}
            href={toast.href}
            className="block transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            {inner}
          </Link>
        ) : (
          <div key={toast.id}>{inner}</div>
        );
      })}
    </div>
  );
}
