import { cookies } from "next/headers";

import { BusinessOnboardingForm } from "@/components/onboarding/business-onboarding-form";
import { createClient } from "@/utils/supabase/server";

export default async function BusinessOnboardingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: existingProfile }, { data: userRow }] = await Promise.all([
    supabase
      .from("business_profiles")
      .select("brand_name, logo_url, website_url, brand_values, industry")
      .eq("user_id", user.id)
      .single(),
    supabase.from("users").select("city").eq("id", user.id).single(),
  ]);

  return (
    <main className="min-h-screen bg-paper">
      <BusinessOnboardingForm
        userId={user.id}
        email={user.email ?? ""}
        name={user.user_metadata?.full_name ?? ""}
        initialProfile={
          existingProfile
            ? {
                brandName: existingProfile.brand_name ?? "",
                industry: existingProfile.industry ?? "",
                city: userRow?.city ?? "",
                websiteUrl: existingProfile.website_url ?? "",
                brandValues: existingProfile.brand_values ?? "",
                logoUrl: existingProfile.logo_url ?? null,
              }
            : undefined
        }
      />
    </main>
  );
}
