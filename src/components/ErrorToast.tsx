import { AlertTriangle, X } from "lucide-react";

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-3xl border border-coral-300/40 bg-slate-950/95 p-4 text-parchment-100 shadow-[0_22px_60px_rgba(6,17,29,0.55)] backdrop-blur-xl sm:right-6 sm:top-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-coral-300/25 bg-coral-500/12 text-coral-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral-300/85">Upload Error</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{message}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss error message"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-coral-300/35 hover:text-parchment-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
