export default function AppLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/12 backdrop-blur-[2px]">
      <div className="mx-4 w-full max-w-sm rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_28px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c9d9ff] border-t-[#2f6fff]" />
            <div className="absolute h-2.5 w-2.5 rounded-full bg-[#2f6fff]/20" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">Loading next page</p>
            <p className="mt-1 text-sm text-slate-500">Please wait while we bring the next view in.</p>
          </div>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[linear-gradient(90deg,#2f6fff,#60a5fa)]" />
        </div>
      </div>
    </div>
  );
}
