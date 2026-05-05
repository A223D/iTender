import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CampaignCard } from "@/components/dashboard/campaign-card";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { createClient } from "@/utils/supabase/server";

const STATUS_STYLES: Record<string, string> = {
  live: "bg-moss/10 text-moss",
  draft: "bg-black/[0.06] text-ink/50",
  closed: "bg-coral/10 text-coral",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-teal/10 text-teal",
};
const STATUS_LABELS: Record<string, string> = {
  live: "Live",
  draft: "Draft",
  closed: "Closed",
  pending: "Pending",
  completed: "Completed",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-black/[0.06] text-ink/50"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const [cookieStore, resolvedParams] = await Promise.all([cookies(), searchParams]);
  const statusFilter = resolvedParams?.status ?? "all";
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: campaigns, error: campaignsError }] = await Promise.all([
    supabase.from("business_profiles").select("brand_name, logo_url, website_url").eq("user_id", user.id).single(),
    supabase
      .from("campaigns")
      .select("id, title, status, deadline, interested_count, content_types, description, photo_urls, created_at, compensation_type, creators_needed")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) redirect("/onboarding/business");
  if (campaignsError) {
    console.error("[dashboard] campaigns query error:", campaignsError.code, campaignsError.message);
  }

  const active = (campaigns ?? []).filter((c) => c.status === "live");
  const past = (campaigns ?? []).filter((c) => c.status !== "live");
  const totalInterested = (campaigns ?? []).reduce((sum, c) => sum + (c.interested_count ?? 0), 0);
  const profileIncomplete = !profile.logo_url || !profile.website_url;

  const showActive = statusFilter === "all" || statusFilter === "active";
  const showPast = statusFilter === "all" || statusFilter === "past";

  const logoInitial = profile.brand_name[0]?.toUpperCase() ?? "B";

  return (
    <div className="flex h-screen bg-paper">

      {/* ── Sidebar (desktop only) ──────────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-black/[0.07] bg-white lg:flex">
        {/* Wordmark */}
        <div className="px-6 pb-5 pt-6">
          <span className="font-display text-base font-bold tracking-tight text-ink">iTender</span>
        </div>

        {/* Brand identity card */}
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

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-moss/[0.08] px-3 py-2.5 text-sm font-semibold text-moss">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Campaigns
          </div>
          <Link
            href="/onboarding/business"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/50 transition hover:bg-black/[0.04] hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Profile
            {profileIncomplete ? (
              <span className="ml-auto h-2 w-2 rounded-full bg-amber-400" />
            ) : null}
          </Link>
        </nav>

        {/* Incomplete profile nudge */}
        {profileIncomplete ? (
          <Link
            href="/onboarding/business"
            className="mx-4 mb-4 block rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
          >
            <p className="text-xs font-semibold text-amber-700">Complete your profile</p>
            <p className="mt-0.5 text-xs text-amber-600/80">
              {!profile.logo_url && !profile.website_url
                ? "Add a logo and website so creators trust your brand."
                : !profile.logo_url
                ? "Add a logo so creators recognise your brand."
                : "Add your website so creators can learn more."}
            </p>
          </Link>
        ) : null}

        {/* Sign out */}
        <div className="px-5 pb-6">
          <SignOutButton />
        </div>
      </aside>

      {/* ── Right column (mobile header + scrollable main) ──────────── */}
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
          <SignOutButton />
        </header>

        {/* Scrollable main */}
        <main className="flex-1 overflow-y-auto">

          {/* Sticky inner header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.08] bg-paper/95 px-6 py-4 backdrop-blur">
            <h1 className="font-display text-xl font-semibold text-ink">Campaigns</h1>
            <Link
              href="/campaigns/new"
              className="rounded-full bg-moss px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-moss/90 active:scale-95"
            >
              + New Campaign
            </Link>
          </div>

          <div className="mx-auto max-w-5xl px-6 pb-16 pt-6">

            {/* Stats strip */}
            <div className="mb-8 grid grid-cols-3 gap-3">
              {[
                { label: "Active", value: active.length, color: "text-moss" },
                { label: "Interested", value: totalInterested, color: "text-coral" },
                { label: "Total Campaigns", value: campaigns?.length ?? 0, color: "text-ink" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-black/[0.07] bg-white px-5 py-4 shadow-sm">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="mt-0.5 text-xs text-ink/40">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            {(campaigns?.length ?? 0) > 0 ? (
              <div className="mb-6 flex items-center gap-1 rounded-2xl bg-black/[0.05] p-1 w-fit">
                {[
                  { label: "All", value: "all", count: campaigns?.length ?? 0 },
                  { label: "Active", value: "active", count: active.length },
                  { label: "Past", value: "past", count: past.length },
                ].map((tab) => {
                  const isActive = statusFilter === tab.value;
                  return (
                    <Link
                      key={tab.value}
                      href={tab.value === "all" ? "/dashboard" : `/dashboard?status=${tab.value}`}
                      className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                        isActive ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                      }`}
                    >
                      {tab.label}
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                        isActive ? "bg-black/[0.07] text-ink" : "bg-black/[0.06] text-ink/40"
                      }`}>
                        {tab.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}

            {/* Empty state */}
            {!campaigns?.length ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-white px-6 py-20 text-center">
                <span className="mb-3 text-4xl">📣</span>
                <h2 className="mb-1 font-display text-lg font-semibold text-ink">No campaigns yet</h2>
                <p className="mb-6 text-sm text-ink/50">Create your first campaign to start finding creators.</p>
                <Link
                  href="/campaigns/new"
                  className="rounded-2xl bg-moss px-6 py-3 text-sm font-bold text-white transition hover:bg-moss/90"
                >
                  Create Campaign
                </Link>
              </div>
            ) : null}

            {/* Active campaigns grid */}
            {showActive && active.length > 0 ? (
              <div className="mb-10">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="font-display text-base font-semibold text-ink">Active</h2>
                  <span className="rounded-full bg-moss/10 px-2.5 py-0.5 text-xs font-semibold text-moss">
                    {active.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {active.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              </div>
            ) : showActive && campaigns?.length ? (
              <div className="mb-10 rounded-2xl border border-dashed border-black/15 bg-white px-5 py-6 text-center text-sm text-ink/40">
                No active campaigns ·{" "}
                <Link href="/campaigns/new" className="font-semibold text-moss hover:underline">
                  Create one
                </Link>
              </div>
            ) : null}

            {/* Past campaigns grid */}
            {showPast && past.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="font-display text-base font-semibold text-ink/60">Past</h2>
                  <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs font-semibold text-ink/50">
                    {past.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {past.map((c) => (
                    <Link
                      key={c.id}
                      href={`/campaigns/${c.id}`}
                      className="flex items-center justify-between rounded-[14px] bg-white px-4 py-3.5 shadow-[0_2px_6px_rgba(22,20,18,0.05)] transition hover:shadow-md"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{c.title ?? "Untitled Campaign"}</p>
                        {c.description ? (
                          <p className="mt-0.5 truncate text-xs text-ink/45">{c.description}</p>
                        ) : null}
                      </div>
                      <div className="ml-3 shrink-0">
                        <StatusBadge status={c.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

          </div>
        </main>
      </div>
    </div>
  );
}
