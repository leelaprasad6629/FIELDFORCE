import mongoose from "mongoose";

let cached = globalThis as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error("MONGODB_URI env var not set");
  const cachedMongoose = cached.mongoose!;
  if (cachedMongoose.conn) return cachedMongoose.conn;
  if (!cachedMongoose.promise) {
    cachedMongoose.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cachedMongoose.conn = await cachedMongoose.promise;
  return cachedMongoose.conn;
}

export default dbConnect;
