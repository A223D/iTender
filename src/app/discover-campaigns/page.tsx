import { cookies } from "next/headers";

import { CampaignBoard } from "@/components/discover/campaign-board";
import { NavBar } from "@/components/discover/nav-bar";
import { audienceCookieName, getSelectedAudience } from "@/lib/audience";
import { Campaign } from "@/types/jobs";
import { createClient } from "@/utils/supabase/server";

export default async function DiscoverCampaignsPage() {
  const cookieStore = await cookies();
  const selectedAudience = getSelectedAudience(cookieStore.get(audienceCookieName)?.value);

  const supabase = createClient(cookieStore);

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
      id,
      title,
      description,
      content_types,
      occasion,
      compensation_type,
      compensation_details,
      creators_needed,
      deadline,
      interested_count,
      status,
      users!campaigns_business_id_fkey(
        business_profiles(brand_name, cuisine_type)
      )
    `,
    )
    .eq("status", "live")
    .gte("deadline", today)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[discover-campaigns] Query error:", error.code, error.message);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const now = Date.now();

  const campaigns: Campaign[] = (data ?? []).map((row) => {
    const usersNode = Array.isArray(row.users) ? row.users[0] : row.users;
    const bpNode = usersNode?.business_profiles;
    const bp = Array.isArray(bpNode) ? bpNode[0] : bpNode;

    const daysLeft = Math.max(0, Math.ceil((new Date(row.deadline).getTime() - now) / msPerDay));

    return {
      id: row.id,
      title: row.title ?? "Untitled Campaign",
      description: row.description ?? "",
      content_types: row.content_types ?? [],
      occasion: row.occasion ?? "",
      compensation_type: row.compensation_type ?? "",
      compensation_details: row.compensation_details ?? "",
      creators_needed: row.creators_needed ?? 1,
      deadline: row.deadline,
      interested_count: row.interested_count ?? 0,
      brand_name: bp?.brand_name ?? "Unknown Brand",
      // cuisine_type is the actual column name in the live DB (categories rename not yet migrated)
      brand_categories: (bp as { cuisine_type?: string[]; brand_name?: string })?.cuisine_type ?? [],
      days_left: daysLeft,
    };
  });

  return (
    <main className="min-h-screen lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
      <NavBar initialAudience={selectedAudience} />
      <CampaignBoard initialCampaigns={campaigns} />
    </main>
  );
}
