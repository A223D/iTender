import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function upsertBusinessUser(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email" | "user_metadata">,
): Promise<{ hasProfile: boolean }> {
  await supabase.from("users").upsert(
    {
      id: user.id,
      role: "business",
      name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
      email: user.email ?? "",
    },
    { onConflict: "id" },
  );

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return { hasProfile: !!profile };
}

export function postAuthRedirect(hasProfile: boolean): string {
  return hasProfile ? "/dashboard" : "/onboarding/business";
}
