import { BgStack } from "@/components/ui/bg-stack";

function SidebarSkeleton() {
  return (
    <div className="glass relative hidden w-[240px] shrink-0 rounded-none border-t-0 border-b-0 border-l-0 border-r border-r-white/10 lg:block">
      <div className="animate-pulse p-5">
        <div className="mb-8 h-7 w-20 rounded-xl bg-black/[0.08] dark:bg-white/10" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-black/[0.06] dark:bg-white/[0.06]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="flex h-screen">
      <BgStack />
      <SidebarSkeleton />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex h-14 animate-pulse items-center border-b border-white/[0.08] glass px-4 rounded-none border-t-0 border-l-0 border-r-0">
          <div className="h-6 w-24 rounded-xl bg-black/[0.08] dark:bg-white/[0.08]" />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-8">
            {/* Header row */}
            <div className="mb-6 flex animate-pulse items-center justify-between">
              <div className="h-7 w-36 rounded-xl bg-black/[0.08] dark:bg-white/[0.08]" />
              <div className="h-9 w-32 rounded-full bg-black/[0.08] dark:bg-white/[0.08]" />
            </div>

            {/* Stat cards */}
            <div className="mb-6 grid animate-pulse grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-black/[0.07] dark:bg-white/[0.07]" />
              ))}
            </div>

            {/* Filter tabs */}
            <div className="mb-4 flex animate-pulse gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-8 w-20 rounded-full bg-black/[0.07] dark:bg-white/[0.07]" />
              ))}
            </div>

            {/* Campaign cards */}
            <div className="animate-pulse space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-black/[0.07] dark:bg-white/[0.07]" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
