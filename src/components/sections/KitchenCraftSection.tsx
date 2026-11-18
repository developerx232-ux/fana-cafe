"use client";

import { ChefHat, Flame, Laptop2 } from "lucide-react";
import { scrollToTarget } from "@/lib/lenis";
import LazyAmbientVideo from "./LazyAmbientVideo";

/**
 * Dedicated secondary experience section featuring the supplementary
 * `open_kitchen_workspace.mp4` (edited from `first look vid 4.mp4`).
 * Does NOT replace `workspace_hub.mp4` and lazy-loads only as this section approaches the viewport.
 */
export default function KitchenCraftSection() {
  return (
    <section
      id="kitchen"
      className="relative overflow-hidden border-t border-fana-cream/10 bg-gradient-to-b from-[#16120E] via-[#1B1510] to-fana-dark py-20 sm:py-28"
    >
      {/* Subtle botanical & amber ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-fana-green/20 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-fana-gold/10 blur-[110px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 md:px-16">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Narrative Column */}
          <div className="space-y-6 lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-fana-gold/30 bg-fana-gold/10 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-fana-gold">
              <ChefHat className="h-3.5 w-3.5" />
              Open Kitchen & Counter Seating
            </span>

            <h2 className="font-display text-3xl leading-[1.12] text-fana-cream sm:text-4xl lg:text-5xl">
              Work Steps Away From the Live Kitchen.
            </h2>

            <p className="text-sm leading-relaxed text-fana-cream/70 sm:text-base">
              Beyond our main communal oak table, Fana&apos;s open-counter seating pairs laptop-friendly dark timber tables with an unobstructed view of our chefs plating fresh grills, wraps, and Ethiopian feasts to order.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fana-wood/25 text-fana-gold">
                  <Flame className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-fana-cream">
                    Freshly Plated in Full View
                  </p>
                  <p className="text-xs text-fana-cream/60">
                    Open-plan kitchen counter serving hot platters, burgers, wraps, and injera feasts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fana-green/35 text-fana-cream">
                  <Laptop2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-fana-cream">
                    Counterside Focus Seating
                  </p>
                  <p className="text-xs text-fana-cream/60">
                    Set up your laptop beside the lively kitchen energy without leaving your seat.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => scrollToTarget("#menu")}
                className="inline-flex items-center gap-2 rounded-full border border-fana-cream/25 bg-fana-dark/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream transition hover:border-fana-gold hover:text-fana-gold"
              >
                Explore Plates From This Kitchen
              </button>
            </div>
          </div>

          {/* Supplementary Video Column */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-fana-cream/12 bg-fana-dark/60 p-3 shadow-2xl sm:p-4">
              <LazyAmbientVideo
                src="/videos/open_kitchen_workspace.mp4"
                label="Fana Cafe open kitchen chefs preparing food beside laptop counter seating"
                aspectClassName="aspect-video"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fana-cream/50">
                <span>Live Kitchen & Laptop Counter</span>
                <span className="text-fana-gold/80">On-Site Footage · 22 Mazoria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
