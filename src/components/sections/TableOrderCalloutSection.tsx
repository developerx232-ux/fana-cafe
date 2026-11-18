"use client";

import { QrCode, Sparkles } from "lucide-react";
import { TABLE_NUMBERS } from "@/data/menu";
import { cn } from "@/lib/utils";
import { useOrderDrawer } from "@/components/order-drawer/OrderDrawerProvider";

export default function TableOrderCalloutSection() {
  const { tableNumber, setTableNumber, openDrawer } = useOrderDrawer();

  const handleQuickTablePick = (table: number) => {
    setTableNumber(table);
    openDrawer();
  };

  return (
    <section
      id="order"
      className="relative overflow-hidden bg-fana-dark py-24 sm:py-32"
    >
      {/* Subtle golden amber aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-fana-gold/12 blur-[120px]"
      />

      <div className="relative mx-auto max-w-5xl px-6 sm:px-10">
        <div className="rounded-[2rem] border border-fana-cream/12 bg-gradient-to-b from-[#1A1612] to-[#13100D] p-8 text-center shadow-2xl sm:p-12 md:p-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-fana-gold/30 bg-fana-gold/10 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-fana-gold">
            <Sparkles className="h-3 w-3" />
            Instant QR Table Ordering · Interactive Demo
          </span>

          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl leading-[1.1] text-fana-cream sm:text-5xl">
            Seated at 22 Mazoria? Pick Your Table to Preview Ordering.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-fana-cream/65 sm:text-base">
            Tap your table number below (Tables 01–20) to launch Fana Cafe&apos;s interactive QR ordering drawer with custom modifiers and Telebirr, CBE Birr, Card, or Cash selection preview.
          </p>

          {/* Direct Table Shortcut Grid */}
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-5 gap-2 sm:grid-cols-10">
            {TABLE_NUMBERS.map((num) => {
              const isSelected = tableNumber === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleQuickTablePick(num)}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-lg border font-mono text-xs font-semibold transition-all",
                    isSelected
                      ? "border-fana-gold bg-fana-gold text-fana-dark"
                      : "border-fana-cream/15 bg-fana-dark/60 text-fana-cream/75 hover:border-fana-gold hover:text-fana-gold"
                  )}
                  aria-label={`Open order drawer for Table ${num}`}
                >
                  {String(num).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={openDrawer}
              className="inline-flex items-center gap-2.5 rounded-full bg-fana-gold px-7 py-3.5 text-sm font-semibold text-fana-dark shadow-[0_0_28px_rgba(245,158,11,0.3)] transition hover:bg-fana-gold/90"
            >
              <QrCode className="h-4 w-4" />
              Open QR Table Drawer
            </button>
          </div>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-fana-cream/40">
            Frontend Prototype · Live POS & Payment Integration Scheduled for Phase 3+
          </p>
        </div>
      </div>
    </section>
  );
}
