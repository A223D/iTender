"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { formatFollowers } from "@/lib/formatters";
import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { Spinner } from "@/components/ui/spinner";

export type NormalizedCreator = {
  pitch: string | null;
  created_at: string;
  id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  profile_photo_url: string | null;
  bio: string | null;
  brand_categories: string[];
  instagram_handle: string | null;
  instagram_followers: number;
  tiktok_handle: string | null;
  tiktok_followers: number;
  youtube_handle: string | null;
  youtube_followers: number;
};

export function CreatorCard({
  creator,
  matchId,
  accepting,
  onAccept,
}: {
  creator: NormalizedCreator;
  matchId: string | null;
  accepting: boolean;
  onAccept: () => void;
}) {
  const photo = creator.profile_photo_url ?? creator.avatar_url;
  const handle = creator.instagram_handle ? `@${creator.instagram_handle}` : creator.city ?? null;
  const platforms = [
    { label: "IG", count: creator.instagram_followers },
    { label: "TK", count: creator.tiktok_followers },
    { label: "YT", count: creator.youtube_followers },
  ].filter((p) => p.count > 0);

  const prevMatchId = useRef(matchId);
  const [celebrateKey, setCelebrateKey] = useState(0);
  useEffect(() => {
    if (matchId && !prevMatchId.current) setCelebrateKey((k) => k + 1);
    prevMatchId.current = matchId;
  }, [matchId]);

  return (
    <div className="glass relative overflow-hidden rounded-2xl border-l-2 border-l-white/20">
      <ConfettiBurst trigger={celebrateKey} count={40} />
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={creator.name} className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-700/20 text-sm font-bold text-[var(--color-text-muted)]">
                {creator.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name / handle / profile link */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[var(--color-text)]">{creator.name}</p>
            {handle ? <p className="text-xs text-[var(--color-text-muted)]">{handle}</p> : null}
            <Link
              href={`/creators/${creator.id}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-hint)] transition hover:text-[var(--color-text-muted)]"
            >
              View profile
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10L10 2M10 2H5M10 2V7" />
              </svg>
            </Link>

            {/* Platform follower pills */}
            {platforms.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <span key={p.label} className="rounded-full bg-black/[0.05] px-2.5 py-1 text-xs font-bold text-[var(--color-text-muted)]">
                    {p.label} {formatFollowers(p.count)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Bio */}
        {creator.bio ? (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-[var(--color-text-muted)]">{creator.bio}</p>
        ) : null}

        {/* Category tags */}
        {creator.brand_categories.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {creator.brand_categories.map((cat) => (
              <span key={cat} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                {cat}
              </span>
            ))}
          </div>
        ) : null}

        {/* Pitch */}
        {creator.pitch ? (
          <div className="mt-4 rounded-xl border border-white/20 bg-white/[0.08] px-4 py-3">
            <p className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">Why they&apos;re a fit</p>
            <p className="text-sm leading-5 text-[var(--color-text-muted)]">{creator.pitch}</p>
          </div>
        ) : null}

        {/* Action row */}
        <div className="mt-4 flex items-center justify-end gap-2">
          {matchId ? (
            <>
              <span className="scout-pop-in inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                Accepted
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              </span>
              <Link
                href={`/matches/${matchId}`}
                className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-fuchsia-700 px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
              >
                Message
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h8M7 3l3 3-3 3" />
                </svg>
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={onAccept}
              disabled={accepting}
              className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-fuchsia-700 px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {accepting ? <Spinner className="h-3.5 w-3.5" /> : "Accept"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
