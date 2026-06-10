import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const mongoUri = MONGODB_URI;

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
  const cachedMongoose = cached.mongoose!;
  if (cachedMongoose.conn) {
    return cachedMongoose.conn;
  }

  if (!cachedMongoose.promise) {
    cachedMongoose.promise = mongoose.connect(mongoUri).then((mongooseInstance) => mongooseInstance);
  }

  cachedMongoose.conn = await cachedMongoose.promise;
  return cachedMongoose.conn;
}

export default dbConnect;
