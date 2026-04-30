import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing (discover page)
        ink: "#161412",
        paper: "#f8f4ec",
        clay: "#d4a373",
        moss: "#386150",
        blush: "#f0dbcf",
        // Dark homepage palette
        void: "#07070E",
        depth: "#0F0F1A",
        surface: "#161628",
        card: "#1E1E35",
        coral: "#FF4566",
        violet: "#7B5FFF",
        teal: "#00E5CC",
        gold: "#FFB800",
        light: "#F2F2FF",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Trebuchet MS", "Avenir Next Condensed", "Arial Narrow", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 45px rgba(22, 20, 18, 0.12)",
        glow: "0 0 50px rgba(255, 69, 102, 0.35)",
        "glow-violet": "0 0 50px rgba(123, 95, 255, 0.35)",
        "glow-teal": "0 0 50px rgba(0, 229, 204, 0.3)",
        dashboard: "0 40px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.07)",
        "dashboard-light": "0 20px 60px rgba(123, 95, 255, 0.12), 0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
      },
      backgroundImage: {
        "board-grid":
          "radial-gradient(circle at 1px 1px, rgba(56, 97, 80, 0.12) 1px, transparent 0)",
        "cta-gradient": "linear-gradient(135deg, #FF4566 0%, #7B5FFF 100%)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-medium": "float 4.2s ease-in-out infinite",
        "float-fast": "float 3.1s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "gradient-x": "gradient-x 4s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.4)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
