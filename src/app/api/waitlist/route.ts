import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

type WaitlistRole = "creator" | "brand";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_PATTERN = /^https?:\/\//i;

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeWebsite(value: unknown) {
  const website = cleanString(value, 255);
  if (!website) return "";
  return WEBSITE_PATTERN.test(website) ? website : `https://${website}`;
}

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return error("Invalid waitlist submission.");
  }

  const payload = body as Record<string, unknown>;
  const role = payload.role === "brand" ? "brand" : payload.role === "creator" ? "creator" : "";
  const name = cleanString(payload.name, 120);
  const email = cleanString(payload.email, 254).toLowerCase();
  const phone = cleanString(payload.phone, 40);
  const instagramHandle = cleanString(payload.instagramHandle, 80).replace(/^@+/, "");
  const companyName = cleanString(payload.companyName, 160);
  const websiteUrl = normalizeWebsite(payload.websiteUrl);

  if (!name) return error("Enter your name.");
  if (!email && !phone) return error("Enter an email or phone number.");
  if (email && !EMAIL_PATTERN.test(email)) return error("Enter a valid email address.");
  if (!role) return error("Select whether you are a creator or brand.");
  if (role === "creator" && !instagramHandle) return error("Enter your Instagram handle.");
  if (role === "brand" && !companyName) return error("Enter your company name.");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error: insertError } = await supabase.from("waitlist_entries").insert({
    name,
    email: email || null,
    phone: phone || null,
    role: role as WaitlistRole,
    instagram_handle: role === "creator" ? instagramHandle : null,
    company_name: role === "brand" ? companyName : null,
    website_url: role === "brand" && websiteUrl ? websiteUrl : null,
    source: "homepage",
    user_agent: request.headers.get("user-agent"),
  });

  if (insertError) {
    return error("Could not join the waitlist right now.", 500);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
