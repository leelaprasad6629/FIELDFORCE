import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireApiUser } from "@/lib/auth";
import { Alert } from "@/models/Alert";

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const alerts = await Alert.find({}).sort({ timestamp: -1 }).limit(10).lean();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
