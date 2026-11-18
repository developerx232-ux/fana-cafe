"use client";

import { Compass, Laptop, MapPin, Sparkles, Utensils } from "lucide-react";
import { useOrderDrawer } from "@/components/order-drawer/OrderDrawerProvider";
import LazyAmbientVideo from "./LazyAmbientVideo";

export default function SpaceVibeSection() {
  const { openDrawer } = useOrderDrawer();

  return (
    <section
      id="spaces"
      className="relative border-t border-fana-cream/10 bg-fana-dark py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-16">
        {/* Editorial Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fana-gold">
              <MapPin className="h-3.5 w-3.5" />
              Inside Fana Cafe · 22 Mazoria, Addis Ababa
            </span>
            <h2 className="font-display text-3xl leading-[1.1] text-fana-cream sm:text-5xl">
              Real Spaces Shaped by Warm Oak, Foliage & Ethiopian Artistry.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-fana-cream/65 sm:text-base">
            Every clip below is filmed on-site inside Fana Cafe — lazy-loaded smoothly only as you arrive at each corner of the room.
          </p>
        </div>

        {/* Primary Feature Card: Communal Oak Workspace Hub */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-fana-cream/12 bg-gradient-to-br from-[#1B1713] via-[#15120F] to-[#12100E] p-4 sm:p-6">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <LazyAmbientVideo
                src="/videos/workspace_hub.mp4"
                label="Fana Cafe communal oak workspace table with QR stand and neon sign"
                aspectClassName="aspect-video"
              />
            </div>

            <div className="space-y-5 px-2 pb-2 lg:col-span-5 lg:px-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-fana-wood/40 bg-fana-wood/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-fana-gold">
                <Laptop className="h-3 w-3" />
                Primary Space · Communal Hub
              </div>
              <h3 className="font-display text-2xl leading-tight text-fana-cream sm:text-3xl">
                The Long Oak Table & Workspace Hub
              </h3>
              <p className="text-sm leading-relaxed text-fana-cream/70">
                Settle in beneath lush indoor botanicals and the glowing Fana neon sign. With the bronze horse centerpiece and tabletop QR stands right beside you, ordering a fresh macchiato or platter never interrupts your flow.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-fana-cream/10 bg-fana-dark/60 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-fana-gold">
                    Tabletop QR
                  </p>
                  <p className="mt-1 text-xs text-fana-cream/75">
                    Tables 01–20 ready for instant ordering preview
                  </p>
                </div>
                <div className="rounded-xl border border-fana-green/40 bg-fana-green/20 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-fana-cream/90">
                    Botanical Oak
                  </p>
                  <p className="mt-1 text-xs text-fana-cream/75">
                    Natural daylight, warm wood & indoor greenery
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openDrawer}
                className="inline-flex items-center gap-2 rounded-full border border-fana-gold/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-fana-gold transition hover:bg-fana-gold hover:text-fana-dark"
              >
                Preview Table Ordering
              </button>
            </div>
          </div>
        </div>

        {/* Two Companion Spaces: Juice & Ice Cream Counter + Ceiling & Jebena Mural */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Card 2: Juice & Ice Cream Counter */}
          <article className="flex flex-col justify-between overflow-hidden rounded-3xl border border-fana-cream/12 bg-[#171411] p-4 sm:p-5">
            <LazyAmbientVideo
              src="/videos/juice_bar.mp4"
              label="Fana Juice and Ice Cream counter with fresh pineapples and avocados"
              aspectClassName="aspect-video"
            />
            <div className="mt-5 space-y-2.5 px-1">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fana-gold">
                <Sparkles className="h-3 w-3" />
                Fana Juice & Ice Cream Bar
              </div>
              <h3 className="font-display text-2xl text-fana-cream">
                Fresh Fruit Counter & Cold Blends
              </h3>
              <p className="text-sm leading-relaxed text-fana-cream/65">
                Under the illuminated FANA JUICE marquee, ripe avocados, pineapples, guavas, and papayas are blended to order alongside house ice cream treats.
              </p>
            </div>
          </article>

          {/* Card 3: Ceiling Wood Slats × Traditional Ethiopian Mural */}
          <article className="flex flex-col justify-between overflow-hidden rounded-3xl border border-fana-cream/12 bg-[#171411] p-4 sm:p-5">
            <LazyAmbientVideo
              src="/videos/tradition_mural.mp4"
              label="Fana Cafe wood slat ceiling dissolving into the Ethiopian Jebena and Mesob wall mural"
              aspectClassName="aspect-video"
            />
            <div className="mt-5 space-y-2.5 px-1">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fana-gold">
                <Compass className="h-3 w-3" />
                Architecture & Ethiopian Heritage
              </div>
              <h3 className="font-display text-2xl text-fana-cream">
                Wood Slats, Warm Glow & The Jebena Mural
              </h3>
              <p className="text-sm leading-relaxed text-fana-cream/65">
                Overhead lattice slats draped with bougainvillea and warm amber pillars give way to our illuminated Ethiopian sunset mural celebrating the Jebena and Mesob.
              </p>
            </div>
          </article>
        </div>

        {/* Subtle visual transition bridge */}
        <div className="mt-10 flex items-center justify-center gap-3 text-fana-cream/35">
          <span className="h-px w-16 bg-fana-cream/15" />
          <Utensils className="h-3.5 w-3.5 text-fana-gold/60" />
          <span className="h-px w-16 bg-fana-cream/15" />
        </div>
      </div>
    </section>
  );
}
