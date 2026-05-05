import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: campaigns, error: campaignsError }] = await Promise.all([
    supabase.from("business_profiles").select("brand_name, logo_url").eq("user_id", user.id).single(),
    supabase
      .from("campaigns")
      .select("id, title, status, deadline, interested_count, content_types, description, photo_urls, created_at")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) redirect("/onboarding/business");
  if (campaignsError) {
    console.error("[dashboard] campaigns query error:", campaignsError.code, campaignsError.message);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const now = Date.now();

  const active = (campaigns ?? []).filter((c) => c.status === "live");
  const past = (campaigns ?? []).filter((c) => c.status !== "live");

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {profile.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt="Brand logo" className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white">
                S
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-ink">{profile.brand_name}</p>
              <p className="text-xs text-ink/40">Business Dashboard</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6">
        {/* Section header */}
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-ink">Active Campaigns</h1>
          <Link
            href="/campaigns/new"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-moss text-lg font-bold text-white shadow-sm transition hover:bg-moss/90 active:scale-95"
            aria-label="New campaign"
          >
            +
          </Link>
        </div>

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

        {/* Active campaign cards */}
        {active.length > 0 ? (
          <div className="space-y-4">
            {active.map((c) => {
              const left = Math.max(0, Math.ceil((new Date(c.deadline).getTime() - now) / msPerDay));
              const heroUrl = (c.photo_urls as string[] | null)?.[0] ?? null;
              const initial = (c.title ?? "C")[0].toUpperCase();

              return (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.id}`}
                  className="block overflow-hidden rounded-[20px] bg-white shadow-[0_3px_12px_rgba(22,20,18,0.07)] transition hover:shadow-[0_6px_20px_rgba(22,20,18,0.12)]"
                >
                  {/* Hero */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-moss/15 to-blush">
                    {heroUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={heroUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-6xl font-bold text-ink/10">{initial}</span>
                      </div>
                    )}
                    {/* Gradient overlay (only with image) */}
                    {heroUrl ? (
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                    ) : null}
                    {/* Days left badge */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="6" cy="6" r="5" />
                        <path d="M6 3v3l2 1.5" />
                      </svg>
                      {left === 0 ? "Expired" : `${left}d left`}
                    </div>
                  </div>

                  {/* Campaign info */}
                  <div className="px-4 pb-0 pt-3.5">
                    <h3 className="truncate font-bold text-ink">{c.title ?? "Untitled Campaign"}</h3>
                    {(c.content_types as string[] | null)?.length ? (
                      <p className="mt-0.5 text-xs font-semibold text-moss">
                        {(c.content_types as string[]).join(" · ")}
                      </p>
                    ) : null}
                    {c.description ? (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-ink/50">
                        {c.description}
                      </p>
                    ) : null}
                  </div>

                  {/* Interested creators row */}
                  <div className="mt-3 border-t border-black/[0.06]" />
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-semibold text-ink">Interested Creators</span>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${(c.interested_count ?? 0) > 0 ? "bg-coral" : "bg-black/20"}`}>
                        {c.interested_count ?? 0}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink/30">
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : campaigns?.length ? (
          <p className="rounded-2xl border border-dashed border-black/15 bg-white px-5 py-6 text-center text-sm text-ink/40">
            No active campaigns · <Link href="/campaigns/new" className="font-semibold text-moss hover:underline">Create one</Link>
          </p>
        ) : null}

        {/* Past campaigns */}
        {past.length > 0 ? (
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-base font-semibold text-ink/60">Past</h2>
              <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs font-semibold text-ink/50">
                {past.length}
              </span>
            </div>
            <div className="space-y-2">
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
      </main>
    </div>
  );
}
