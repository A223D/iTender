export default function MatchesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-coral/20 to-violet/20 text-2xl">
        💬
      </div>
      <h2 className="font-display text-base font-semibold text-[#07070E]">Select a conversation</h2>
      <p className="text-sm text-black/45">Choose a creator from the list to start chatting.</p>
    </div>
  );
}
