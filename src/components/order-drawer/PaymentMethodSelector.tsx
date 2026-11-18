"use client";

import { Banknote, CreditCard, Smartphone, Wallet } from "lucide-react";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/data/menu";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
  selected: PaymentMethodId;
  onSelect: (method: PaymentMethodId) => void;
}

const ICONS: Record<PaymentMethodId, React.ComponentType<{ className?: string }>> = {
  telebirr: Smartphone,
  cbe_birr: Wallet,
  card: CreditCard,
  cash: Banknote,
};

export default function PaymentMethodSelector({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <section aria-labelledby="payment-method-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          id="payment-method-heading"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/80"
        >
          Preferred Payment Method
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-fana-cream/45">
          Demo Selection
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Payment method">
        {PAYMENT_METHODS.map((method) => {
          const Icon = ICONS[method.id];
          const isSelected = selected === method.id;
          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold",
                isSelected
                  ? "border-fana-gold bg-fana-gold/12 text-fana-cream shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                  : "border-fana-cream/12 bg-fana-dark/50 text-fana-cream/70 hover:border-fana-cream/30 hover:text-fana-cream"
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isSelected ? "text-fana-gold" : "text-fana-cream/55"
                    )}
                  />
                  {method.label}
                </span>
                {method.badge && (
                  <span className="rounded-full bg-fana-gold/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-fana-gold">
                    {method.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-snug text-fana-cream/50">
                {method.detail}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
