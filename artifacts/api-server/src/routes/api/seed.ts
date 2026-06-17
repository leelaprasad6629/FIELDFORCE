import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireManagerApi } from "../../lib/clerkAuth.js";
import { Technician } from "../../models/Technician.js";
import { Task } from "../../models/Task.js";
import { Alert } from "../../models/Alert.js";
import { ServiceRequest } from "../../models/ServiceRequest.js";

const router = Router();

const DEFAULT_CHECKLIST = [
  "Inspect site entry and verify geofence",
  "Confirm customer identity via photo verification",
  "Run system diagnostics",
  "Complete calibration or repair steps",
  "Complete signature verification and close job",
];

router.post("/seed", async (req: Request, res: Response) => {
  const auth = await requireManagerApi(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    await Promise.all([Technician.deleteMany({}), Task.deleteMany({}), Alert.deleteMany({}), ServiceRequest.deleteMany({})]);
    const technicians = await Technician.insertMany([
      { name: "Alex Rivera", status: "on-route", currentTask: "Transformer inspection", location: "Zone Alpha", lat: 40.72, lng: -74.01 },
      { name: "Sarah Chen", status: "on-site", currentTask: "HVAC calibration", location: "Client Zone Delta", lat: 40.74, lng: -73.99 },
      { name: "Marcus Vance", status: "idle", currentTask: null, location: "Depot HQ", lat: 40.71, lng: -74.03 },
    ]);
    await ServiceRequest.insertMany([
      { requestId: "REQ-1024", title: "Transformer inspection", description: "Customer reports intermittent power loss at warehouse.", customerName: "Northwind Logistics", category: "Electrical", priority: "High", status: "Assigned", location: "Warehouse 7", geofenceLocation: { lat: 40.725, lng: -74.015, radiusKm: 5 }, assignedTechnicianId: String(technicians[0]._id), assignedTechnicianName: technicians[0].name, eta: new Date(Date.now() + 3 * 60 * 60 * 1000) },
      { requestId: "REQ-1138", title: "HVAC calibration", description: "Commercial center needs cooling system recalibration.", customerName: "Summit Retail Group", category: "HVAC", priority: "Critical", status: "Assigned", location: "Client Zone Delta", geofenceLocation: { lat: 40.738, lng: -73.992, radiusKm: 5 }, assignedTechnicianId: String(technicians[1]._id), assignedTechnicianName: technicians[1].name, eta: new Date(Date.now() + 90 * 60 * 1000) },
      { requestId: "REQ-1201", title: "Network router replacement", description: "Office network down, needs router swap.", customerName: "BlueSky Corp", category: "Networking", priority: "Medium", status: "Pending", location: "BlueSky Office Park", geofenceLocation: { lat: 40.73, lng: -74.005, radiusKm: 5 } },
    ]);
    await Task.insertMany([
      { taskId: "TSK-001", title: "Transformer inspection", category: "Electrical", assignedTo: technicians[0].name, assignedTechnicianId: String(technicians[0]._id), status: "in-progress", zone: "Zone Alpha", location: "Warehouse 7", priority: "high", eta: new Date(Date.now() + 3 * 60 * 60 * 1000), checklist: DEFAULT_CHECKLIST.map((label) => ({ label, done: false })) },
      { taskId: "TSK-002", title: "HVAC calibration", category: "HVAC", assignedTo: technicians[1].name, assignedTechnicianId: String(technicians[1]._id), status: "in-progress", zone: "Zone Delta", location: "Client Zone Delta", priority: "critical", eta: new Date(Date.now() + 90 * 60 * 1000), checklist: DEFAULT_CHECKLIST.map((label, i) => ({ label, done: i < 2 })) },
    ]);
    await Alert.insertMany([
      { message: "Smart dispatch assigned Alex Rivera to REQ-1024", timestamp: new Date(Date.now() - 30 * 60 * 1000), type: "info" },
      { message: "Smart dispatch assigned Sarah Chen to REQ-1138", timestamp: new Date(Date.now() - 45 * 60 * 1000), type: "info" },
      { message: "Geofence breach detected in Zone Bravo", timestamp: new Date(Date.now() - 60 * 60 * 1000), type: "warning" },
    ]);
    res.json({ message: "Database seeded successfully", technicians: 3, requests: 3, tasks: 2, alerts: 3 });
  } catch (error) {
    req.log.error({ error }, "POST /api/seed error");
    res.status(500).json({ error: "Failed to seed database" });
  }
});

export default router;
