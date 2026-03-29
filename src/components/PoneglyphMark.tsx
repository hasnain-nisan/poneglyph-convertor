import { ScrollText } from "lucide-react";

export function PoneglyphMark() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-gold-300/25 bg-slate-950/70 shadow-inner shadow-gold-300/10">
      <div className="absolute inset-2 rounded-[1.2rem] border border-dashed border-gold-200/20" />
      <ScrollText className="relative h-8 w-8 text-gold-200" strokeWidth={1.75} />
    </div>
  );
}

