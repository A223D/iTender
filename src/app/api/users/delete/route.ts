import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { executeUserDeletion } from "@/lib/delete-user";

export async function POST(request: Request) {
  if (!process.env.ADMIN_SECRET) {
    console.error("[api/users/delete] ADMIN_SECRET env var not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Admin path: valid x-admin-secret header bypasses session check
  const adminSecret = request.headers.get("x-admin-secret");
  const isAdmin = adminSecret && adminSecret === process.env.ADMIN_SECRET;

  if (!isAdmin) {
    // Self-deletion: session user must match the requested userId
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const result = await executeUserDeletion(userId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, warnings: result.storageWarnings ?? [] });
}
