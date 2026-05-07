import { NextResponse } from "next/server";

import { sendMessageEmail } from "@/lib/email";
import { createServiceClient } from "@/utils/supabase/service";
import { APP_URL, MESSAGE_PREVIEW_MAX } from "@/lib/app-config";

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload?.record) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { match_id, sender_id, content } = payload.record;

  if (!match_id || !sender_id) {
    return NextResponse.json({ ok: true });
  }

  // Service-role client: server-side only, never exposed to browser
  const supabase = createServiceClient();

  const { data: match } = await supabase
    .from("matches")
    .select("business_id, creator_id")
    .eq("id", match_id)
    .single();

  if (!match) {
    console.error("[webhook/new-message] match not found:", match_id);
    return NextResponse.json({ ok: true });
  }

  if (sender_id !== match.creator_id) {
    return NextResponse.json({ ok: true });
  }

  const [businessResult, creatorResult] = await Promise.all([
    supabase.from("users").select("email").eq("id", match.business_id).single(),
    supabase.from("users").select("name").eq("id", match.creator_id).single(),
  ]);

  if (!businessResult.data?.email) {
    console.error("[webhook/new-message] no email for business:", match.business_id);
    return NextResponse.json({ ok: true });
  }

  const creatorName = creatorResult.data?.name ?? "A creator";
  const preview = typeof content === "string"
    ? content.slice(0, MESSAGE_PREVIEW_MAX) + (content.length > MESSAGE_PREVIEW_MAX ? "…" : "")
    : "";

  await sendMessageEmail({
    to: businessResult.data.email,
    creatorName,
    messagePreview: preview,
    chatUrl: `${APP_URL}/matches/${match_id}`,
  });

  return NextResponse.json({ ok: true });
}
