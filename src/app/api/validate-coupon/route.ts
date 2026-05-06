import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ valid: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) {
    return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 });
  }

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("discount, max_uses, uses_count, expires_at")
    .eq("code", code)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ valid: false, error: "Invalid code" });
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "This code has expired" });
  }

  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
  }

  return NextResponse.json({ valid: true, discount: coupon.discount });
}
