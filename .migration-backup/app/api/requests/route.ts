import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireApiUser } from "@/lib/auth";
import { ServiceRequest } from "@/models/ServiceRequest";

function serializeRequest(doc: Record<string, unknown>) {
  return {
    id: String(doc.requestId),
    _id: String(doc._id),
    title: doc.title,
    description: doc.description,
    customerName: doc.customerName,
    category: doc.category,
    priority: doc.priority,
    status: doc.status,
    location: doc.location,
    geofenceLocation: doc.geofenceLocation,
    assignedTechnicianId: doc.assignedTechnicianId ?? null,
    assignedTechnicianName: doc.assignedTechnicianName ?? null,
    createdAt: doc.createdAt,
    completedAt: doc.completedAt ?? null,
    eta: doc.eta ?? null,
  };
}

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const requests = await ServiceRequest.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(requests.map((doc) => serializeRequest(doc as Record<string, unknown>)));
  } catch (error) {
    console.error("GET /api/requests error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.description || !body.customerName) {
      return NextResponse.json({ error: "title, description, and customerName are required" }, { status: 400 });
    }

    const request = await ServiceRequest.create({
      requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title: body.title,
      description: body.description,
      customerName: body.customerName,
      category: body.category ?? "General",
      priority: body.priority ?? "Medium",
      status: "Pending",
      location: body.location ?? "Unassigned zone",
      geofenceLocation: body.geofenceLocation ?? {
        lat: 40.7128 + (Math.random() - 0.5) * 0.08,
        lng: -74.006 + (Math.random() - 0.5) * 0.08,
        radiusKm: 5,
      },
      eta: body.eta ? new Date(body.eta) : new Date(Date.now() + 2 * 60 * 60 * 1000),
    });

    return NextResponse.json(serializeRequest(request.toObject() as Record<string, unknown>), { status: 201 });
  } catch (error) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
