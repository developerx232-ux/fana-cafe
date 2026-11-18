"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [orderOpen, setOrderOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-nav h-16 flex items-center justify-between px-6 md:px-12 bg-fana-dark/80 backdrop-blur-md border-b border-fana-cream/10">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-fana-gold/20 border border-fana-gold/40 flex items-center justify-center">
          <span className="text-fana-gold font-bold text-xs">F</span>
        </div>
        <span className="text-fana-cream font-display font-medium tracking-wide">
          Fana Cafe
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-sm text-fana-cream/60">
        <a href="#vibe" className="hover:text-fana-cream transition-colors">Our Space</a>
        <a href="#menu" className="hover:text-fana-cream transition-colors">Menu</a>
        <a href="#order" className="hover:text-fana-cream transition-colors">Order</a>
      </div>

      {/* CTA */}
      <button
        onClick={() => setOrderOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-fana-gold text-fana-dark text-sm font-semibold hover:bg-fana-gold/90 transition-all"
      >
        Order Now
      </button>
    </nav>
  );
}
