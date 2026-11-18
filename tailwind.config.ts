import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Fana Cafe Brand Tokens ────────────────────────────────────────────
      colors: {
        "fana-cream":  "#E8DFD5", // Canvas studio backdrop — section bg base
        "fana-dark":   "#12100E", // Deep Espresso — dark mode background
        "fana-gold":   "#F59E0B", // Warm amber / neon glow from cafe interior
        "fana-green":  "#1B4332", // Indoor botanical plant accent
        "fana-wood":   "#8B5A2B", // Communal oak table tone
      },
      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      // ─── Animation ────────────────────────────────────────────────────────
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "gold-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.4)" },
          "50%":       { boxShadow: "0 0 0 12px rgba(245, 158, 11, 0)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.6s ease-out forwards",
        "fade-in":    "fade-in 0.4s ease-out forwards",
        "gold-pulse": "gold-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      // ─── Spacing ──────────────────────────────────────────────────────────
      spacing: {
        "section": "6rem",         // standard section vertical padding
        "drawer-w": "28rem",       // QR order drawer width on desktop
      },
      // ─── Z-index ──────────────────────────────────────────────────────────
      zIndex: {
        "canvas":  "0",
        "content": "10",
        "nav":     "50",
        "drawer":  "60",
        "overlay": "55",
      },
      // ─── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
