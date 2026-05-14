export default function CampaignDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F7F6FF]">
      {/* Dark hero skeleton */}
      <div
        className="animate-pulse"
        style={{ background: "linear-gradient(145deg, #07070E 0%, #0F0F1A 60%, #161628 100%)" }}
      >
        {/* Nav row */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-5 lg:px-8">
          <div className="h-5 w-28 rounded-lg bg-white/10" />
          <div className="flex gap-2">
            <div className="h-7 w-12 rounded-xl bg-white/10" />
            <div className="h-7 w-14 rounded-xl bg-white/10" />
          </div>
        </div>

        {/* Hero content */}
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 lg:px-8">
          <div className="mb-4 flex gap-2">
            <div className="h-5 w-12 rounded-full bg-white/15" />
            <div className="h-5 w-20 rounded-full bg-white/10" />
            <div className="h-5 w-16 rounded-full bg-white/10" />
          </div>
          <div className="h-9 w-2/3 rounded-xl bg-white/15" />
          <div className="mt-2.5 h-4 w-44 rounded-lg bg-white/10" />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Stat cards */}
        <div className="grid animate-pulse grid-cols-2 gap-3 py-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-black/[0.08]" />
          ))}
        </div>

        {/* Content + pipeline columns */}
        <div className="flex gap-8">
          <div className="min-w-0 flex-1 animate-pulse space-y-4">
            <div className="h-40 rounded-2xl bg-black/[0.08]" />
            <div className="h-24 rounded-2xl bg-black/[0.08]" />
          </div>
          <div className="hidden w-[420px] shrink-0 animate-pulse space-y-3 lg:block">
            <div className="h-8 w-36 rounded-xl bg-black/[0.08]" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-black/[0.08]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
