import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireApiUser, requireManagerApi } from "@/lib/auth";
import { Technician } from "@/models/Technician";

function serializeTechnician(doc: Record<string, unknown>) {
  return {
    _id: String(doc._id),
    name: doc.name,
    status: doc.status,
    currentTask: doc.currentTask ?? null,
    location: doc.location,
    lat: doc.lat,
    lng: doc.lng,
    clerkUserId: doc.clerkUserId ?? null,
  };
}

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const technicians = await Technician.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(technicians.map((doc) => serializeTechnician(doc as Record<string, unknown>)));
  } catch (error) {
    console.error("GET /api/technicians error:", error);
    return NextResponse.json({ error: "Failed to fetch technicians" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireManagerApi();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name || !body.location) {
      return NextResponse.json({ error: "name and location are required" }, { status: 400 });
    }

    const technician = await Technician.create({
      name: body.name,
      status: body.status ?? "idle",
      currentTask: body.currentTask ?? null,
      location: body.location,
      lat: body.lat ?? 40.7128,
      lng: body.lng ?? -74.006,
      clerkUserId: body.clerkUserId ?? null,
    });

    return NextResponse.json(serializeTechnician(technician.toObject() as Record<string, unknown>), {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/technicians error:", error);
    return NextResponse.json({ error: "Failed to create technician" }, { status: 500 });
  }
}
