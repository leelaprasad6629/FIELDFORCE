import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Technician } from "@/models/Technician";

export async function GET() {
  try {
    await dbConnect();
    const technicians = await Technician.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(technicians);
  } catch (error) {
    console.error("GET /api/technicians error:", error);
    return NextResponse.json({ error: "Failed to fetch technicians" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const technician = await Technician.create({
      name: body.name,
      status: body.status ?? "idle",
      currentTask: body.currentTask ?? null,
      location: body.location,
      role: body.role ?? "Field Technician",
    });

    return NextResponse.json(technician, { status: 201 });
  } catch (error) {
    console.error("POST /api/technicians error:", error);
    return NextResponse.json({ error: "Failed to create technician" }, { status: 500 });
  }
}
