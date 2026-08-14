import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Vercel-compatible: PORT/BASE_PATH are optional (defaults for Vercel builds)
const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || "/";

// Clerk publishable key — public by design (embedded in client bundle anyway).
// Falls back to the dev key so the app builds even if the env var isn't set on Vercel.
// When you set VITE_CLERK_PUBLISHABLE_KEY on Vercel with a pk_live_ key, it overrides this.
const CLERK_PK = process.env.VITE_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY ?? "pk_test_ZG9taW5hbnQtc2VhbC00OC5jbGVyay5hY2NvdW50cy5kZXYk";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(CLERK_PK),
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
