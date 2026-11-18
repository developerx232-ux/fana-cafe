"use client";

import { QrCode } from "lucide-react";
import { TABLE_NUMBERS } from "@/data/menu";
import { cn } from "@/lib/utils";

interface TableSelectorProps {
  tableNumber: number | null;
  detectedFromQr: boolean;
  onSelect: (table: number) => void;
}

export default function TableSelector({
  tableNumber,
  detectedFromQr,
  onSelect,
}: TableSelectorProps) {
  return (
    <section aria-labelledby="table-selector-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-fana-gold" aria-hidden="true" />
          <h3
            id="table-selector-heading"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/80"
          >
            Select Your Table (1–20)
          </h3>
        </div>
        {tableNumber ? (
          <span className="rounded-full bg-fana-gold/15 px-2.5 py-0.5 font-mono text-[11px] font-medium text-fana-gold">
            Table {String(tableNumber).padStart(2, "0")}
            {detectedFromQr ? " · QR" : ""}
          </span>
        ) : (
          <span className="text-[11px] text-fana-cream/45">Required</span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Table number">
        {TABLE_NUMBERS.map((num) => {
          const isSelected = tableNumber === num;
          return (
            <button
              key={num}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(num)}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg border font-mono text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold",
                isSelected
                  ? "border-fana-gold bg-fana-gold text-fana-dark shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                  : "border-fana-cream/15 bg-fana-dark/60 text-fana-cream/70 hover:border-fana-gold/60 hover:text-fana-cream"
              )}
            >
              {String(num).padStart(2, "0")}
            </button>
          );
        })}
      </div>
    </section>
  );
}
