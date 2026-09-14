export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#7A9B8E]" />

        <p className="mt-4 text-sm text-black/45">Loading…</p>
      </div>
    </div>
  );
}
