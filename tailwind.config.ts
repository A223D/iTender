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
        ink: "#161412",
        paper: "#f8f4ec",
        clay: "#d4a373",
        moss: "#386150",
        blush: "#f0dbcf",
        gold: "#f6c453",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Trebuchet MS", "Avenir Next Condensed", "Arial Narrow", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 45px rgba(22, 20, 18, 0.12)",
      },
      backgroundImage: {
        "board-grid":
          "radial-gradient(circle at 1px 1px, rgba(56, 97, 80, 0.12) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
