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

export default function SettingsLoading() {
  return (
    <div className="flex h-screen">
      <BgStack />
      <SidebarSkeleton />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex h-14 animate-pulse items-center border-b border-white/[0.08] glass px-4 rounded-none border-t-0 border-l-0 border-r-0">
          <div className="h-6 w-24 rounded-xl bg-black/[0.08] dark:bg-white/[0.08]" />
        </div>

        <main className="flex-1 overflow-y-auto">
          {/* Sticky header */}
          <div className="animate-pulse border-b border-white/[0.08] glass px-6 py-4 rounded-none border-t-0 border-l-0 border-r-0">
            <div className="h-6 w-20 rounded-lg bg-black/[0.08] dark:bg-white/[0.08]" />
          </div>

          <div className="mx-auto max-w-2xl animate-pulse px-6 pt-8">
            {/* Brand profile section */}
            <div className="mb-4 h-5 w-28 rounded-lg bg-black/[0.08] dark:bg-white/[0.08]" />
            <div className="glass mb-10 overflow-hidden rounded-2xl">
              {/* Logo row */}
              <div className="flex items-center gap-4 border-b border-white/[0.08] px-5 py-5">
                <div className="h-14 w-14 rounded-2xl bg-black/[0.08] dark:bg-white/[0.08]" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-lg bg-black/[0.08] dark:bg-white/[0.08]" />
                  <div className="h-3 w-20 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
                </div>
              </div>
              {/* Detail rows */}
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
                  <div className="h-3 w-14 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
                  <div className="h-3 w-32 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div className="mb-4 h-5 w-24 rounded-lg bg-black/[0.08] dark:bg-white/[0.08]" />
            <div className="glass h-28 rounded-2xl" />
          </div>
        </main>
      </div>
    </div>
  );
}
