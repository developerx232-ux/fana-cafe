export default function Footer() {
  return (
    <footer className="bg-fana-dark border-t border-fana-cream/10 py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="text-fana-gold font-display text-xl mb-1">Fana Cafe</p>
          <p className="text-fana-cream/50 text-sm">22 Mazoria, Addis Ababa, Ethiopia</p>
          <p className="text-fana-cream/30 text-xs mt-1">Open every day · 7:00 AM – 10:00 PM</p>
        </div>
        <div className="text-fana-cream/30 text-xs">
          © {new Date().getFullYear()} Fana Cafe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
