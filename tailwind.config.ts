import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0c0711",
        surface2: "#120d1b",
        accent: "#7c3aed",
        accentSoft: "#9d7fff",
        border: "rgba(140, 94, 255, 0.14)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 58, 237, 0.18)",
      },
      backgroundImage: {
        radial: "radial-gradient(circle at top, rgba(124, 58, 237, 0.22), transparent 40%), radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.12), transparent 20%)",
      },
    },
  },
  plugins: [],
};

export default config;
