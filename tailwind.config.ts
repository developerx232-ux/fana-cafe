import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Fana Cafe Brand Tokens ────────────────────────────────────────────
      colors: {
        "fana-cream": "#E8DFD5", // Canvas studio backdrop
        "fana-dark":  "#12100E", // Deep Espresso dark mode background
        "fana-gold":  "#F59E0B", // Warm amber / neon glow from cafe interior
        "fana-green": "#1B4332", // Indoor botanical plant accent
        "fana-wood":  "#8B5A2B", // Communal oak table tone
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
      },
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
          "50%":      { boxShadow: "0 0 0 12px rgba(245, 158, 11, 0)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.6s ease-out forwards",
        "fade-in":    "fade-in 0.4s ease-out forwards",
        "gold-pulse": "gold-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      spacing: {
        section:    "6rem",
        "drawer-w": "28rem",
      },
      zIndex: {
        canvas:  "0",
        content: "10",
        nav:     "50",
        overlay: "55",
        drawer:  "60",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
