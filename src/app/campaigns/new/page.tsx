import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CampaignBuilderForm } from "@/components/campaigns/campaign-builder-form";
import { createClient } from "@/utils/supabase/server";

export default async function NewCampaignPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding/business");

  return (
    <main className="min-h-screen bg-paper">
      <CampaignBuilderForm userId={user.id} />
    </main>
  );
}
