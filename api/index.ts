// Vercel serverless function — re-exports the pre-built Express app
// The build:vercel script builds src/vercel-handler.ts → dist/vercel-handler.mjs
// which exports the Express app (without calling app.listen)
import handler from "../artifacts/api-server/dist/vercel-handler.mjs";

export default handler;
