import type { Config } from "tailwindcss";

// Eternal Chapter brand: monochrome – near-black ground, white type, white at reduced opacity for secondary text and lines.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // App (site + dashboard) palette
        canvas: "#0a0a0a", // page background
        surface: "#121212", // cards, panels
        line: "#262626", // borders, dividers
        muted: "#8f8f8f", // secondary text (≈ white 55%)
        brand: { DEFAULT: "#ffffff", soft: "#1f1f1f", ink: "#ededed" },
        // Golden Poruwa invitation design palette (a product design, not the brand)
        lacquer: { DEFAULT: "#3b0d14", 2: "#521520" },
        gold: { DEFAULT: "#d6b36a", soft: "#a88b4f" },
        ivory: { DEFAULT: "#f6ecd9", dim: "#cdbfa6" },
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        script: ["var(--font-script)", "cursive"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        caps: ["var(--font-caps)", "Georgia", "serif"],
        sans: ["var(--font-body)", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
