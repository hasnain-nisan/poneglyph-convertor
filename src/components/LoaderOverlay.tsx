import type { BusyState } from "../types/converter";

interface LoaderOverlayProps {
  busyState: BusyState;
}

export function LoaderOverlay({ busyState }: LoaderOverlayProps) {
  if (!busyState.isBusy) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-4 backdrop-blur-md">
      <div className="loader-panel w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4 p-6 sm:p-7">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-gold-300/20 bg-gold-300/10 text-gold-100 shadow-inner shadow-gold-200/10">
            <div className="loader-spinner h-6 w-6 rounded-full border-2 border-gold-100/20 border-t-gold-200" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-parchment-100">{busyState.title}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{busyState.detail}</p>
          </div>
        </div>
        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,rgba(251,191,36,1),rgba(248,113,113,1),rgba(56,189,248,1))] transition-[width] duration-150 ease-out"
              style={{ width: `${busyState.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

