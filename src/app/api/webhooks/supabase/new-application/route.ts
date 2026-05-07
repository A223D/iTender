import { NextResponse } from "next/server";

import { sendApplicationEmail } from "@/lib/email";
import { createServiceClient } from "@/utils/supabase/service";
import { APP_URL } from "@/lib/app-config";

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload?.record) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { direction, campaign_id, creator_id } = payload.record;

  if (direction !== "right") {
    return NextResponse.json({ ok: true });
  }

  // Service-role client: server-side only, never exposed to browser
  const supabase = createServiceClient();

  const [campaignResult, creatorResult] = await Promise.all([
    supabase.from("campaigns").select("title, business_id").eq("id", campaign_id).single(),
    supabase.from("users").select("name").eq("id", creator_id).single(),
  ]);

  if (!campaignResult.data) {
    console.error("[webhook/new-application] campaign not found:", campaign_id);
    return NextResponse.json({ ok: true });
  }

  const { title: campaignTitle, business_id } = campaignResult.data;
  const creatorName = creatorResult.data?.name ?? "A creator";

  const { data: businessUser } = await supabase
    .from("users")
    .select("email")
    .eq("id", business_id)
    .single();

  if (!businessUser?.email) {
    console.error("[webhook/new-application] no email for business:", business_id);
    return NextResponse.json({ ok: true });
  }

  await sendApplicationEmail({
    to: businessUser.email,
    creatorName,
    campaignTitle,
    dashboardUrl: `${APP_URL}/campaigns/${campaign_id}`,
  });

  return NextResponse.json({ ok: true });
}
