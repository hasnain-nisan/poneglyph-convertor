import { FileSpreadsheet, Hash, ScrollText } from "lucide-react";
import { formatNumber } from "../lib/utils";
import type { FileSummary } from "../types/converter";

interface SummaryGridProps {
  fileName: string;
  summary: FileSummary;
}

const cards = [
  { label: "File", icon: FileSpreadsheet },
  { label: "Rows", icon: Hash },
  { label: "Columns", icon: Hash },
  { label: "Sheet", icon: ScrollText },
] as const;

export function SummaryGrid({ fileName, summary }: SummaryGridProps) {
  const values = [fileName || "No file loaded", formatNumber(summary.rowCount), formatNumber(summary.columns.length), summary.sheetName || "-"];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="summary-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="summary-label">{card.label}</p>
                <p className="summary-value truncate">{values[index]}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-gold-200">
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

