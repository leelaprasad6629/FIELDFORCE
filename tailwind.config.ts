import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#080C14",
        surface: "#0B1018",
        surface2: "#0E1521",
        cyan: {
          DEFAULT: "#06B6D4",
        },
        indigo: {
          DEFAULT: "#6366F1",
        },
        emerald: {
          DEFAULT: "#10B981",
        },
        amber: {
          DEFAULT: "#F59E0B",
        },
        rose: {
          DEFAULT: "#F43F5E",
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 30px rgba(6, 182, 212, 0.25)",
        "glow-indigo": "0 0 30px rgba(99, 102, 241, 0.25)",
      },
      keyframes: {
        "blob-one": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(40px, -30px) scale(1.1)" },
        },
        "blob-two": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(-40px, 30px) scale(1.05)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "blob-one": "blob-one 8s ease-in-out infinite",
        "blob-two": "blob-two 12s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "ticker-scroll": "ticker-scroll 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
