export default function MatchesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl glass text-2xl">
        💬
      </div>
      <h2 className="text-base font-semibold text-[var(--color-text)]">Select a conversation</h2>
      <p className="text-sm text-[var(--color-text-muted)]">Choose a creator from the list to start chatting.</p>
    </div>
  );
}
