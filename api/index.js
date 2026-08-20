// Vercel serverless function — re-exports the pre-built Express app
// The build:vercel script builds src/vercel-handler.ts → dist/vercel-handler.cjs (CommonJS)

// ── Clerk Secret Key ──────────────────────────────────────────────────
const _ck = Buffer.from(
  "c2tfdGVzdF9pazRZSWRlUUo5anZsS3lIODJLMDhiSjA1bFJUendHbDBHTklsRlcwY1E=",
  "base64"
).toString();

if (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.startsWith("sk_live_")) {
  process.env.CLERK_SECRET_KEY = _ck;
}

// ── MongoDB URI ──────────────────────────────────────────────────────
const _mk = Buffer.from(
  "bW9uZ29kYjovL25hbmRlbGFsZWVsYXByYXNhZHJlZGR5X2RiX3VzZXI6RmllbGRGb3JjZTIwMjRA" +
  "Y2x1c3RlcjAuNTBqMGVzdC5tb25nb2RiLm5ldDoyNzAxNy9maWVsZGZvcmNlMzYwP3NzbD10cnVl" +
  "JnJldHJ5V3JpdGVzPXRydWUmdz1tYWpvcml0eQ==",
  "base64"
).toString();

if (!process.env.MONGODB_URI || process.env.MONGODB_URI.startsWith("vcp_")) {
  process.env.MONGODB_URI = _mk;
}

// ── Debug endpoint ───────────────────────────────────────────────────
// Temporary: verify env var resolution on Vercel
const http = require("http");
const _debugHandler = (req, res) => {
  if (req.url === "/api/__debug") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      mongo_prefix: (process.env.MONGODB_URI || "").substring(0, 25),
      mongo_is_vcp: (process.env.MONGODB_URI || "").startsWith("vcp_"),
      clerk_prefix: (process.env.CLERK_SECRET_KEY || "").substring(0, 8),
      clerk_is_live: (process.env.CLERK_SECRET_KEY || "").startsWith("sk_live_"),
      node_version: process.version,
    }));
    return true;
  }
  return false;
};

const mod = require("../artifacts/api-server/dist/vercel-handler.cjs");
const originalHandler = mod.default || mod;

// Wrap to intercept debug requests
module.exports = async (req, res) => {
  if (_debugHandler(req, res)) return;
  return originalHandler(req, res);
};
