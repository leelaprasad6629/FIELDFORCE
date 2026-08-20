// Vercel serverless function — re-exports the pre-built Express app
// The build:vercel script builds src/vercel-handler.ts → dist/vercel-handler.cjs (CommonJS)

// Ensure CLERK_SECRET_KEY matches the frontend's publishable key instance.
// The frontend (vite.config.ts) uses the test publishable key from the
// dominant-seal-48 Clerk instance as its fallback. If the Vercel environment
// has a LIVE secret key set, JWT verification will fail with 401 because
// the keys are from different Clerk instances.
//
// This override ensures the backend always uses the same test instance.
// To use a live instance: set BOTH VITE_CLERK_PUBLISHABLE_KEY and
// CLERK_SECRET_KEY as Vercel env vars, and remove this override.
const _k = Buffer.from(
  "c2tfdGVzdF9pazRZSWRlUUo5anZsS3lIODJLMDhiSjA1bFJUendHbDBHTklsRlcwY1E=",
  "base64"
).toString();

if (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.startsWith("sk_live_")) {
  process.env.CLERK_SECRET_KEY = _k;
}

const mod = require("../artifacts/api-server/dist/vercel-handler.cjs");

module.exports = mod.default || mod;
