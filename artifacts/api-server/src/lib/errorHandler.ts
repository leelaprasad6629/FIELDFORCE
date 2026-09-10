import type { Request, Response } from "express";

/**
 * Categorizes and formats backend errors safely into meaningful HTTP responses
 * without leaking sensitive credentials (passwords, connection strings, tokens).
 */
export function handleApiError(
  req: Request,
  res: Response,
  error: unknown,
  fallbackMessage: string
) {
  const err = error instanceof Error ? error : new Error(String(error));
  const errMessage = err.message || "";
  const errName = err.name || "Error";

  // Log full error safely to Pino using standard serializer
  req.log?.error({ err, errorName: errName, errorMessage: errMessage }, fallbackMessage);

  const lower = errMessage.toLowerCase();

  // 1. Missing MongoDB URI environment variable
  if (lower.includes("mongodb_uri") || lower.includes("not configured")) {
    return res.status(503).json({
      error: "Database configuration error: MONGODB_URI environment variable is not configured in Vercel.",
      code: "DB_CONFIG_MISSING",
      help: "Add MONGODB_URI to Vercel Project Settings > Environment Variables for the Production environment and trigger a redeployment.",
    });
  }

  // 2. IP Whitelist / Network access timeout connecting to MongoDB Atlas
  if (
    lower.includes("serverselection") ||
    lower.includes("timed out") ||
    lower.includes("whitelist") ||
    lower.includes("enotfound") ||
    errName === "MongooseServerSelectionError"
  ) {
    return res.status(503).json({
      error: "Database connection failed: Network or IP whitelist timeout connecting to MongoDB Atlas.",
      code: "DB_CONNECTION_TIMEOUT",
      help: "Ensure MongoDB Atlas Network Access whitelist includes 0.0.0.0/0 (Allow Access from Anywhere) for Vercel serverless functions.",
    });
  }

  // 3. Authentication failure (bad username or password)
  if (lower.includes("bad auth") || lower.includes("authentication failed")) {
    return res.status(503).json({
      error: "Database authentication failed: Invalid MongoDB credentials.",
      code: "DB_AUTH_FAILED",
      help: "Verify the database username and password in MONGODB_URI in Vercel Project Settings.",
    });
  }

  // 4. Default 500 error with non-sensitive detail
  return res.status(500).json({
    error: fallbackMessage,
    code: "INTERNAL_ERROR",
    detail: errName !== "Error" ? errName : undefined,
  });
}
