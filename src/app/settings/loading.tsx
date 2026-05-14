function SidebarSkeleton() {
  return (
    <div
      className="relative hidden w-[240px] shrink-0 lg:block"
      style={{ background: "linear-gradient(145deg, #07070E 0%, #0F0F1A 60%, #161628 100%)" }}
    >
      <div className="animate-pulse p-5">
        <div className="mb-8 h-7 w-20 rounded-xl bg-white/10" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="flex h-screen bg-white">
      <SidebarSkeleton />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex h-14 animate-pulse items-center border-b border-black/[0.08] bg-white px-4">
          <div className="h-6 w-24 rounded-xl bg-black/[0.08]" />
        </div>

        <main className="flex-1 overflow-y-auto bg-[#F7F6FF]">
          {/* Sticky header */}
          <div className="animate-pulse border-b border-black/[0.08] bg-[#F7F6FF]/95 px-6 py-4">
            <div className="h-6 w-20 rounded-lg bg-black/[0.08]" />
          </div>

          <div className="mx-auto max-w-2xl animate-pulse px-6 pt-8">
            {/* Brand profile section */}
            <div className="mb-4 h-5 w-28 rounded-lg bg-black/[0.08]" />
            <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* Logo row */}
              <div className="flex items-center gap-4 border-b border-black/[0.06] px-5 py-5">
                <div className="h-14 w-14 rounded-2xl bg-black/[0.08]" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-lg bg-black/[0.08]" />
                  <div className="h-3 w-20 rounded-lg bg-black/[0.06]" />
                </div>
              </div>
              {/* Detail rows */}
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-black/[0.05] px-5 py-3.5">
                  <div className="h-3 w-14 rounded-lg bg-black/[0.06]" />
                  <div className="h-3 w-32 rounded-lg bg-black/[0.06]" />
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div className="mb-4 h-5 w-24 rounded-lg bg-black/[0.08]" />
            <div className="h-28 rounded-2xl bg-coral/[0.06]" />
          </div>
        </main>
      </div>
    </div>
  );
}
