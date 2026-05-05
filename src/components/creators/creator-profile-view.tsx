"use client";

import { useState } from "react";

import type { CreatorProfile } from "@/app/creators/[id]/page";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatFollowers(n: number | null): string {
  if (!n || n === 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

function socialUrl(platform: "instagram" | "tiktok" | "youtube", handle: string): string {
  const h = normalizeHandle(handle);
  if (platform === "instagram") return `https://www.instagram.com/${h}`;
  if (platform === "tiktok") return `https://www.tiktok.com/@${h}`;
  return `https://www.youtube.com/@${h}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.79 1.53V7.11a4.85 4.85 0 0 1-1.02-.42z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.19a3 3 0 0 0-2.12-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.57A3 3 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3 3 0 0 0 2.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 0 0 2.12-2.12A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  );
}

function PlatformRow({
  platform,
  handle,
  followers,
}: {
  platform: "instagram" | "tiktok" | "youtube";
  handle: string;
  followers: number | null;
}) {
  const label = platform === "instagram" ? "Instagram" : platform === "tiktok" ? "TikTok" : "YouTube";
  const url = socialUrl(platform, handle);
  const displayHandle = `@${normalizeHandle(handle)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-black/[0.03]"
    >
      <span className="text-coral">{
        platform === "instagram" ? <InstagramIcon /> :
        platform === "tiktok" ? <TikTokIcon /> :
        <YouTubeIcon />
      }</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink/45">{label}</p>
        <p className="text-sm font-semibold text-ink underline underline-offset-2 decoration-ink/20">{displayHandle}</p>
      </div>
      {followers ? (
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-ink">{formatFollowers(followers)}</p>
          <p className="text-xs text-ink/40">followers</p>
        </div>
      ) : null}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink/30">
        <path d="M3 9l6-6M9 3H3M9 3v6" />
      </svg>
    </a>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CreatorProfileView({ profile }: { profile: CreatorProfile }) {
  const cp = profile.creator_profiles;
  const photo = cp?.profile_photo_url ?? profile.avatar_url;
  const initial = profile.name?.[0]?.toUpperCase() ?? "?";
  const bio = cp?.bio?.trim() ?? "";
  const categories = cp?.brand_categories ?? [];

  const platforms: { platform: "instagram" | "tiktok" | "youtube"; handle: string; followers: number | null }[] = [
    cp?.instagram_handle ? { platform: "instagram", handle: cp.instagram_handle, followers: cp.instagram_followers ?? null } : null,
    cp?.tiktok_handle ? { platform: "tiktok", handle: cp.tiktok_handle, followers: cp.tiktok_followers ?? null } : null,
    cp?.youtube_handle ? { platform: "youtube", handle: cp.youtube_handle, followers: cp.youtube_followers ?? null } : null,
  ].filter(Boolean) as { platform: "instagram" | "tiktok" | "youtube"; handle: string; followers: number | null }[];

  const rawGallery = cp?.gallery_images ?? [];
  const galleryUrls = rawGallery
    .map((item) => (typeof item === "string" ? item : item.url))
    .filter(Boolean) as string[];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      {/* Lightbox */}
      {lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={galleryUrls[lightboxIndex]}
            alt="Gallery"
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Prev */}
          {lightboxIndex > 0 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
              aria-label="Previous"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 12L6 8l4-4" /></svg>
            </button>
          ) : null}
          {/* Next */}
          {lightboxIndex < galleryUrls.length - 1 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
              aria-label="Next"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 12l4-4-4-4" /></svg>
            </button>
          ) : null}
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 2l12 12M14 2L2 14" /></svg>
          </button>
        </div>
      ) : null}

      {/* Page */}
      <div className="mx-auto max-w-lg px-4 pb-16 pt-8">

        {/* Close tab */}
        <button
          type="button"
          onClick={() => window.close()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/50 transition hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11L5 7l4-4" />
          </svg>
          Close
        </button>

        {/* Avatar + name + city */}
        <div className="mb-8 flex flex-col items-center text-center">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={profile.name}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-coral to-violet text-3xl font-bold text-white ring-4 ring-white shadow-md">
              {initial}
            </div>
          )}
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">{profile.name}</h1>
          {profile.city ? (
            <p className="mt-1 text-sm text-ink/45">{profile.city}</p>
          ) : null}
        </div>

        {/* Bio */}
        {bio ? (
          <section className="mb-5">
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
              <p className="text-sm leading-relaxed text-ink/70">{bio}</p>
            </div>
          </section>
        ) : null}

        {/* Platforms */}
        {platforms.length > 0 ? (
          <section className="mb-5">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink/40">Platforms</h2>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm divide-y divide-black/[0.06]">
              {platforms.map((p) => (
                <PlatformRow key={p.platform} platform={p.platform} handle={p.handle} followers={p.followers} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Categories */}
        {categories.length > 0 ? (
          <section className="mb-5">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink/40">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat} className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-ink/60">
                  {cat}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* Gallery */}
        {galleryUrls.length > 0 ? (
          <section className="mb-5">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink/40">Gallery</h2>
            <div className="grid grid-cols-3 gap-1.5">
              {galleryUrls.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Gallery ${i + 1}`}
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}

      </div>
    </>
  );
}
