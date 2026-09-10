import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const cache = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

if (!cache._mongooseCache) {
  cache._mongooseCache = { conn: null, promise: null };
}

/**
 * Strips credentials from a MongoDB URI for safe diagnostics and error messages.
 */
export function sanitizeMongoUri(uri?: string): string {
  if (!uri) return "[NOT_SET]";
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)(?:[^:]+:[^@]+@)?([^/?#]+)(.*)/, (_, proto, host, rest) => {
    const cleanRest = rest.split("?")[0] || "";
    return `${proto}***:***@${host}${cleanRest}`;
  });
}

/**
 * Returns database connection status and diagnostics without sensitive information.
 */
export function getDatabaseStatus() {
  const stateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const readyState = mongoose.connection.readyState;
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL;

  let sanitizedTarget = "[NOT_SET]";
  if (rawUri) {
    sanitizedTarget = sanitizeMongoUri(rawUri.trim().replace(/^["']|["']$/g, ""));
  }

  return {
    configured: Boolean(rawUri),
    readyState,
    status: stateMap[readyState] ?? "unknown",
    databaseName: mongoose.connection.name || "fieldforce360",
    target: sanitizedTarget,
  };
}

async function dbConnect(): Promise<typeof mongoose> {
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL;
  if (!rawUri) {
    throw new Error("MONGODB_URI environment variable is not configured in Vercel environment variables");
  }

  const MONGODB_URI = rawUri.trim().replace(/^["']|["']$/g, "");
  const c = cache._mongooseCache!;

  // 1. Return active, verified connection
  if (c.conn && mongoose.connection.readyState === 1) {
    return c.conn;
  }

  // 2. Wait for an in-flight connection promise if currently connecting
  if (c.promise && mongoose.connection.readyState === 2) {
    c.conn = await c.promise;
    return c.conn;
  }

  // 3. Initiate new connection if disconnected or cache empty
  if (!c.promise || mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    const opts: mongoose.ConnectOptions = {
      dbName: "fieldforce360",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: true,
    };

    c.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      c.conn = m;
      return m;
    });
  }

  try {
    c.conn = await c.promise;
    return c.conn;
  } catch (err: any) {
    c.promise = null;
    c.conn = null;

    const errMsg = err?.message || String(err);
    const sanitized = sanitizeMongoUri(MONGODB_URI);
    let diagnostic = "Database connection error";

    if (
      errMsg.includes("Server selection") ||
      errMsg.includes("whitelist") ||
      err?.name === "MongooseServerSelectionError"
    ) {
      diagnostic = `MongoDB Atlas server selection timed out for target: ${sanitized}. Ensure MongoDB Atlas Network Access whitelist allows 0.0.0.0/0 (Vercel serverless IPs).`;
    } else if (errMsg.includes("bad auth") || errMsg.includes("Authentication failed")) {
      diagnostic = `MongoDB Atlas authentication failed for target: ${sanitized}. Check username and password in MONGODB_URI.`;
    } else if (errMsg.includes("ENOTFOUND") || errMsg.includes("getaddrinfo")) {
      diagnostic = `MongoDB host DNS resolution failed for target: ${sanitized}.`;
    }

    const enhancedError = new Error(`${diagnostic} [${errMsg}]`);
    enhancedError.name = err?.name || "MongoConnectionError";
    (enhancedError as any).code = err?.code || "DB_CONNECTION_ERROR";
    throw enhancedError;
  }
}

export default dbConnect;
