"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";

const MAX_TOASTS = 4;

// ── Audio ──────────────────────────────────────────────────────────────────────

function useNotificationAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try { ctxRef.current = new AudioContext(); } catch { /* unavailable */ }
  }, []);

  useEffect(() => {
    function resume() { ctxRef.current?.resume().catch(() => {}); }
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
    if (ctx.state === "running") beep();
    else ctx.resume().then(beep).catch(() => {});
  }

  return play;
}

// ── Toast UI ───────────────────────────────────────────────────────────────────

function NotificationToast({
  id,
  message,
  type,
  href,
  onNavigate,
}: {
  id: string | number;
  message: string;
  type: "application" | "message";
  href?: string;
  onNavigate?: () => void;
}) {
  const isApplication = type === "application";

  return (
    <div className="glass-ambient relative flex w-[340px] overflow-hidden rounded-2xl">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 h-full w-[3px] ${isApplication ? "bg-[var(--color-text)]" : "bg-[var(--color-accent-fg)]"}`} />

      {/* Body */}
      <div className="flex min-w-0 flex-1 items-start gap-3 py-4 pl-5 pr-4">
        {/* Icon badge */}
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base bg-white/[0.10] dark:bg-white/[0.10]"
        >
          {isApplication ? "💌" : "💬"}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-[var(--color-text)]">
            {isApplication ? "New application" : "New message"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[var(--color-text-muted)]">{message}</p>
          {href ? (
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                toast.dismiss(id);
              }}
              className="mt-2 text-xs font-semibold text-[var(--color-text-muted)] transition-opacity hover:opacity-70"
            >
              {isApplication ? "View applicants →" : "Open chat →"}
            </button>
          ) : null}
        </div>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-white/[0.08] hover:text-[var(--color-text)]"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M1 1l8 8M9 1L1 9" />
        </svg>
      </button>
    </div>
  );
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
  const play = useNotificationAudio();
  const router = useRouter();
  const pathname = usePathname();

  const campaignIdsRef = useRef(campaignIds);
  useEffect(() => { campaignIdsRef.current = campaignIds; }, [campaignIds]);

  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  // Track active toast IDs so we can enforce the MAX_TOASTS cap
  const toastIdsRef = useRef<(string | number)[]>([]);

  function showToast({
    message,
    type,
    href,
  }: {
    message: string;
    type: "application" | "message";
    href?: string;
  }) {
    play();

    // Dismiss oldest if at cap
    if (toastIdsRef.current.length >= MAX_TOASTS) {
      toast.dismiss(toastIdsRef.current[0]);
      toastIdsRef.current = toastIdsRef.current.slice(1);
    }

    const id = `notif-${Date.now()}-${Math.random()}`;
    toastIdsRef.current.push(id);

    toast.custom(
      (t) => (
        <NotificationToast
          id={t}
          message={message}
          type={type}
          href={href}
          onNavigate={href ? () => router.push(href) : undefined}
        />
      ),
      {
        id,
        duration: Infinity,
        onDismiss: () => {
          toastIdsRef.current = toastIdsRef.current.filter((i) => i !== id);
        },
      },
    );
  }

  // ── Swipes — new creator applications ─────────────────────────────────────
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

          showToast({
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

          if (row.sender_id === userId) return;
          if (!row.match_id) return;

          const { data: match } = await supabase
            .from("matches")
            .select("business_id, creator:users!matches_creator_id_fkey(name)")
            .eq("id", row.match_id)
            .single();

          if (!match || (match as { business_id?: string }).business_id !== userId) return;

          const creatorName =
            (match as { creator?: { name?: string } }).creator?.name ?? "A creator";

          if (pathnameRef.current.startsWith("/matches")) {
            play();
          } else {
            showToast({
              message: `${creatorName} sent you a message`,
              type: "message",
              href: `/matches/${row.match_id}`,
            });
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return null;
}

