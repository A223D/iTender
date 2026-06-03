export type WaitlistRole = "creator" | "brand";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_PATTERN = /^https?:\/\//i;

export function cleanString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function normalizeWebsite(value: unknown): string {
  const website = cleanString(value, 255);
  if (!website) return "";
  return WEBSITE_PATTERN.test(website) ? website : `https://${website}`;
}

export type WaitlistPayload = {
  name: string;
  email: string;
  phone: string;
  role: WaitlistRole | "";
  instagramHandle: string;
  companyName: string;
  websiteUrl: string;
};

export type WaitlistValidationError = { field: string; message: string };

/** Returns null when valid, or a validation error when invalid. */
export function validateWaitlistPayload(raw: Record<string, unknown>): WaitlistValidationError | null {
  const role =
    raw.role === "brand" ? "brand" : raw.role === "creator" ? "creator" : "";
  const name = cleanString(raw.name, 120);
  const email = cleanString(raw.email, 254).toLowerCase();
  const phone = cleanString(raw.phone, 40);
  const instagramHandle = cleanString(raw.instagramHandle, 80).replace(/^@+/, "");
  const companyName = cleanString(raw.companyName, 160);

  if (!name) return { field: "name", message: "Enter your name." };
  if (!email && !phone) return { field: "contact", message: "Enter an email or phone number." };
  if (email && !EMAIL_PATTERN.test(email)) return { field: "email", message: "Enter a valid email address." };
  if (!role) return { field: "role", message: "Select whether you are a creator or brand." };
  if (role === "creator" && !instagramHandle) return { field: "instagramHandle", message: "Enter your Instagram handle." };
  if (role === "brand" && !companyName) return { field: "companyName", message: "Enter your company name." };

  return null;
}

/** Normalizes and returns the clean waitlist fields ready for DB insertion. */
export function normalizeWaitlistPayload(raw: Record<string, unknown>): WaitlistPayload & { role: WaitlistRole } {
  const role = raw.role === "brand" ? "brand" : ("creator" as WaitlistRole);
  const name = cleanString(raw.name, 120);
  const email = cleanString(raw.email, 254).toLowerCase();
  const phone = cleanString(raw.phone, 40);
  const instagramHandle = cleanString(raw.instagramHandle, 80).replace(/^@+/, "");
  const companyName = cleanString(raw.companyName, 160);
  const websiteUrl = normalizeWebsite(raw.websiteUrl);
  return { role, name, email, phone, instagramHandle, companyName, websiteUrl };
}
