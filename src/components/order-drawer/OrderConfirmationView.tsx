"use client";

import { CheckCircle2, Info, RotateCcw } from "lucide-react";
import { PAYMENT_METHODS, type CartOrderItem, type PaymentMethodId } from "@/data/menu";

interface OrderConfirmationViewProps {
  demoOrderRef: string;
  tableNumber: number;
  items: CartOrderItem[];
  paymentMethod: PaymentMethodId;
  onStartNew: () => void;
  onClose: () => void;
}

export default function OrderConfirmationView({
  demoOrderRef,
  tableNumber,
  items,
  paymentMethod,
  onStartNew,
  onClose,
}: OrderConfirmationViewProps) {
  const paymentInfo = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fana-green/40 ring-1 ring-fana-gold/40">
            <CheckCircle2 className="h-7 w-7 text-fana-gold" />
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-fana-gold">
            Prototype Order Preview Ready
          </p>
          <h3 className="mt-1 font-display text-2xl text-fana-cream">
            Table {String(tableNumber).padStart(2, "0")} Summary
          </h3>
          <p className="mt-1.5 font-mono text-xs text-fana-cream/60">
            Demo Ref: {demoOrderRef}
          </p>
        </div>

        {/* Explicit Prototype / Demo Disclosure */}
        <div className="flex gap-3 rounded-2xl border border-fana-gold/30 bg-fana-gold/10 p-4 text-left">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-fana-gold" aria-hidden="true" />
          <div className="space-y-1 text-xs leading-relaxed text-fana-cream/85">
            <p className="font-semibold text-fana-gold">
              Frontend Prototype Flow (No Live Order Sent)
            </p>
            <p className="text-fana-cream/70">
              This interactive checkout previews Fana Cafe&apos;s QR table ordering flow. No kitchen ticket was dispatched and no {paymentInfo?.label ?? "payment"} charge was processed.
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-4 rounded-2xl border border-fana-cream/10 bg-fana-dark/75 p-4">
          <div className="flex items-center justify-between border-b border-fana-cream/10 pb-3 text-xs">
            <span className="text-fana-cream/55">Location</span>
            <span className="font-medium text-fana-cream">
              Fana Cafe · 22 Mazoria, Addis Ababa
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-fana-cream/10 pb-3 text-xs">
            <span className="text-fana-cream/55">Payment Selection</span>
            <span className="font-semibold text-fana-gold">
              {paymentInfo?.label} (Simulated)
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fana-cream/60">
              Selected Items ({items.reduce((s, i) => s + i.qty, 0)})
            </p>
            <ul className="space-y-2">
              {items.map((line) => {
                const mods = [
                  line.modifiers.size,
                  line.modifiers.sweetness,
                  line.modifiers.milk,
                  line.modifiers.spice,
                ].filter(Boolean);
                return (
                  <li key={line.lineId} className="text-xs">
                    <div className="flex justify-between text-fana-cream">
                      <span>
                        <span className="font-mono text-fana-gold">{line.qty}×</span>{" "}
                        {line.menuItem.name}
                      </span>
                      <span className="font-mono text-[10px] text-fana-cream/50">
                        In-cafe price
                      </span>
                    </div>
                    {(mods.length > 0 || line.modifiers.notes) && (
                      <p className="mt-0.5 pl-5 text-[11px] text-fana-cream/55">
                        {mods.join(" · ")}
                        {line.modifiers.notes ? ` — “${line.modifiers.notes}”` : ""}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-fana-cream/10 bg-fana-dark/90 px-6 py-4">
        <button
          type="button"
          onClick={onStartNew}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-fana-gold px-5 py-3 text-sm font-semibold text-fana-dark transition hover:bg-fana-gold/90"
        >
          <RotateCcw className="h-4 w-4" />
          Start Another Demo Order
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full border border-fana-cream/15 px-5 py-2.5 text-xs font-medium text-fana-cream/75 transition hover:border-fana-cream/35 hover:text-fana-cream"
        >
          Return to Fana Cafe Experience
        </button>
      </div>
    </div>
  );
}
