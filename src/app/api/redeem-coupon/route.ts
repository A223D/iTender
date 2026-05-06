import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const campaignId = typeof body?.campaignId === "string" ? body.campaignId : "";

  if (!code || !campaignId) {
    return NextResponse.json({ success: false, error: "Missing code or campaignId" }, { status: 400 });
  }

  // Verify this campaign belongs to the authenticated user
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("business_id", user.id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
  }

  // Atomically increment uses_count via SECURITY DEFINER RPC (bypasses RLS)
  const { error: rpcError } = await supabase.rpc("increment_coupon_uses", { p_code: code });
  if (rpcError) {
    console.error("[redeem-coupon] RPC error:", rpcError.message);
    return NextResponse.json({ success: false, error: "Failed to redeem coupon" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
