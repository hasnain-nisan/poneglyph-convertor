import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useClickOutside } from "../hooks/useClickOutside";
import type { FormatOption, OutputFormat } from "../types/converter";

interface FormatDropdownProps {
  value: OutputFormat;
  options: FormatOption[];
  disabled?: boolean;
  onChange: (value: OutputFormat) => void;
}

export function FormatDropdown({ value, options, disabled = false, onChange }: FormatDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    setOpen(false);
  }, [value]);

  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={containerRef} className={`custom-dropdown ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="space-y-1 text-left">
          <span className="block text-[0.95rem] font-bold text-parchment-100">{selectedOption.label}</span>
          <span className="block text-xs font-medium text-slate-400">{selectedOption.caption}</span>
        </span>
        <span className="dropdown-trigger__icon" aria-hidden="true">
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>

      {open ? (
        <div className="dropdown-menu" role="listbox" aria-label="Output format">
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={`dropdown-item ${isActive ? "is-active" : ""}`}
                role="option"
                aria-selected={isActive}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs font-medium text-slate-400">{option.caption}</span>
                </span>
                {isActive ? <Check className="h-4 w-4 text-gold-200" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}




