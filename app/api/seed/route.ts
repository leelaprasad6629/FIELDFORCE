import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed endpoint is disabled in production" }, { status: 403 });
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json({
      message: "Database seeded successfully",
      ...result,
    });
  } catch (error) {
    console.error("GET /api/seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
