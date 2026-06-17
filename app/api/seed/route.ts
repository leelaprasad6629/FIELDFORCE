import { NextResponse } from "next/server";
import { requireManagerApi } from "@/lib/auth";
import { seedDatabase } from "@/lib/seed";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    const authResult = await requireManagerApi();
    if (authResult instanceof NextResponse) return authResult;
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json({
      message: "Database seeded successfully",
      ...result,
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST to seed the database" }, { status: 405 });
}
