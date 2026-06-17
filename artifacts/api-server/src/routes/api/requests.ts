import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireApiUser, requireManagerApi } from "../../lib/clerkAuth.js";
import { ServiceRequest } from "../../models/ServiceRequest.js";
import { Technician } from "../../models/Technician.js";
import { Task } from "../../models/Task.js";
import { Alert } from "../../models/Alert.js";
import { haversineKm } from "../../lib/distance.js";
import { sendDispatchEmail } from "../../lib/notifications.js";

const router = Router();

const DEFAULT_CHECKLIST = [
  "Inspect site entry and verify geofence",
  "Confirm customer identity via photo verification",
  "Run system diagnostics",
  "Complete calibration or repair steps",
  "Complete signature verification and close job",
];

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

router.get("/requests", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const requests = await ServiceRequest.find({}).sort({ createdAt: -1 }).lean();
    res.json(requests.map((d) => serializeRequest(d as Record<string, unknown>)));
  } catch (error) {
    req.log.error({ error }, "GET /api/requests error");
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

router.post("/requests", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  if (auth.role !== "manager") { res.status(403).json({ error: "Forbidden" }); return; }
  try {
    await dbConnect();
    const { title, description, customerName, category, priority, location, geofenceLocation, eta } = req.body;
    if (!title || !description || !customerName) { res.status(400).json({ error: "title, description, and customerName are required" }); return; }
    const request = await ServiceRequest.create({
      requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title, description, customerName,
      category: category ?? "General",
      priority: priority ?? "Medium",
      status: "Pending",
      location: location ?? "Unassigned zone",
      geofenceLocation: geofenceLocation ?? { lat: 40.7128 + (Math.random() - 0.5) * 0.08, lng: -74.006 + (Math.random() - 0.5) * 0.08, radiusKm: 5 },
      eta: eta ? new Date(eta) : new Date(Date.now() + 2 * 60 * 60 * 1000),
    });
    res.status(201).json(serializeRequest(request.toObject() as Record<string, unknown>));
  } catch (error) {
    req.log.error({ error }, "POST /api/requests error");
    res.status(500).json({ error: "Failed to create request" });
  }
});

router.post("/requests/:id/assign", async (req: Request, res: Response) => {
  const auth = await requireManagerApi(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) { res.status(404).json({ error: "Request not found" }); return; }
    if (serviceRequest.status !== "Pending") { res.status(400).json({ error: "Request is not pending assignment" }); return; }
    const idleTechnicians = await Technician.find({ status: "idle" });
    if (idleTechnicians.length === 0) { res.status(409).json({ error: "No idle technicians available" }); return; }
    const { lat, lng } = serviceRequest.geofenceLocation;
    const ranked = idleTechnicians.map((tech) => ({ tech, distance: haversineKm(lat, lng, tech.lat, tech.lng) })).sort((a, b) => a.distance - b.distance);
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
      taskId: `TSK-${Date.now()}`, title: serviceRequest.title, category: serviceRequest.category,
      assignedTo: technician.name, assignedTechnicianId: String(technician._id),
      serviceRequestId: String(serviceRequest._id), status: "in-progress",
      zone: serviceRequest.location, location: serviceRequest.location,
      priority: serviceRequest.priority.toLowerCase(), eta,
      checklist: DEFAULT_CHECKLIST.map((label) => ({ label, done: false })),
    });
    await Alert.create({ message: `Smart dispatch assigned ${technician.name} to ${serviceRequest.requestId}`, timestamp: new Date(), type: "info" });

    const notifResult = await sendDispatchEmail({
      technicianName: technician.name,
      technicianEmail: technician.email ?? null,
      requestTitle: serviceRequest.title,
      requestId: serviceRequest.requestId,
      customerName: serviceRequest.customerName,
      location: serviceRequest.location,
      priority: serviceRequest.priority,
      category: serviceRequest.category,
      etaDate: eta,
      distanceKm: Number(match.distance.toFixed(1)),
    });
    if (!notifResult.sent) {
      req.log.warn({ reason: notifResult.error }, "Dispatch email not sent");
    }

    res.json({
      request: serializeRequest(serviceRequest.toObject() as Record<string, unknown>),
      technician: { _id: String(technician._id), name: technician.name, distanceKm: Number(match.distance.toFixed(1)), score: Math.max(85, Math.round(100 - match.distance * 2)) },
      taskId: task.taskId,
      notification: notifResult,
    });
  } catch (error) {
    req.log.error({ error }, "POST /api/requests/:id/assign error");
    res.status(500).json({ error: "Failed to assign technician" });
  }
});

export default router;
