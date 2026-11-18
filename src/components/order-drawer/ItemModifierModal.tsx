"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Plus } from "lucide-react";
import { type MenuItem, type SelectedModifiers } from "@/data/menu";
import { cn } from "@/lib/utils";

interface ItemModifierModalProps {
  item: MenuItem;
  onCancel: () => void;
  onConfirm: (item: MenuItem, modifiers: SelectedModifiers) => void;
}

const SIZE_OPTIONS: NonNullable<SelectedModifiers["size"]>[] = ["Small", "Regular", "Large"];
const SWEETNESS_OPTIONS: NonNullable<SelectedModifiers["sweetness"]>[] = [
  "No Sugar",
  "Light",
  "Regular",
  "Extra",
];
const MILK_OPTIONS: NonNullable<SelectedModifiers["milk"]>[] = [
  "Regular",
  "Oat",
  "Almond",
  "Black / None",
];
const SPICE_OPTIONS: NonNullable<SelectedModifiers["spice"]>[] = ["Mild", "Medium", "Spicy"];

const CUSTOMIZE_CATEGORY_LABELS: Record<string, string> = {
  coffee: "Customize Coffee",
  smoothies: "Customize Smoothie",
  heritage: "Customize Feast",
  platters: "Customize Platter",
  wraps: "Customize Wrap & Bite",
  patisserie: "Customize Patisserie",
};

export default function ItemModifierModal({
  item,
  onCancel,
  onConfirm,
}: ItemModifierModalProps) {
  const [size, setSize] = useState<SelectedModifiers["size"]>(
    item.availableModifiers.includes("size") ? "Regular" : undefined
  );
  const [sweetness, setSweetness] = useState<SelectedModifiers["sweetness"]>(
    item.availableModifiers.includes("sweetness") ? "Regular" : undefined
  );
  const [milk, setMilk] = useState<SelectedModifiers["milk"]>(
    item.availableModifiers.includes("milk") ? "Regular" : undefined
  );
  const [spice, setSpice] = useState<SelectedModifiers["spice"]>(
    item.availableModifiers.includes("spice") ? "Medium" : undefined
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(item, { size, sweetness, milk, spice, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-fana-cream/10 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-fana-cream/15 text-fana-cream/80 transition hover:border-fana-gold hover:text-fana-gold"
          aria-label="Back to table order"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fana-gold">
            {CUSTOMIZE_CATEGORY_LABELS[item.category] || "Customize Item"}
          </p>
          <h3 className="font-display text-lg text-fana-cream">{item.name}</h3>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {/* Dish Preview */}
        <div className="flex items-center gap-4 rounded-2xl border border-fana-cream/10 bg-fana-dark/70 p-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-fana-wood/20 to-fana-dark">
            <Image
              src={item.imagePath}
              alt={item.name}
              width={item.imageWidth}
              height={item.imageHeight}
              sizes="80px"
              className={cn(
                "h-full w-full",
                item.isTransparentCutout ? "object-contain p-1.5" : "object-cover"
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-fana-cream">{item.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-fana-cream/60">
              {item.subtitle}
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-fana-gold/90">
              In-cafe menu pricing
            </p>
          </div>
        </div>

        {/* Size Modifier */}
        {item.availableModifiers.includes("size") && (
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/75">
              Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSize(opt)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-medium transition",
                    size === opt
                      ? "border-fana-gold bg-fana-gold/15 text-fana-gold"
                      : "border-fana-cream/12 bg-fana-dark/50 text-fana-cream/70 hover:border-fana-cream/30"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sweetness Modifier */}
        {item.availableModifiers.includes("sweetness") && (
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/75">
              Sweetness
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SWEETNESS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSweetness(opt)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-medium transition",
                    sweetness === opt
                      ? "border-fana-gold bg-fana-gold/15 text-fana-gold"
                      : "border-fana-cream/12 bg-fana-dark/50 text-fana-cream/70 hover:border-fana-cream/30"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Milk Modifier */}
        {item.availableModifiers.includes("milk") && (
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/75">
              Milk Preference
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MILK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setMilk(opt)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-medium transition",
                    milk === opt
                      ? "border-fana-gold bg-fana-gold/15 text-fana-gold"
                      : "border-fana-cream/12 bg-fana-dark/50 text-fana-cream/70 hover:border-fana-cream/30"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Spice Modifier */}
        {item.availableModifiers.includes("spice") && (
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/75">
              Spice Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPICE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSpice(opt)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-medium transition",
                    spice === opt
                      ? "border-fana-gold bg-fana-gold/15 text-fana-gold"
                      : "border-fana-cream/12 bg-fana-dark/50 text-fana-cream/70 hover:border-fana-cream/30"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Special Table / Dietary Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="modifier-notes"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/75"
            >
              Kitchen / Barista Notes
            </label>
            <span className="font-mono text-[10px] text-fana-cream/45">
              {notes.length}/80
            </span>
          </div>
          <textarea
            id="modifier-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 80))}
            rows={2}
            placeholder="e.g., Extra hot, sauce on the side, no ice..."
            className="w-full resize-none rounded-xl border border-fana-cream/15 bg-fana-dark/70 px-3.5 py-2.5 text-sm text-fana-cream placeholder:text-fana-cream/35 focus:border-fana-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-fana-cream/10 bg-fana-dark/90 px-6 py-4">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-fana-gold px-5 py-3.5 text-sm font-semibold text-fana-dark transition hover:bg-fana-gold/90"
        >
          <Plus className="h-4 w-4" />
          Add to Table Order
        </button>
      </div>
    </form>
  );
}
