"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { type CartOrderItem } from "@/data/menu";
import { cn } from "@/lib/utils";

interface CartItemsListProps {
  items: CartOrderItem[];
  onUpdateQty: (lineId: string, delta: number) => void;
  onRemove: (lineId: string) => void;
  onBrowseMenu: () => void;
}

export default function CartItemsList({
  items,
  onUpdateQty,
  onRemove,
  onBrowseMenu,
}: CartItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-fana-cream/15 bg-fana-dark/40 px-5 py-8 text-center">
        <ShoppingBag className="mx-auto h-7 w-7 text-fana-gold/60" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-fana-cream/85">
          Your table tray is empty
        </p>
        <p className="mt-1 text-xs text-fana-cream/50">
          Pick coffee, smoothies, platters, or patisserie from the Fana visual menu to preview your table order.
        </p>
        <button
          type="button"
          onClick={onBrowseMenu}
          className="mt-4 rounded-full border border-fana-gold/50 px-4 py-2 text-xs font-semibold text-fana-gold transition hover:bg-fana-gold hover:text-fana-dark"
        >
          Browse Visual Menu
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="cart-items-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          id="cart-items-heading"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/80"
        >
          Your Table Tray
        </h3>
        <span className="font-mono text-[11px] text-fana-cream/55">
          {items.reduce((sum, i) => sum + i.qty, 0)} item(s)
        </span>
      </div>

      <ul className="space-y-2.5">
        {items.map((line) => {
          const chips = [
            line.modifiers.size,
            line.modifiers.sweetness,
            line.modifiers.milk,
            line.modifiers.spice,
          ].filter(Boolean) as string[];

          return (
            <li
              key={line.lineId}
              className="flex gap-3 rounded-2xl border border-fana-cream/10 bg-fana-dark/65 p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-fana-wood/15">
                <Image
                  src={line.menuItem.imagePath}
                  alt={line.menuItem.name}
                  width={line.menuItem.imageWidth}
                  height={line.menuItem.imageHeight}
                  sizes="56px"
                  className={cn(
                    "h-full w-full",
                    line.menuItem.isTransparentCutout
                      ? "object-contain p-1"
                      : "object-cover"
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-fana-cream">
                    {line.menuItem.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemove(line.lineId)}
                    className="text-fana-cream/40 transition hover:text-red-400"
                    aria-label={`Remove ${line.menuItem.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {chips.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-md bg-fana-cream/8 px-1.5 py-0.5 text-[10px] text-fana-cream/70"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                {line.modifiers.notes && (
                  <p className="mt-1 text-[11px] italic text-fana-gold/80">
                    “{line.modifiers.notes}”
                  </p>
                )}

                <div className="mt-2.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-fana-cream/45">
                    In-cafe menu pricing
                  </span>
                  <div className="flex items-center gap-2 rounded-full border border-fana-cream/15 bg-fana-dark px-1.5 py-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(line.lineId, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-fana-cream/75 transition hover:bg-fana-cream/10 hover:text-fana-cream"
                      aria-label={`Decrease quantity of ${line.menuItem.name}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.25rem] text-center font-mono text-xs font-semibold text-fana-cream">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(line.lineId, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-fana-cream/75 transition hover:bg-fana-cream/10 hover:text-fana-cream"
                      aria-label={`Increase quantity of ${line.menuItem.name}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
