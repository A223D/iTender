import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteAccountForm } from "@/components/settings/delete-account-form";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { BusinessSidebar } from "@/components/layout/business-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BgStack } from "@/components/ui/bg-stack";
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
    <div className="relative flex h-screen">
      <BgStack />

      {/* ── Sidebar (desktop only) ───────────────────────────────────────── */}
      <BusinessSidebar activePath="/settings" totalUnread={totalUnread} profile={profile} />

      {/* â”€â”€ Right column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center border-b border-white/[0.08] glass px-6 py-4 rounded-none border-t-0 border-l-0 border-r-0">
            <h1 className="font-display text-xl font-semibold text-[var(--color-text)]">Settings</h1>
          </div>

          <div className="mx-auto max-w-2xl px-6 pb-20 pt-8">

            {/* Profile summary */}
            <section className="mb-10">
              <h2 className="mb-4 font-display text-base font-semibold text-[var(--color-text)]">Brand profile</h2>
              <div className="glass overflow-hidden rounded-2xl">
                <div className="flex items-center gap-4 border-b border-white/[0.08] px-5 py-5">
                  {profile.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.logo_url} alt="Logo" className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass text-base font-bold text-[var(--color-text)]">
                      {brandInitial}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[var(--color-text)]">{profile.brand_name}</p>
                    {profile.industry ? <p className="text-sm text-[var(--color-text-muted)]">{profile.industry}</p> : null}
                  </div>
                  <Link
                    href="/onboarding/business"
                    className="ml-auto rounded-xl border border-white/[0.12] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-white/[0.24] hover:text-[var(--color-text)]"
                  >
                    Edit profile
                  </Link>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {[
                    { label: "Email", value: user.email },
                    { label: "City", value: userRow?.city ?? null },
                    { label: "Website", value: profile.website_url ?? null },
                    { label: "Member since", value: memberSince },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</span>
                        <span className="text-sm text-[var(--color-text-muted)]">{value}</span>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h2 className="mb-4 font-display text-base font-semibold text-[var(--color-text)]">Danger zone</h2>
              <div className="glass rounded-2xl px-6 py-6">
                <p className="font-semibold text-[var(--color-text-muted)]">Delete account</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
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

