import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { CreatorProfileView } from "@/components/creators/creator-profile-view";
import { BgStack } from "@/components/ui/bg-stack";
import { createClient } from "@/utils/supabase/server";

export type CreatorProfile = {
  id: string;
  name: string;
  city: string | null;
  avatar_url: string | null;
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
    gallery_images: { url: string }[] | null;
  } | null;
};

export default async function CreatorProfilePage({
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

  const { data: profile } = await supabase
    .from("users")
    .select(
      `id, name, city, avatar_url,
       creator_profiles (
         profile_photo_url, bio, brand_categories,
         instagram_handle, instagram_followers,
         tiktok_handle, tiktok_followers,
         youtube_handle, youtube_followers,
         gallery_images
       )`,
    )
    .eq("id", id)
    .single();

  if (!profile) notFound();

  return (
    <main className="relative min-h-screen">
      <BgStack />
      <CreatorProfileView profile={profile as unknown as CreatorProfile} />
    </main>
  );
}
