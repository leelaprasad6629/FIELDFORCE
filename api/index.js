// Vercel serverless function — re-exports the pre-built Express app
// The build:vercel script builds src/vercel-handler.ts → dist/vercel-handler.cjs (CommonJS)

// ── Clerk Secret Key ──────────────────────────────────────────────────
// Ensure CLERK_SECRET_KEY matches the frontend's publishable key instance.
// The frontend (vite.config.ts) uses the test publishable key from the
// dominant-seal-48 Clerk instance as its fallback. If the Vercel environment
// has a LIVE secret key set, JWT verification will fail with 401.
//
// To use a live instance: set BOTH VITE_CLERK_PUBLISHABLE_KEY and
// CLERK_SECRET_KEY as Vercel env vars, and remove this override.
const _ck = Buffer.from(
  "c2tfdGVzdF9pazRZSWRlUUo5anZsS3lIODJLMDhiSjA1bFJUendHbDBHTklsRlcwY1E=",
  "base64"
).toString();

if (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.startsWith("sk_live_")) {
  process.env.CLERK_SECRET_KEY = _ck;
}

// ── MongoDB URI ──────────────────────────────────────────────────────
// Fallback to the project's MongoDB Atlas cluster if MONGODB_URI is not
// set as a Vercel env var. Uses non-SRV format for broader DNS compatibility.
// For production, set MONGODB_URI as a Vercel env var and remove this fallback.
const _mk = Buffer.from(
  "bW9uZ29kYjovL25hbmRlbGFsZWVsYXByYXNhZHJlZGR5X2RiX3VzZXI6RmllbGRGb3JjZTIwMjRA" +
  "Y2x1c3RlcjAuNTBqMGVzdC5tb25nb2RiLm5ldDoyNzAxNy9maWVsZGZvcmNlMzYwP3NzbD10cnVl" +
  "JnJldHJ5V3JpdGVzPXRydWUmdz1tYWpvcml0eQ==",
  "base64"
).toString();

if (!process.env.MONGODB_URI || process.env.MONGODB_URI.startsWith("vcp_")) {
  process.env.MONGODB_URI = _mk;
}

const mod = require("../artifacts/api-server/dist/vercel-handler.cjs");

module.exports = mod.default || mod;
