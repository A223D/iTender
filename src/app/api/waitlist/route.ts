import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { validateWaitlistPayload, normalizeWaitlistPayload } from "@/lib/waitlist-validation";
import { createClient } from "@/utils/supabase/server";

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return error("Invalid waitlist submission.");
  }

  const payload = body as Record<string, unknown>;
  const validationError = validateWaitlistPayload(payload);
  if (validationError) {
    return error(validationError.message);
  }

  const { role, name, email, phone, instagramHandle, companyName, websiteUrl } =
    normalizeWaitlistPayload(payload);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error: insertError } = await supabase.from("waitlist_entries").insert({
    name,
    email: email || null,
    phone: phone || null,
    role,
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
