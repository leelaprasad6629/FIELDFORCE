// Vercel serverless function — re-exports the pre-built Express app
// The build:vercel script builds src/vercel-handler.ts → dist/vercel-handler.cjs (CommonJS)
const mod = require("../artifacts/api-server/dist/vercel-handler.cjs");

module.exports = mod.default || mod;
