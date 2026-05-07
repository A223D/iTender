"use client";

import Link from "next/link";

import { formatFollowers } from "@/lib/formatters";

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

  return (
    <div className="overflow-hidden rounded-2xl border border-l-2 border-black/[0.08] border-l-moss/30 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={creator.name} className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-coral/20 to-violet/20 text-sm font-bold text-ink/60">
                {creator.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name / handle / profile link */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{creator.name}</p>
            {handle ? <p className="text-xs text-ink/45">{handle}</p> : null}
            <Link
              href={`/creators/${creator.id}`}
              target="_blank"
              className="text-xs font-medium text-moss/70 transition hover:text-moss"
            >
              View profile ↗
            </Link>

            {/* Platform follower pills */}
            {platforms.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <span key={p.label} className="rounded-full bg-black/[0.05] px-2.5 py-1 text-xs font-bold text-ink/65">
                    {p.label} {formatFollowers(p.count)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Bio */}
        {creator.bio ? (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-ink/60">{creator.bio}</p>
        ) : null}

        {/* Category tags */}
        {creator.brand_categories.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {creator.brand_categories.map((cat) => (
              <span key={cat} className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs text-ink/55">
                {cat}
              </span>
            ))}
          </div>
        ) : null}

        {/* Pitch */}
        {creator.pitch ? (
          <div className="mt-4 rounded-xl border border-moss/20 bg-moss/[0.04] px-4 py-3">
            <p className="mb-1 text-xs font-semibold text-moss">Why they&apos;re a fit</p>
            <p className="text-sm leading-5 text-ink/70">{creator.pitch}</p>
          </div>
        ) : null}

        {/* Action row */}
        <div className="mt-4 flex items-center justify-end gap-2">
          {matchId ? (
            <>
              <span className="rounded-full bg-moss/10 px-3 py-1.5 text-xs font-semibold text-moss">
                Accepted ✓
              </span>
              <Link
                href={`/matches/${matchId}`}
                className="rounded-xl bg-moss px-3 py-1.5 text-xs font-bold text-white transition hover:bg-moss/90"
              >
                Message →
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={onAccept}
              disabled={accepting}
              className="rounded-xl bg-moss px-3 py-1.5 text-xs font-bold text-white transition hover:bg-moss/90 disabled:opacity-60"
            >
              {accepting ? "Accepting…" : "Accept"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
