import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ChatView } from "@/components/matches/chat-view";
import { createClient } from "@/utils/supabase/server";
import { type RawCreatorJoin, extractProfilePhoto } from "@/types/models";

export type ChatMatch = {
  id: string;
  campaign_id: string;
  creator_id: string;
  business_id: string;
  campaigns: {
    title: string | null;
    description: string | null;
    compensation_type: string | null;
    compensation_details: string | null;
  } | null;
  creator: {
    id: string;
    name: string;
    avatar_url: string | null;
    profile_photo_url: string | null;
  } | null;
};

export type ChatMessage = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default async function ChatPage({
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

  const [{ data: matchRaw }, { data: messagesRaw }] = await Promise.all([
    supabase
      .from("matches")
      .select(
        `id, campaign_id, creator_id, business_id,
         campaigns(title, description, compensation_type, compensation_details),
         creator:users!matches_creator_id_fkey(
           id, name, avatar_url,
           creator_profiles(profile_photo_url)
         )`,
      )
      .eq("id", id)
      .eq("business_id", user.id)
      .single(),
    supabase
      .from("messages")
      .select("id, match_id, sender_id, content, created_at")
      .eq("match_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!matchRaw) redirect("/matches");

  // Flatten nested creator_profiles (may be array or object depending on Supabase join)
  const rawCreator = matchRaw.creator as unknown as RawCreatorJoin | null;

  const match: ChatMatch = {
    id: matchRaw.id,
    campaign_id: matchRaw.campaign_id,
    creator_id: matchRaw.creator_id,
    business_id: matchRaw.business_id,
    campaigns: matchRaw.campaigns as unknown as ChatMatch["campaigns"],
    creator: rawCreator
      ? {
          id: rawCreator.id,
          name: rawCreator.name,
          avatar_url: rawCreator.avatar_url,
          profile_photo_url: extractProfilePhoto(rawCreator),
        }
      : null,
  };

  const initialMessages = (messagesRaw ?? []) as ChatMessage[];

  return (
    <ChatView match={match} initialMessages={initialMessages} userId={user.id} />
  );
}
