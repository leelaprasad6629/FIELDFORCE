import mongoose from "mongoose";

const cache = globalThis as typeof globalThis & {
  _mongooseCache?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cache._mongooseCache) {
  cache._mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error("MONGODB_URI env var not set");
  const c = cache._mongooseCache!;
  if (c.conn) return c.conn;
  if (!c.promise) {
    c.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  c.conn = await c.promise;
  return c.conn;
}

export default dbConnect;
