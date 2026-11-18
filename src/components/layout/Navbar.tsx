"use client";

import Image from "next/image";
import { QrCode, ShoppingBag } from "lucide-react";
import { scrollToTarget } from "@/lib/lenis";
import { navigateToExperienceCard } from "@/lib/experienceNav";
import { useOrderDrawer } from "@/components/order-drawer/OrderDrawerProvider";

const NAV_LINKS = [
  { href: "#story", label: "Story" },
  { href: "#spaces", label: "Spaces" },
  { href: "#kitchen", label: "Open Kitchen", experienceIndex: 2 },
  { href: "#menu", label: "Menu" },
];

export default function Navbar() {
  const { openDrawer, tableNumber, totalItemCount } = useOrderDrawer();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    experienceIndex?: number
  ) => {
    e.preventDefault();
    if (typeof experienceIndex === "number") {
      navigateToExperienceCard(experienceIndex);
    } else if (href === "#spaces" || href === "#story") {
      scrollToTarget(href, { offset: 0 });
    } else {
      scrollToTarget(href);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-nav border-b border-fana-cream/10 bg-fana-dark/75 backdrop-blur-lg">
      <div className="grid h-16 w-full grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 md:px-[clamp(1.75rem,6vw,6rem)] lg:grid-cols-[1fr_auto_1fr]">
        {/* Brand Mark — Far Left */}
        <a
          href="#story"
          onClick={(e) => handleNavClick(e, "#story")}
          className="justify-self-start flex items-center gap-3 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold"
        >
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-fana-gold/50">
            <Image
              src="/logo.png"
              alt="Fana Cafe Logo"
              width={512}
              height={512}
              priority
              sizes="36px"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <span className="block whitespace-nowrap font-display text-sm font-semibold tracking-wide text-fana-cream sm:text-base">
              Fana Cafe
            </span>
            <span className="hidden whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-fana-gold/85 sm:block">
              22 Mazoria · Addis Ababa
            </span>
          </div>
        </a>

        {/* Navigation Links — True Horizontal Center */}
        <nav
          aria-label="Primary navigation"
          className="hidden justify-self-center items-center gap-6 whitespace-nowrap lg:flex xl:gap-8"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href, link.experienceIndex)}
              className="text-xs font-medium uppercase tracking-[0.16em] text-fana-cream/70 transition hover:text-fana-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Table Status & Order Drawer Trigger — Far Right */}
        <div className="justify-self-end flex items-center gap-2.5">
          {tableNumber && (
            <button
              type="button"
              onClick={openDrawer}
              className="hidden rounded-full border border-fana-gold/35 bg-fana-gold/10 px-3 py-1.5 font-mono text-[11px] font-medium text-fana-gold transition hover:bg-fana-gold/20 sm:inline-flex"
            >
              Table {String(tableNumber).padStart(2, "0")}
            </button>
          )}

          <button
            type="button"
            onClick={openDrawer}
            className="inline-flex items-center gap-2 rounded-full bg-fana-gold px-4 py-2 text-xs font-semibold text-fana-dark shadow-[0_0_20px_rgba(245,158,11,0.25)] transition hover:bg-fana-gold/90 sm:text-sm"
          >
            {totalItemCount > 0 ? (
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            ) : (
              <QrCode className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{totalItemCount > 0 ? "Table Tray" : "Order"}</span>
            {totalItemCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-fana-dark px-1.5 font-mono text-[11px] font-bold text-fana-gold">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
