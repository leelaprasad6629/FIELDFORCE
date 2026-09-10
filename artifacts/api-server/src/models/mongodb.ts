import mongoose from "mongoose";

const cache = globalThis as typeof globalThis & {
  _mongooseCache?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cache._mongooseCache) {
  cache._mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) throw new Error("MONGODB_URI environment variable is not configured");
  const MONGODB_URI = rawUri.trim().replace(/^["']|["']$/g, "");

  const c = cache._mongooseCache!;
  if (c.conn && mongoose.connection.readyState === 1) return c.conn;

  if (!c.promise || mongoose.connection.readyState === 0) {
    c.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    }).then((m) => m);
  }

  try {
    c.conn = await c.promise;
    return c.conn;
  } catch (err) {
    c.promise = null;
    c.conn = null;
    throw err;
  }
}

export default dbConnect;

