export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://itender.app";

export const FILE_SIZE_LIMITS = {
  logo: 5 * 1024 * 1024,   // 5 MB
  image: 5 * 1024 * 1024,  // 5 MB
  doc: 15 * 1024 * 1024,   // 15 MB
} as const;

export const UNREAD_BADGE_MAX = 9;

export const MESSAGE_PREVIEW_MAX = 120;

export const STALE_CAMPAIGN_DAYS = 7;

export const MS_PER_DAY = 1000 * 60 * 60 * 24;
