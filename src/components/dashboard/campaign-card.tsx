"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { COMP_LABELS } from "@/lib/campaign-constants";
import { MS_PER_DAY, STALE_CAMPAIGN_DAYS } from "@/lib/app-config";
import { daysLeft } from "@/lib/dates";


export type DashboardCampaign = {
  id: string;
  title: string | null;
  status: string;
  deadline: string;
  interested_count: number | null;
  content_types: unknown;
  description: string | null;
  photo_urls: unknown;
  created_at: string;
  compensation_type: string | null;
  creators_needed: number | null;
};

export function CampaignCard({ campaign }: { campaign: DashboardCampaign }) {
  const router = useRouter();
  const supabase = createClient();
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmClose(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const now = new Date().getTime();
  const left = daysLeft(campaign.deadline);
  const isExpiringSoon = left > 0 && left <= 3;
  const isExpired = left === 0;
  const ageInDays = Math.floor((now - new Date(campaign.created_at).getTime()) / MS_PER_DAY);
  const isStale = (campaign.interested_count ?? 0) === 0 && ageInDays >= STALE_CAMPAIGN_DAYS;
  const compLabel = COMP_LABELS[campaign.compensation_type ?? ""] ?? campaign.compensation_type ?? "";
  const heroUrl = (campaign.photo_urls as string[] | null)?.[0] ?? null;
  const initial = (campaign.title ?? "C")[0].toUpperCase();

  async function handleClose() {
    setClosing(true);
    const { error } = await supabase
      .from("campaigns")
      .update({ status: "closed" })
      .eq("id", campaign.id);

    if (error) {
      console.error("[dashboard] close error:", error.message);
      setClosing(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="glass group overflow-hidden transition hover:-translate-y-0.5 hover:opacity-90" style={{ borderRadius: 20 }}>

      {/* Clickable top section */}
      <Link href={`/campaigns/${campaign.id}`} className="block">
        {/* Hero */}
        <div className="relative h-40 overflow-hidden rounded-t-[20px] bg-white/[0.04]">
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-6xl font-bold text-[var(--color-text-hint)]">{initial}</span>
            </div>
          )}
          {heroUrl ? (
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          ) : null}
          <div className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm ${isExpired || isExpiringSoon ? "bg-error/80" : "bg-black/40"}`}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="6" cy="6" r="5" />
              <path d="M6 3v3l2 1.5" />
            </svg>
            {isExpired ? "Expired" : `${left}d left`}
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-0 pt-3.5">
          <h3 className="truncate font-bold text-[var(--color-text)]">{campaign.title ?? "Untitled Campaign"}</h3>
          {(campaign.content_types as string[] | null)?.length ? (
            <p className="mt-0.5 text-xs font-semibold text-[var(--color-text-muted)]">
              {(campaign.content_types as string[]).join(" · ")}
            </p>
          ) : null}
          {campaign.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--color-text-muted)]">{campaign.description}</p>
          ) : null}
        </div>

        {/* Compensation + creators needed */}
        <div className="mt-3 flex items-center gap-2 px-4 pb-1">
          {compLabel ? (
            <span className="glass rounded-full px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-muted)]">
              {compLabel}
            </span>
          ) : null}
          <span className="glass rounded-full px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-muted)]">
            {campaign.creators_needed ?? 1} creator{(campaign.creators_needed ?? 1) !== 1 ? "s" : ""} needed
          </span>
        </div>
      </Link>

      {/* Bottom bar */}
      <div className="mt-3 border-t border-white/[0.08]" />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {isStale ? (
            <span className="text-xs font-semibold text-amber-400">No interest yet — try updating</span>
          ) : (
            <span className="text-sm font-semibold text-[var(--color-text-muted)]">Interested Creators</span>
          )}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-[var(--color-text)] ${(campaign.interested_count ?? 0) > 0 ? "bg-white/20" : "bg-white/10"}`}>
            {campaign.interested_count ?? 0}
          </span>
        </div>

        {/* ⋯ action menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => { setMenuOpen((o) => !o); setConfirmClose(false); }}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--color-text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--color-text)]"
            aria-label="Campaign actions"
          >
            <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="2" cy="8" r="1.5" />
              <circle cx="2" cy="14" r="1.5" />
            </svg>
          </button>

          {menuOpen ? (
            <div className="glass-ambient absolute bottom-full right-0 z-20 mb-2 w-48 overflow-hidden">
              {confirmClose ? (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Close this campaign?</p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Creators won&apos;t see it on the feed.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmClose(false)}
                      disabled={closing}
                      className="flex-1 rounded-xl glass py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={closing}
                      className="flex-1 rounded-xl bg-error py-1.5 text-xs font-bold text-white transition hover:opacity-80 disabled:opacity-60"
                    >
                      {closing ? "…" : "Close"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--color-text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--color-text)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit campaign
                  </Link>
                  <div className="mx-3 border-t border-white/[0.08]" />
                  <button
                    type="button"
                    onClick={() => setConfirmClose(true)}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-error transition hover:bg-error/[0.08]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    Close campaign
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
