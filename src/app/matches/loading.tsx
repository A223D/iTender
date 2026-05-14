export default function MatchesLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#F7F6FF] p-8">
      <div className="animate-pulse space-y-3 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-black/[0.08]" />
        <div className="mx-auto h-4 w-32 rounded-lg bg-black/[0.08]" />
        <div className="mx-auto h-3 w-48 rounded-lg bg-black/[0.06]" />
      </div>
    </div>
  );
}
