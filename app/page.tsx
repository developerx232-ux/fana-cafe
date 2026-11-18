/**
 * Root page — assembles scroll sections.
 * Phase 2 will fill in the actual section components.
 */
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />

      {/* Scroll sections — will be implemented in Phase 2 */}
      {/* <HeroSection />    S01: 3D Macchiato scroll intro */}
      {/* <VibeSection />    S02: Vibe grid with on-site videos */}
      {/* <MenuSection />    S03: Scroll-animated menu cards */}
      {/* <OrderSection />   S04: CTA + QR ordering entry point */}

      {/* Placeholder until Phase 2 */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-display text-fana-gold">Fana Cafe</h1>
          <p className="text-fana-cream/70 text-lg">22 Mazoria, Addis Ababa</p>
          <p className="text-fana-cream/40 text-sm">Phase 1 setup complete — Phase 2 UI incoming</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
