import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireApiUser } from "@/lib/auth";
import { Technician, type TechnicianStatus } from "@/models/Technician";

const VALID_STATUSES: TechnicianStatus[] = ["on-route", "on-site", "idle", "break"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const body = await req.json();
    const technician = await Technician.findById(params.id);
    if (!technician) {
      return NextResponse.json({ error: "Technician not found" }, { status: 404 });
    }

    if (
      authResult.role === "technician" &&
      technician.clerkUserId &&
      technician.clerkUserId !== authResult.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.status && VALID_STATUSES.includes(body.status)) {
      technician.status = body.status;
    }
    if (typeof body.lat === "number") technician.lat = body.lat;
    if (typeof body.lng === "number") technician.lng = body.lng;
    if (body.location) technician.location = body.location;
    if (body.currentTask !== undefined) technician.currentTask = body.currentTask;

    await technician.save();

    return NextResponse.json({
      _id: String(technician._id),
      name: technician.name,
      status: technician.status,
      currentTask: technician.currentTask,
      location: technician.location,
      lat: technician.lat,
      lng: technician.lng,
    });
  } catch (error) {
    console.error("PATCH /api/technicians/[id] error:", error);
    return NextResponse.json({ error: "Failed to update technician" }, { status: 500 });
  }
}
