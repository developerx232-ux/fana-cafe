import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollStoryExperience from "@/components/canvas/ScrollStoryExperience";
import FanaExperiencesSection from "@/components/sections/FanaExperiencesSection";
import MenuShowcaseSection from "@/components/sections/MenuShowcaseSection";
import TableOrderCalloutSection from "@/components/sections/TableOrderCalloutSection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-fana-dark text-fana-cream">
      <Navbar />

      <main>
        {/* 1. Hero / 368-Frame 3D Coffee Storytelling Experience */}
        <ScrollStoryExperience />

        {/* 2. Fana Experiences (#spaces) — 4-Card Horizontal Square Video Showcase */}
        <FanaExperiencesSection />

        {/* 3. Interactive Visual Menu — 26 Transparent WebP Plates + Signature Coffee */}
        <MenuShowcaseSection />

        {/* 4. Instant QR Table Ordering Experience (Tables 01–20) */}
        <TableOrderCalloutSection />
      </main>

      <Footer />
    </div>
  );
}
