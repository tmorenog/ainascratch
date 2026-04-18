import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#fdfaf3",
          100: "#fbf3e1",
          200: "#f5e3bf",
          300: "#ebd09b",
          400: "#dab577",
          500: "#c1955a",
        },
        cocoa: {
          50: "#f6efe6",
          100: "#e6d4ba",
          200: "#caa37e",
          300: "#a47551",
          400: "#7c5236",
          500: "#5a3922",
          600: "#3f2614",
        },
        berry: {
          400: "#ea5d7c",
          500: "#d24268",
          600: "#a82c52",
        },
        mint: {
          300: "#bfead4",
          400: "#86d8a6",
          500: "#4ec47e",
        },
      },
      boxShadow: {
        bakery: "0 18px 40px -18px rgba(99, 51, 14, 0.45)",
        soft: "0 6px 18px -10px rgba(99, 51, 14, 0.5)",
        innerwarm: "inset 0 2px 6px rgba(255,232,200,0.7), inset 0 -3px 6px rgba(99,51,14,0.18)",
      },
      animation: {
        steam: "steam 3s ease-in-out infinite",
        wiggle: "wiggle 0.6s ease-in-out infinite",
        sparkle: "sparkle 1.4s linear infinite",
        oven: "ovenglow 2.4s ease-in-out infinite",
      },
      keyframes: {
        steam: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.0" },
          "30%": { opacity: "0.7" },
          "100%": { transform: "translateY(-22px) scale(1.4)", opacity: "0" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        sparkle: {
          "0%,100%": { opacity: "0", transform: "scale(0.6)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        ovenglow: {
          "0%,100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.25)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
