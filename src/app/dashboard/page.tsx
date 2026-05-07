import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CampaignCard } from "@/components/dashboard/campaign-card";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { BusinessSidebar } from "@/components/layout/business-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/utils/supabase/server";
import { logoInitial } from "@/lib/formatters";

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

  const [
    { data: profile },
    { data: campaigns, error: campaignsError },
    { data: unreadData },
  ] = await Promise.all([
    supabase.from("business_profiles").select("brand_name, logo_url, website_url").eq("user_id", user.id).single(),
    supabase
      .from("campaigns")
      .select("id, title, status, deadline, interested_count, content_types, description, photo_urls, created_at, compensation_type, creators_needed")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.rpc("get_unread_counts", { p_user_id: user.id }),
  ]);

  const totalUnread = ((unreadData ?? []) as { unread_count: number }[])
    .reduce((sum, r) => sum + Number(r.unread_count), 0);

  if (!profile) redirect("/onboarding/business");
  if (campaignsError) {
    console.error("[dashboard] campaigns query error:", campaignsError.code, campaignsError.message);
  }

  const active = (campaigns ?? []).filter((c) => c.status === "live");
  const past = (campaigns ?? []).filter((c) => c.status !== "live");
  const totalInterested = (campaigns ?? []).reduce((sum, c) => sum + (c.interested_count ?? 0), 0);
  const showActive = statusFilter === "all" || statusFilter === "active";
  const showPast = statusFilter === "all" || statusFilter === "past";

  const brandInitial = logoInitial(profile.brand_name);

  return (
    <div className="flex h-screen bg-paper">

      {/* ── Sidebar (desktop only) ──────────────────────────────────── */}
      <BusinessSidebar activePath="/dashboard" totalUnread={totalUnread} profile={profile} />

      {/* ── Right column (mobile header + scrollable main) ──────────── */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Mobile top bar */}
        <MobileHeader
          brandName={profile.brand_name}
          logoUrl={profile.logo_url}
          brandInitial={brandInitial}
          totalUnread={totalUnread}
          activePath="/dashboard"
        />

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
      <NotificationListener
        userId={user.id}
        campaignIds={active.map((c) => c.id)}
      />
    </div>
  );
}
