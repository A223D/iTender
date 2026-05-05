import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CampaignDetailView } from "@/components/campaigns/campaign-detail-view";
import { createClient } from "@/utils/supabase/server";

export type CampaignDetail = {
  id: string;
  title: string;
  content_types: string[];
  description: string;
  status: string;
  compensation_type: string;
  compensation_details: string | null;
  creators_needed: number;
  deadline: string;
  interested_count: number;
  photo_urls: string[];
  reference_doc_url: string | null;
  reference_doc_name: string | null;
  created_at: string;
};

export type InterestedCreator = {
  pitch: string | null;
  created_at: string;
  users: {
    id: string;
    name: string;
    avatar_url: string | null;
    city: string | null;
    creator_profiles: {
      profile_photo_url: string | null;
      bio: string | null;
      brand_categories: string[] | null;
      instagram_handle: string | null;
      instagram_followers: number | null;
      tiktok_handle: string | null;
      tiktok_followers: number | null;
      youtube_handle: string | null;
      youtube_followers: number | null;
    } | null;
  } | null;
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch campaign — only returns a row if business_id matches (ownership check)
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select(
      `id, title, content_types, description, status, compensation_type,
       compensation_details, creators_needed, deadline, interested_count,
       photo_urls, reference_doc_url, reference_doc_name, created_at`,
    )
    .eq("id", id)
    .eq("business_id", user.id)
    .single();

  if (campaignError || !campaign) {
    console.error("[campaigns/id] not found or not owned:", campaignError?.message);
    redirect("/dashboard");
  }

  // Fetch interested creators (swipes with direction='right') with creator details
  const { data: swipesData, error: swipesError } = await supabase
    .from("swipes")
    .select(
      `pitch, created_at,
       users!swipes_creator_id_fkey(
         id, name, avatar_url, city,
         creator_profiles(
           profile_photo_url, bio, brand_categories,
           instagram_handle, instagram_followers,
           tiktok_handle, tiktok_followers,
           youtube_handle, youtube_followers
         )
       )`,
    )
    .eq("campaign_id", id)
    .eq("direction", "right")
    .order("created_at", { ascending: false });

  if (swipesError) {
    console.error("[campaigns/id] swipes query error:", swipesError.code, swipesError.message);
  }

  const interestedCreators = (swipesData ?? []) as unknown as InterestedCreator[];

  return (
    <main className="min-h-screen bg-paper">
      <CampaignDetailView
        campaign={campaign as CampaignDetail}
        interestedCreators={interestedCreators}
        userId={user.id}
      />
    </main>
  );
}
