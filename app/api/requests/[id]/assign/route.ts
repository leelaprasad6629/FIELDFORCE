import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireManagerApi } from "@/lib/auth";
import { haversineKm } from "@/lib/distance";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Task } from "@/models/Task";
import { Technician } from "@/models/Technician";
import { Alert } from "@/models/Alert";

const DEFAULT_CHECKLIST = [
  "Inspect site entry and verify geofence",
  "Confirm customer identity via photo verification",
  "Run system diagnostics",
  "Complete calibration or repair steps",
  "Complete signature verification and close job",
];

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireManagerApi();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const serviceRequest = await ServiceRequest.findById(params.id);
    if (!serviceRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (serviceRequest.status !== "Pending") {
      return NextResponse.json({ error: "Request is not pending assignment" }, { status: 400 });
    }

    const idleTechnicians = await Technician.find({ status: "idle" });
    if (idleTechnicians.length === 0) {
      return NextResponse.json({ error: "No idle technicians available" }, { status: 409 });
    }

    const { lat, lng } = serviceRequest.geofenceLocation;
    const ranked = idleTechnicians
      .map((tech) => ({
        tech,
        distance: haversineKm(lat, lng, tech.lat, tech.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    const match = ranked[0];
    const technician = match.tech;
    const eta = new Date(Date.now() + Math.round(match.distance * 12 + 20) * 60 * 1000);

    serviceRequest.status = "Assigned";
    serviceRequest.assignedTechnicianId = String(technician._id);
    serviceRequest.assignedTechnicianName = technician.name;
    serviceRequest.eta = eta;
    await serviceRequest.save();

    technician.status = "on-route";
    technician.currentTask = serviceRequest.title;
    technician.location = serviceRequest.location;
    technician.lat = lat + (Math.random() - 0.5) * 0.01;
    technician.lng = lng + (Math.random() - 0.5) * 0.01;
    await technician.save();

    const task = await Task.create({
      taskId: `TSK-${Date.now()}`,
      title: serviceRequest.title,
      category: serviceRequest.category,
      assignedTo: technician.name,
      assignedTechnicianId: String(technician._id),
      serviceRequestId: String(serviceRequest._id),
      status: "in-progress",
      zone: serviceRequest.location,
      location: serviceRequest.location,
      priority: serviceRequest.priority.toLowerCase(),
      eta,
      checklist: DEFAULT_CHECKLIST.map((label) => ({ label, done: false })),
    });

    await Alert.create({
      message: `Smart dispatch assigned ${technician.name} to ${serviceRequest.requestId}`,
      timestamp: new Date(),
      type: "info",
    });

    return NextResponse.json({
      request: {
        id: serviceRequest.requestId,
        _id: String(serviceRequest._id),
        title: serviceRequest.title,
        description: serviceRequest.description,
        priority: serviceRequest.priority,
        status: serviceRequest.status,
        assignedTechnicianId: serviceRequest.assignedTechnicianId,
        assignedTechnicianName: serviceRequest.assignedTechnicianName,
        eta: serviceRequest.eta,
      },
      technician: {
        _id: String(technician._id),
        name: technician.name,
        distanceKm: Number(match.distance.toFixed(1)),
        score: Math.max(85, Math.round(100 - match.distance * 2)),
      },
      taskId: task.taskId,
    });
  } catch (error) {
    console.error("POST /api/requests/[id]/assign error:", error);
    return NextResponse.json({ error: "Failed to assign technician" }, { status: 500 });
  }
}
