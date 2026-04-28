export const audienceCookieName = "scout_audience";

export const audienceOptions = ["creator", "business"] as const;

export type Audience = (typeof audienceOptions)[number];

export function isAudience(value: string | undefined): value is Audience {
  return value === "creator" || value === "business";
}
