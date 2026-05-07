import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sendWelcomeEmail } from "@/lib/email";
import { createClient } from "@/utils/supabase/server";
import { upsertBusinessUser, postAuthRedirect } from "@/lib/user-auth";

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

  const { hasProfile } = await upsertBusinessUser(supabase, user);

  // New user — send welcome email (fire-and-forget, never block the redirect)
  if (!hasProfile && user.email) {
    sendWelcomeEmail(user.email).catch((e) =>
      console.error("[auth/callback] welcome email failed:", e),
    );
  }

  return NextResponse.redirect(`${origin}${postAuthRedirect(hasProfile)}`);
}
