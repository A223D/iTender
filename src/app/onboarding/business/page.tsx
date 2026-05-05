import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BusinessOnboardingForm } from "@/components/onboarding/business-onboarding-form";
import { createClient } from "@/utils/supabase/server";

export default async function BusinessOnboardingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If they already have a profile, skip onboarding
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (profile) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-paper">
      <BusinessOnboardingForm
        userId={user.id}
        email={user.email ?? ""}
        name={user.user_metadata?.full_name ?? ""}
      />
    </main>
  );
}
