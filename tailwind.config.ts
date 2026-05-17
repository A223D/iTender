import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand magenta — bg radial glow ONLY. Never on UI elements.
        fuchsia: {
          300: "#F0ABFC",
          400: "#E879F9",
          500: "#D946EF",
          600: "#C026D3",
          700: "#A21CAF",
        },
        // Cyan — corner glows + secondary accents
        cyan: {
          300: "#67E8F9",
          400: "#22D3EE",
          600: "#0891B2",
        },
        // Slate — dark mode bg anchors
        slate: {
          900: "#0F172A",
          950: "#020617",
        },
        // Functional
        error: "#DC2626",
        success: "#4CAF50",
        // Neutrals
        ink: "#000000",
        paper: "#FFFFFF",
        mist: "#EAECED",
        // Legacy aliases kept for gradual migration
        moss: "#386150",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.25)",
        glass: "0 4px 24px rgba(0, 0, 0, 0.25)",
        "glass-ambient": "0 8px 32px rgba(0, 0, 0, 0.35)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-medium": "float 4.2s ease-in-out infinite",
        "float-fast": "float 3.1s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2.5s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.3)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
