import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { createClient } from "@/utils/supabase/server";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: "bg-moss/10 text-moss",
    draft: "bg-black/[0.06] text-ink/50",
    closed: "bg-coral/10 text-coral",
    pending: "bg-yellow-100 text-yellow-700",
  };
  const labels: Record<string, string> = {
    live: "Live",
    draft: "Draft",
    closed: "Closed",
    pending: "Pending",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-black/[0.06] text-ink/50"}`}>
      {labels[status] ?? status}
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
      .select("id, title, status, deadline, interested_count, content_types, created_at")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) redirect("/onboarding/business");

  if (campaignsError) {
    console.error("[dashboard] campaigns query error:", campaignsError.code, campaignsError.message);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const now = Date.now();

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
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

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Your Campaigns</h1>
            <p className="mt-1 text-sm text-ink/50">
              {campaigns?.length
                ? `${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""} total`
                : "No campaigns yet"}
            </p>
          </div>
          <Link
            href="/campaigns/new"
            className="rounded-2xl bg-moss px-5 py-2.5 text-sm font-bold text-white transition hover:bg-moss/90 active:scale-[0.98]"
          >
            + New Campaign
          </Link>
        </div>

        {!campaigns?.length ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-white px-6 py-20 text-center">
            <span className="mb-3 text-4xl">📣</span>
            <h2 className="mb-1 font-display text-lg font-semibold text-ink">No campaigns yet</h2>
            <p className="mb-6 text-sm text-ink/50">
              Create your first campaign to start finding creators.
            </p>
            <Link
              href="/campaigns/new"
              className="rounded-2xl bg-moss px-6 py-3 text-sm font-bold text-white transition hover:bg-moss/90"
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => {
              const daysLeft = Math.max(
                0,
                Math.ceil((new Date(c.deadline).getTime() - now) / msPerDay),
              );
              const isExpired = daysLeft === 0 && c.status === "live";

              return (
                <div key={c.id} className="rounded-2xl border border-black/[0.08] bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <StatusBadge status={c.status} />
                        {c.content_types?.length ? (
                          <span className="text-xs text-ink/40">{(c.content_types as string[]).join(" · ")}</span>
                        ) : null}
                      </div>
                      <h3 className="truncate font-semibold text-ink">{c.title ?? "Untitled Campaign"}</h3>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-ink">{c.interested_count ?? 0}</p>
                      <p className="text-xs text-ink/40">interested</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-ink/40">
                    <span>Deadline:</span>
                    <span className={isExpired ? "text-coral font-medium" : ""}>
                      {isExpired
                        ? "Expired"
                        : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(c.deadline).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
