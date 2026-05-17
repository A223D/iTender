"use client";

import { useState } from "react";

import type { CreatorProfile } from "@/app/creators/[id]/page";
import { formatFollowers } from "@/lib/formatters";

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

function socialUrl(platform: "instagram" | "tiktok" | "youtube", handle: string): string {
  const h = normalizeHandle(handle);
  if (platform === "instagram") return `https://www.instagram.com/${h}`;
  if (platform === "tiktok") return `https://www.tiktok.com/@${h}`;
  return `https://www.youtube.com/@${h}`;
}

// ── Platform icons ─────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.79 1.53V7.11a4.85 4.85 0 0 1-1.02-.42z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.19a3 3 0 0 0-2.12-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.57A3 3 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3 3 0 0 0 2.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 0 0 2.12-2.12A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  );
}

// ── Platform config ────────────────────────────────────────────────────────────

const PLATFORM_CONFIG = {
  instagram: { label: "Instagram", icon: <InstagramIcon /> },
  tiktok:    { label: "TikTok",    icon: <TikTokIcon /> },
  youtube:   { label: "YouTube",   icon: <YouTubeIcon /> },
} as const;

// ── Main component ─────────────────────────────────────────────────────────────

export function CreatorProfileView({ profile }: { profile: CreatorProfile }) {
  const cp = profile.creator_profiles;
  const photo = cp?.profile_photo_url ?? profile.avatar_url;
  const initial = profile.name?.[0]?.toUpperCase() ?? "?";
  const bio = cp?.bio?.trim() ?? "";
  const categories = cp?.brand_categories ?? [];

  const platforms = [
    cp?.instagram_handle ? { platform: "instagram" as const, handle: cp.instagram_handle, followers: cp.instagram_followers ?? 0 } : null,
    cp?.tiktok_handle ? { platform: "tiktok" as const, handle: cp.tiktok_handle, followers: cp.tiktok_followers ?? 0 } : null,
    cp?.youtube_handle ? { platform: "youtube" as const, handle: cp.youtube_handle, followers: cp.youtube_followers ?? 0 } : null,
  ].filter(Boolean) as { platform: "instagram" | "tiktok" | "youtube"; handle: string; followers: number }[];

  const rawGallery = cp?.gallery_images ?? [];
  const galleryUrls = rawGallery
    .map((item) => (typeof item === "string" ? item : item.url))
    .filter(Boolean) as string[];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="glass relative overflow-hidden rounded-none border-t-0 border-l-0 border-r-0 border-b border-b-white/10"
        style={{ minHeight: "220px" }}
      >

        {/* Cinematic blurred photo background */}
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.22] blur-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070E]/95 via-[#07070E]/55 to-[#07070E]/25" />
          </>
        ) : null}

        {/* Close button */}
        <div className="relative px-4 pt-5 sm:px-6">
          <button
            type="button"
            onClick={() => window.close()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/45 transition hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Close
          </button>
        </div>

        {/* Avatar — centered, overlaps hero/body boundary */}
        <div className="relative flex justify-center pb-0 pt-8">
          <div className="absolute bottom-0 translate-y-1/2">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={profile.name}
                className="h-24 w-24 rounded-full object-cover shadow-2xl ring-4 ring-white/20"
              />
            ) : (
              <div className="glass flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-[var(--color-text)] shadow-2xl ring-4 ring-white/20">
                {initial}
              </div>
            )}
          </div>
          {/* Spacer so the hero has height for the avatar to sit in */}
          <div className="h-12" />
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="pb-20">
        <div className="mx-auto max-w-lg px-4 sm:px-6">

          {/* Name + city (padded to clear avatar overlap) */}
          <div className="pb-6 pt-16 text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">{profile.name}</h1>
            {profile.city ? (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{profile.city}</p>
            ) : null}
          </div>

          {/* Platform stat cards */}
          {platforms.length > 0 ? (
            <div className={`mb-5 grid gap-3 ${
              platforms.length === 1 ? "grid-cols-1" :
              platforms.length === 2 ? "grid-cols-2" :
              "grid-cols-3"
            }`}>
              {platforms.map((p) => {
                const config = PLATFORM_CONFIG[p.platform];
                return (
                  <a
                    key={p.platform}
                    href={socialUrl(p.platform, p.handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass group flex flex-col rounded-2xl p-4 transition hover:opacity-80"
                  >
                    <div className="mb-2 flex items-center gap-1.5 text-[var(--color-text-muted)]">
                      {config.icon}
                      <p className="text-[10px] font-bold uppercase tracking-wide">{config.label}</p>
                    </div>
                    <p className="text-lg font-bold text-[var(--color-text)]">{formatFollowers(p.followers)}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--color-text-hint)]">@{normalizeHandle(p.handle)}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-muted)] opacity-60 transition group-hover:opacity-100">
                      View profile
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 8L8 2M8 2H3M8 2v5" />
                      </svg>
                    </span>
                  </a>
                );
              })}
            </div>
          ) : null}

          {/* Bio */}
          {bio ? (
            <div className="glass mb-4 rounded-2xl px-5 py-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-hint)]">About</p>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{bio}</p>
            </div>
          ) : null}

          {/* Categories */}
          {categories.length > 0 ? (
            <div className="glass mb-4 rounded-2xl px-5 py-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-hint)]">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span key={cat} className="glass rounded-full px-3 py-1 text-sm text-[var(--color-text-muted)]">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Gallery */}
          {galleryUrls.length > 0 ? (
            <div>
              <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-hint)]">Gallery</p>
              <div className="grid grid-cols-3 gap-1.5">
                {galleryUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
            </div>
          ) : null}

        </div>
      </div>
    </>
  );
}
