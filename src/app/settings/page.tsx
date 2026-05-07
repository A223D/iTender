import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteAccountForm } from "@/components/settings/delete-account-form";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { BusinessSidebar } from "@/components/layout/business-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { createClient } from "@/utils/supabase/server";
import { logoInitial } from "@/lib/formatters";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: userRow }, { data: unreadData }] = await Promise.all([
    supabase.from("business_profiles").select("brand_name, logo_url, website_url, industry").eq("user_id", user.id).single(),
    supabase.from("users").select("name, city, created_at").eq("id", user.id).single(),
    supabase.rpc("get_unread_counts", { p_user_id: user.id }),
  ]);

  if (!profile) redirect("/onboarding/business");

  const totalUnread = ((unreadData ?? []) as { unread_count: number }[])
    .reduce((sum, r) => sum + Number(r.unread_count), 0);

  const brandInitial = logoInitial(profile.brand_name);
  const memberSince = userRow?.created_at
    ? new Date(userRow.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex h-screen bg-white">

      {/* ── Sidebar (desktop only) ──────────────────────────────────── */}
      <BusinessSidebar activePath="/settings" totalUnread={totalUnread} profile={profile} />

      {/* ── Right column ────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Mobile top bar */}
        <MobileHeader
          brandName={profile.brand_name}
          logoUrl={profile.logo_url}
          brandInitial={brandInitial}
          totalUnread={totalUnread}
          activePath="/settings"
        />

        {/* Scrollable main */}
        <main className="flex-1 overflow-y-auto bg-[#F7F6FF]">
          <div className="sticky top-0 z-10 border-b border-black/[0.08] bg-[#F7F6FF]/95 px-6 py-4 backdrop-blur">
            <h1 className="font-display text-xl font-semibold text-ink">Settings</h1>
          </div>

          <div className="mx-auto max-w-2xl px-6 pb-20 pt-8">

            {/* Profile summary */}
            <section className="mb-10">
              <h2 className="mb-4 font-display text-base font-semibold text-ink">Brand profile</h2>
              <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b border-black/[0.06] px-5 py-5">
                  {profile.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.logo_url} alt="Logo" className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-base font-bold text-white">
                      {brandInitial}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-ink">{profile.brand_name}</p>
                    {profile.industry ? <p className="text-sm text-ink/45">{profile.industry}</p> : null}
                  </div>
                  <Link
                    href="/onboarding/business"
                    className="ml-auto rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-black/20 hover:text-ink"
                  >
                    Edit profile
                  </Link>
                </div>

                <div className="divide-y divide-black/[0.05]">
                  {[
                    { label: "Email", value: user.email },
                    { label: "City", value: userRow?.city ?? null },
                    { label: "Website", value: profile.website_url ?? null },
                    { label: "Member since", value: memberSince },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-xs font-semibold text-ink/40">{label}</span>
                        <span className="text-sm text-ink/70">{value}</span>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h2 className="mb-4 font-display text-base font-semibold text-ink">Danger zone</h2>
              <div className="rounded-2xl border border-coral/20 bg-coral/[0.04] px-6 py-6">
                <p className="font-semibold text-coral">Delete account</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/60">
                  Permanently delete your brand profile, all campaigns, creator matches, messages,
                  and uploaded files. Your login access will be removed. This cannot be undone.
                </p>
                <DeleteAccountForm userId={user.id} brandName={profile.brand_name} />
              </div>
            </section>

          </div>
        </main>
      </div>

      <NotificationListener userId={user.id} campaignIds={[]} />
    </div>
  );
}
