import type { FileSummary } from "../types/converter";

interface PreviewPanelProps {
  summary: FileSummary;
  statusMessage: string;
}

export function PreviewPanel({ summary, statusMessage }: PreviewPanelProps) {
  return (
    <section className="stone-panel overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-coral-300/90">Poneglyph Reading</p>
          <h2 className="mt-3 font-display text-3xl text-parchment-100">First rows from your file</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-300">{statusMessage}</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/35">
        {!summary.previewRows.length ? (
          <div className="flex min-h-64 items-center justify-center px-6 py-10 text-center text-sm text-slate-400">
            No preview yet.
          </div>
        ) : (
          <div className="max-h-[32rem] overflow-auto">
            <table className="preview-table min-w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
                <tr>
                  {summary.columns.map((column) => (
                    <th
                      key={column}
                      className="px-5 py-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-gold-200/80"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.previewRows.map((row, rowIndex) => (
                  <tr key={`${rowIndex}-${summary.columns[0] ?? "row"}`} className="hover:bg-white/[0.03]">
                    {summary.columns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className="border-t border-white/5 px-5 py-4 text-sm text-slate-200">
                        {row[column] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

