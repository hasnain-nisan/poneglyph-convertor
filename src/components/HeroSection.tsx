import { Compass, Database, FileJson, FileSpreadsheet, Sparkles } from "lucide-react";
import { APP_NAME, FEATURE_CALLOUTS, HERO_FACTS } from "../constants/app";
import { PoneglyphMark } from "./PoneglyphMark";

export function HeroSection() {
  return (
    <header className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
      <section className="stone-panel relative overflow-hidden p-7 sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,207,116,0.2),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent)]" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-gold-300/30 bg-white/5 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-gold-200/85">
            <Compass className="h-4 w-4" />
            Grand Line Data Forge
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl space-y-4">
              <h1 className="font-display text-4xl leading-none tracking-tight text-parchment-100 sm:text-5xl lg:text-6xl">
                {APP_NAME}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Decode spreadsheet cargo into pristine JSON or portable SQL with a converter styled like an
                ancient artifact from the Grand Line. Chunked CSV scanning keeps massive files responsive while
                preserving the mystery, clarity, and confidence of a polished developer tool.
              </p>
            </div>
            <PoneglyphMark />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="surface-card p-4">
              <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-gold-200">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Formats</p>
              <p className="mt-2 text-sm font-semibold text-parchment-100">{HERO_FACTS[0].value}</p>
            </div>
            <div className="surface-card p-4">
              <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-coral-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Experience</p>
              <p className="mt-2 text-sm font-semibold text-parchment-100">Ancient-code interface</p>
            </div>
            <div className="surface-card p-4">
              <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-sky-300">
                <Database className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Outputs</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-parchment-100">
                <FileJson className="h-4 w-4 text-gold-200" />
                {HERO_FACTS[1].value}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-slate-300/80">
            {FEATURE_CALLOUTS.map((callout) => (
              <span key={callout} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {callout}
              </span>
            ))}
          </div>
        </div>
      </section>

      <aside className="stone-panel p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-200/70">Crew Notes</p>
        <h2 className="mt-3 font-display text-3xl text-parchment-100">Built for practical treasure hauling</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Drop in a file, preview the first rows, choose the route, and export a format that can actually be used in
          modern tooling and databases without cleanup drama.
        </p>
        <div className="mt-6 space-y-3">
          {[
            "Header spacing is normalized automatically.",
            "Excel-style leading apostrophes are cleaned from numeric text.",
            "Large CSV files are read and exported in chunks for stability.",
          ].map((note) => (
            <div key={note} className="surface-card flex items-start gap-3 px-4 py-3 text-sm text-slate-200">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-200 shadow-[0_0_12px_rgba(244,207,116,0.65)]" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </aside>
    </header>
  );
}

