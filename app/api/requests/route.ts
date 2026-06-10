import { NextRequest, NextResponse } from "next/server";

const mockRequests = [
  {
    id: "REQ-1024",
    title: "Transformer inspection",
    description: "Customer reports intermittent power loss at warehouse.",
    priority: "High",
    status: "Pending",
    assignedTechnicianId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "REQ-1138",
    title: "HVAC calibration",
    description: "Commercial center needs cooling system recalibration.",
    priority: "Medium",
    status: "Assigned",
    assignedTechnicianId: "Talia Vega",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(mockRequests);
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const newRequest = {
    id: `REQ-${Math.floor(Math.random() * 10000)}`,
    title: payload.title ?? "Untitled request",
    description: payload.description ?? "No description provided.",
    customerName: payload.customerName ?? "Unknown customer",
    status: payload.status ?? "Pending",
    priority: payload.priority ?? "Medium",
    geofenceLocation: payload.geofenceLocation ?? { lat: 0, lng: 0, radiusKm: 5 },
    assignedTechnicianId: payload.assignedTechnicianId ?? null,
    createdAt: new Date().toISOString(),
  };

  mockRequests.unshift(newRequest);
  return NextResponse.json(newRequest, { status: 201 });
}
