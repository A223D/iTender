export const audienceCookieName = "scout_audience";

export const audienceOptions = ["creator", "business"] as const;

export type Audience = (typeof audienceOptions)[number];

export type HomeView = "chooser" | Audience;

export function isAudience(value: string | undefined): value is Audience {
  return value === "creator" || value === "business";
}

export function getSelectedAudience(value: string | undefined): Audience | null {
  return isAudience(value) ? value : null;
}

export function getAudienceCookieValue(audience: Audience) {
  return `${audienceCookieName}=${audience}; path=/; max-age=31536000; samesite=lax`;
}
