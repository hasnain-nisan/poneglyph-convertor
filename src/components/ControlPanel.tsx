import { Database, Download, FileJson, ScrollText } from "lucide-react";
import { DEFAULT_TABLE_NAME, FORMAT_OPTIONS } from "../constants/app";
import type { OutputFormat } from "../types/converter";
import { FormatDropdown } from "./FormatDropdown";

interface ControlPanelProps {
  selectedFormat: OutputFormat;
  tableName: string;
  disabled: boolean;
  onFormatChange: (value: OutputFormat) => void;
  onTableNameChange: (value: string) => void;
  onDownload: () => void;
}

export function ControlPanel({
  selectedFormat,
  tableName,
  disabled,
  onFormatChange,
  onTableNameChange,
  onDownload,
}: ControlPanelProps) {
  return (
    <aside className="stone-panel flex flex-col gap-5 p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-200/70">Navigation</p>
        <h2 className="mt-3 font-display text-3xl text-parchment-100">Set your conversion route</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Choose the output, name your SQL table, and download the converted artifact once the scan is complete.
        </p>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Output Format</span>
        <FormatDropdown value={selectedFormat} options={FORMAT_OPTIONS} disabled={disabled} onChange={onFormatChange} />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">SQL Table Name</span>
        <input
          className="control-input"
          type="text"
          value={tableName}
          disabled={disabled}
          placeholder={DEFAULT_TABLE_NAME}
          onChange={(event) => onTableNameChange(event.target.value)}
        />
      </div>

      <button type="button" className="primary-button" disabled={disabled} onClick={onDownload}>
        <Download className="h-4 w-4" />
        Download Converted File
      </button>

      <div className="surface-card p-4 text-sm leading-7 text-slate-200">
        <div className="mb-3 flex items-center gap-3 text-gold-200">
          {selectedFormat === "json" ? <FileJson className="h-4 w-4" /> : <Database className="h-4 w-4" />}
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-200/80">Route Notes</span>
        </div>
        <p>
          {selectedFormat === "json"
            ? "JSON keeps the normalized column names, cleaned values, and row ordering ready for modern apps and APIs."
            : "SQL export creates a portable table with sanitized identifiers and INSERT statements ready for database import."}
        </p>
      </div>

      <div className="rounded-3xl border border-coral-300/20 bg-coral-400/10 p-4 text-sm leading-7 text-parchment-100/90">
        <div className="mb-3 flex items-center gap-3 text-coral-200">
          <ScrollText className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.28em]">Artifact Handling</span>
        </div>
        Header spacing is normalized, Excel-style leading apostrophes are cleaned from numeric text, and chunked CSV
        processing keeps big voyages stable.
      </div>
    </aside>
  );
}


