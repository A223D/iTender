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
    <div className="flex h-screen bg-white">

      <BusinessSidebar activePath="/dashboard" totalUnread={totalUnread} profile={profile} />

      <div className="flex min-h-0 flex-1 flex-col">

        <MobileHeader
          brandName={profile.brand_name}
          logoUrl={profile.logo_url}
          brandInitial={brandInitial}
          totalUnread={totalUnread}
          activePath="/dashboard"
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F6FF]">

          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.07] bg-[#F7F6FF]/95 px-6 py-4 backdrop-blur">
            <h1 className="font-display text-xl font-bold text-[#07070E]">Campaigns</h1>
            <Link
              href="/campaigns/new"
              className="scout-glow-pulse rounded-full bg-gradient-to-r from-coral to-violet px-4 py-2 text-sm font-bold text-white shadow-glow transition hover:opacity-90 active:scale-95"
            >
              + New Campaign
            </Link>
          </div>

          <div className="mx-auto max-w-5xl px-6 pb-16 pt-6">

            {/* Stats strip */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-coral/15 bg-gradient-to-br from-coral/[0.08] to-coral/[0.03] px-5 py-4">
                <p className="text-3xl font-bold text-coral">{active.length}</p>
                <p className="mt-0.5 text-xs font-semibold text-black/45">Active Campaigns</p>
              </div>
              <div className="rounded-2xl border border-violet/15 bg-gradient-to-br from-violet/[0.08] to-violet/[0.03] px-5 py-4">
                <p className="text-3xl font-bold text-violet">{totalInterested}</p>
                <p className="mt-0.5 text-xs font-semibold text-black/45">Interested Creators</p>
              </div>
              <div className="rounded-2xl border border-black/[0.07] bg-white px-5 py-4 shadow-sm">
                <p className="text-3xl font-bold text-[#07070E]">{campaigns?.length ?? 0}</p>
                <p className="mt-0.5 text-xs font-semibold text-black/45">Total Campaigns</p>
              </div>
            </div>

            {/* Filter tabs */}
            {(campaigns?.length ?? 0) > 0 ? (
              <div className="mb-6 flex items-center gap-1 rounded-full bg-black/[0.06] p-1 w-fit">
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
                          ? "bg-gradient-to-r from-coral to-violet text-white shadow-sm"
                          : "text-black/45 hover:text-black/70"
                      }`}
                    >
                      {tab.label}
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-black/[0.07] text-black/40"
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
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/[0.12] bg-white px-6 py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-2xl shadow-glow">
                  📣
                </div>
                <h2 className="mb-1 font-display text-lg font-semibold text-[#07070E]">No campaigns yet</h2>
                <p className="mb-6 text-sm text-black/50">Create your first campaign to start finding creators.</p>
                <Link
                  href="/campaigns/new"
                  className="rounded-full bg-gradient-to-r from-coral to-violet px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:opacity-90 active:scale-95"
                >
                  Create Campaign
                </Link>
              </div>
            ) : null}

            {/* Active campaigns */}
            {showActive && active.length > 0 ? (
              <div className="mb-10">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="font-display text-base font-semibold text-[#07070E]">Active</h2>
                  <span className="rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-semibold text-coral">
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
              <div className="mb-10 rounded-2xl border border-dashed border-black/15 bg-white px-5 py-6 text-center text-sm text-black/40">
                No active campaigns ·{" "}
                <Link href="/campaigns/new" className="font-semibold text-coral hover:underline">
                  Create one
                </Link>
              </div>
            ) : null}

            {/* Past campaigns */}
            {showPast && past.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="font-display text-base font-semibold text-black/50">Past</h2>
                  <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs font-semibold text-black/40">
                    {past.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {past.map((c) => (
                    <Link
                      key={c.id}
                      href={`/campaigns/${c.id}`}
                      className="flex items-center justify-between rounded-[14px] border border-black/[0.06] bg-white px-4 py-3.5 transition hover:border-coral/20 hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#07070E]">{c.title ?? "Untitled Campaign"}</p>
                        {c.description ? (
                          <p className="mt-0.5 truncate text-xs text-black/45">{c.description}</p>
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
