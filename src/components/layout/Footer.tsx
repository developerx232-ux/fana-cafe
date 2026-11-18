"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { scrollToTarget } from "@/lib/lenis";
import { navigateToExperienceCard } from "@/lib/experienceNav";

export default function Footer() {
  return (
    <footer className="border-t border-fana-cream/10 bg-[#0D0B09] py-14 text-fana-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 sm:px-10 md:flex-row md:items-center md:justify-between md:px-16">
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-fana-gold/40">
            <Image
              src="/logo.png"
              alt="Fana Cafe brand mark"
              width={512}
              height={512}
              loading="lazy"
              sizes="48px"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-display text-xl text-fana-gold">Fana Cafe</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-fana-cream/70">
              <MapPin className="h-3.5 w-3.5 text-fana-gold/80" aria-hidden="true" />
              22 Mazoria, Addis Ababa, Ethiopia
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fana-cream/40">
              Coffee · Juice & Ice Cream · Kitchen · Communal Workspace
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.16em] text-fana-cream/55">
          <button
            type="button"
            onClick={() => scrollToTarget("#story")}
            className="transition hover:text-fana-gold"
          >
            Story
          </button>
          <button
            type="button"
            onClick={() => scrollToTarget("#spaces")}
            className="transition hover:text-fana-gold"
          >
            Spaces
          </button>
          <button
            type="button"
            onClick={() => navigateToExperienceCard(2)}
            className="transition hover:text-fana-gold"
          >
            Open Kitchen
          </button>
          <button
            type="button"
            onClick={() => scrollToTarget("#menu")}
            className="transition hover:text-fana-gold"
          >
            Menu
          </button>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-fana-cream/8 px-6 pt-6 text-xs text-fana-cream/35 sm:px-10 md:flex md:items-center md:justify-between md:px-16">
        <p>© Fana Cafe — 22 Mazoria, Addis Ababa.</p>
        <p className="mt-2 md:mt-0 font-mono text-[10px] uppercase tracking-wider">
          Interactive QR Ordering UI Prototype (Phase 2)
        </p>
      </div>
    </footer>
  );
}
