import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CampaignCard } from "@/components/dashboard/campaign-card";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { BusinessSidebar } from "@/components/layout/business-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { BgStack } from "@/components/ui/bg-stack";
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
    <div className="relative flex h-screen">
      <BgStack />

      <BusinessSidebar activePath="/dashboard" totalUnread={totalUnread} profile={profile} />

      <div className="flex min-h-0 flex-1 flex-col">

        <MobileHeader
          brandName={profile.brand_name}
          logoUrl={profile.logo_url}
          brandInitial={brandInitial}
          totalUnread={totalUnread}
          activePath="/dashboard"
        />

        <main className="flex-1 overflow-y-auto">

          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] glass px-6 py-4 rounded-none border-t-0 border-l-0 border-r-0">
            <h1 className="text-xl font-bold text-[var(--color-text)]">Campaigns</h1>
            <Link
              href="/campaigns/new"
              className="rounded-full bg-[var(--color-text)] px-4 py-2 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-95"
            >
              + New Campaign
            </Link>
          </div>

          <div className="mx-auto max-w-7xl px-6 pb-16 pt-6">

            {/* Stats strip */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="glass rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold tabular-nums text-[var(--color-text)]">{active.length}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">Active Campaigns</p>
              </div>
              <div className="glass rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold tabular-nums text-[var(--color-text)]" style={{ color: "rgba(103,232,249,1)" }}>{totalInterested}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">Interested Creators</p>
              </div>
              <div className="glass rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold tabular-nums text-[var(--color-text)]">{totalUnread}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">Unread Messages</p>
              </div>
              <div className="glass rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold tabular-nums text-[var(--color-text)]">{campaigns?.length ?? 0}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">Total Campaigns</p>
              </div>
            </div>

            {/* Filter tabs */}
            {(campaigns?.length ?? 0) > 0 ? (
              <div className="mb-6 flex items-center gap-1 rounded-full glass p-1 w-fit">
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
                      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[var(--color-text)] text-[var(--color-on-text)]"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      {tab.label}
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                        isActive ? "bg-[var(--color-on-text)]/10 text-[var(--color-on-text)]" : "bg-white/10 text-[var(--color-text-hint)]"
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
              <div className="flex flex-col items-center justify-center glass rounded-3xl px-6 py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl glass text-2xl">
                  📣
                </div>
                <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">No campaigns yet</h2>
                <p className="mb-6 text-sm text-[var(--color-text-muted)]">Create your first campaign to start finding creators.</p>
                <Link
                  href="/campaigns/new"
                  className="rounded-full bg-[var(--color-text)] px-6 py-3 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-95"
                >
                  Create Campaign
                </Link>
              </div>
            ) : null}

            {/* Active campaigns */}
            {showActive && active.length > 0 ? (
              <div className="mb-10">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-base font-semibold text-[var(--color-text)]">Active</h2>
                  <span className="rounded-full glass px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-muted)]">
                    {active.length}
                  </span>
                </div>
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                  {active.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              </div>
            ) : showActive && campaigns?.length ? (
              <div className="mb-10 glass rounded-2xl px-5 py-6 text-center text-sm text-[var(--color-text-muted)]">
                No active campaigns ·{" "}
                <Link href="/campaigns/new" className="font-semibold text-[var(--color-text)] hover:underline">
                  Create one
                </Link>
              </div>
            ) : null}

            {/* Past campaigns */}
            {showPast && past.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-base font-semibold text-[var(--color-text-muted)]">Past</h2>
                  <span className="rounded-full glass px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-hint)]">
                    {past.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {past.map((c) => (
                    <Link
                      key={c.id}
                      href={`/campaigns/${c.id}`}
                      className="flex items-center justify-between glass rounded-[14px] px-4 py-3.5 transition hover:opacity-80"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[var(--color-text)]">{c.title ?? "Untitled Campaign"}</p>
                        {c.description ? (
                          <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">{c.description}</p>
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
