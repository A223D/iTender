import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { createClient } from "@/utils/supabase/server";

const GearIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

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

  const logoInitial = profile.brand_name[0]?.toUpperCase() ?? "B";
  const memberSince = userRow?.created_at
    ? new Date(userRow.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex h-screen bg-paper">

      {/* ── Sidebar (desktop only) ──────────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-black/[0.07] bg-white lg:flex">
        <div className="px-6 pb-5 pt-6">
          <span className="font-display text-base font-bold tracking-tight text-ink">iTender</span>
        </div>

        <div className="mx-4 rounded-2xl bg-black/[0.03] px-4 py-4">
          {profile.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logo_url} alt="Brand logo" className="h-12 w-12 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white">
              {logoInitial}
            </div>
          )}
          <p className="mt-3 text-sm font-bold leading-tight text-ink">{profile.brand_name}</p>
          <p className="text-xs text-ink/40">Business Account</p>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/50 transition hover:bg-black/[0.04] hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Campaigns
          </Link>
          <Link
            href="/matches"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/50 transition hover:bg-black/[0.04] hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Messages
            {totalUnread > 0 ? (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            ) : null}
          </Link>
          <Link
            href="/onboarding/business"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/50 transition hover:bg-black/[0.04] hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Profile
          </Link>
          {/* Settings — active */}
          <div className="flex items-center gap-2.5 rounded-xl bg-moss/[0.08] px-3 py-2.5 text-sm font-semibold text-moss">
            <GearIcon size={16} />
            Settings
          </div>
        </nav>

        <div className="px-5 pb-6">
          <SignOutButton />
        </div>
      </aside>

      {/* ── Right column ────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-black/[0.08] bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            {profile.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt="Brand logo" className="h-8 w-8 rounded-xl object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-violet text-xs font-bold text-white">
                {logoInitial}
              </div>
            )}
            <p className="text-sm font-bold text-ink">{profile.brand_name}</p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/matches"
              className="relative flex h-8 w-8 items-center justify-center rounded-xl text-ink/50 transition hover:bg-black/[0.05] hover:text-ink"
              aria-label="Messages"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {totalUnread > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-white">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              ) : null}
            </Link>
            <SignOutButton />
          </div>
        </header>

        {/* Scrollable main */}
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-black/[0.08] bg-paper/95 px-6 py-4 backdrop-blur">
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
                      {logoInitial}
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
