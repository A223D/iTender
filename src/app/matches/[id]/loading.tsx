export default function ChatLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="animate-pulse border-b border-white/[0.08] glass px-5 py-4 rounded-none border-t-0 border-l-0 border-r-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-black/[0.08] dark:bg-white/[0.08]" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded-lg bg-black/[0.08] dark:bg-white/[0.08]" />
            <div className="h-3 w-20 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 animate-pulse space-y-4 overflow-hidden p-5">
        <div className="flex justify-start">
          <div className="h-10 w-48 rounded-2xl rounded-bl-sm bg-black/[0.07] dark:bg-white/[0.07]" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-36 rounded-2xl bg-black/[0.05] dark:bg-white/[0.06]" />
        </div>
        <div className="flex justify-start">
          <div className="h-14 w-56 rounded-2xl rounded-bl-sm bg-black/[0.07] dark:bg-white/[0.07]" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-44 rounded-2xl bg-black/[0.05] dark:bg-white/[0.06]" />
        </div>
        <div className="flex justify-start">
          <div className="h-10 w-32 rounded-2xl rounded-bl-sm bg-black/[0.07] dark:bg-white/[0.07]" />
        </div>
      </div>

      {/* Input bar */}
      <div className="animate-pulse border-t border-white/[0.08] glass p-4 rounded-none border-b-0 border-l-0 border-r-0">
        <div className="h-11 rounded-2xl bg-black/[0.07] dark:bg-white/[0.07]" />
      </div>
    </div>
  );
}
