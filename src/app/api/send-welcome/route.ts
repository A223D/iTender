import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sendWelcomeEmail } from "@/lib/email";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch brand name if the business has already completed onboarding
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("brand_name")
    .eq("user_id", user.id)
    .single();

  await sendWelcomeEmail(user.email, profile?.brand_name ?? undefined);

  return NextResponse.json({ ok: true });
}
