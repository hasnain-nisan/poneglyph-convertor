import { Upload, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { ACCEPTED_FILE_TYPES, FEATURE_CALLOUTS } from "../constants/app";

interface UploadDropzoneProps {
  fileName: string;
  disabled: boolean;
  onFileSelected: (file: File) => void;
}

export function UploadDropzone({ fileName, disabled, onFileSelected }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file?: File): void {
    if (!file || disabled) {
      return;
    }

    onFileSelected(file);
  }

  return (
    <section
      className={`stone-panel relative overflow-hidden p-6 transition duration-300 sm:p-8 ${
        isDragging ? "-translate-y-1 border-gold-200/60 shadow-[0_26px_70px_rgba(217,173,71,0.16)]" : ""
      } ${disabled ? "opacity-70 saturate-75" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) {
          setIsDragging(true);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) {
          setIsDragging(true);
        }
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_42%),linear-gradient(140deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
      <div className="relative z-10 flex min-h-[20rem] flex-col justify-between gap-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-coral-300/90">Treasure Intake</p>
            <h2 className="max-w-2xl font-display text-3xl leading-tight text-parchment-100 sm:text-4xl">
              Drop your ledger here and let the Poneglyph do the translation.
            </h2>
          </div>
          <div className="hidden rounded-[2rem] border border-gold-300/20 bg-slate-950/55 p-4 shadow-2xl shadow-black/20 sm:flex sm:flex-col sm:items-center sm:gap-3">
            <Upload className="h-7 w-7 text-gold-200" />
            <Sparkles className="h-5 w-5 text-coral-300" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-4">
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              Import a CSV, XLS, or XLSX file. Any other file type is rejected immediately with an error toast so the
              conversion flow stays predictable.
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-slate-300/80">
              {FEATURE_CALLOUTS.map((callout) => (
                <span key={callout} className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  {callout}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" className="primary-button" disabled={disabled} onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Choose File
              </button>
              <p className="text-sm text-slate-300">
                {fileName ? <span className="text-parchment-100">Loaded: {fileName}</span> : "No file selected yet."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gold-300/20 bg-slate-950/60 px-5 py-4 text-right shadow-xl shadow-black/15">
            <p className="text-xs uppercase tracking-[0.28em] text-gold-200/70">Drop Zone</p>
            <p className="mt-2 text-sm font-medium text-parchment-100">CSV, XLS, XLSX only</p>
          </div>
        </div>
      </div>
    </section>
  );
}
