import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sendWelcomeEmail } from "@/lib/email";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[auth/callback] Exchange error:", exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  // Upsert users row — all iTender sign-ups are businesses
  await supabase.from("users").upsert(
    {
      id: user.id,
      role: "business",
      name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
      email: user.email ?? "",
    },
    { onConflict: "id" },
  );

  // Check if this user has already completed business onboarding
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (profile) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // New user — send welcome email (fire-and-forget, never block the redirect)
  if (user.email) {
    sendWelcomeEmail(user.email).catch((e) =>
      console.error("[auth/callback] welcome email failed:", e),
    );
  }

  return NextResponse.redirect(`${origin}/onboarding/business`);
}
