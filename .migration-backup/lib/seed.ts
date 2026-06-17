import dbConnect from "@/lib/mongodb";
import { Technician } from "@/models/Technician";
import { Task } from "@/models/Task";
import { Alert } from "@/models/Alert";
import { ServiceRequest } from "@/models/ServiceRequest";

const DEFAULT_CHECKLIST = [
  "Inspect site entry and verify geofence",
  "Confirm customer identity via photo verification",
  "Run system diagnostics",
  "Complete calibration or repair steps",
  "Complete signature verification and close job",
];

export async function seedDatabase() {
  await dbConnect();

  await Promise.all([
    Technician.deleteMany({}),
    Task.deleteMany({}),
    Alert.deleteMany({}),
    ServiceRequest.deleteMany({}),
  ]);

  const technicians = await Technician.insertMany([
    {
      name: "Alex Rivera",
      status: "on-route",
      currentTask: "Transformer inspection",
      location: "Zone Alpha",
      lat: 40.72,
      lng: -74.01,
    },
    {
      name: "Sarah Chen",
      status: "on-site",
      currentTask: "HVAC calibration",
      location: "Client Zone Delta",
      lat: 40.74,
      lng: -73.99,
    },
    {
      name: "Marcus Vance",
      status: "idle",
      currentTask: null,
      location: "Depot HQ",
      lat: 40.71,
      lng: -74.03,
    },
  ]);

  const requests = await ServiceRequest.insertMany([
    {
      requestId: "REQ-1024",
      title: "Transformer inspection",
      description: "Customer reports intermittent power loss at warehouse.",
      customerName: "Northwind Logistics",
      category: "Electrical",
      priority: "High",
      status: "Pending",
      location: "Warehouse 7",
      geofenceLocation: { lat: 40.725, lng: -74.015, radiusKm: 5 },
      eta: new Date(Date.now() + 3 * 60 * 60 * 1000),
    },
    {
      requestId: "REQ-1138",
      title: "HVAC calibration",
      description: "Commercial center needs cooling system recalibration.",
      customerName: "Summit Retail Group",
      category: "HVAC",
      priority: "Critical",
      status: "Assigned",
      location: "Client Zone Delta",
      geofenceLocation: { lat: 40.738, lng: -73.992, radiusKm: 5 },
      assignedTechnicianId: String(technicians[1]._id),
      assignedTechnicianName: technicians[1].name,
      eta: new Date(Date.now() + 90 * 60 * 1000),
    },
  ]);

  await Task.insertMany([
    {
      taskId: "TSK-104",
      title: "Transformer inspection",
      category: "Electrical",
      assignedTo: technicians[0].name,
      assignedTechnicianId: String(technicians[0]._id),
      serviceRequestId: String(requests[0]._id),
      status: "in-progress",
      zone: "Zone Alpha",
      location: "Warehouse 7",
      priority: "high",
      eta: new Date(Date.now() + 2 * 60 * 60 * 1000),
      checklist: DEFAULT_CHECKLIST.map((label) => ({ label, done: false })),
    },
    {
      taskId: "TSK-105",
      title: "HVAC calibration",
      category: "HVAC",
      assignedTo: technicians[1].name,
      assignedTechnicianId: String(technicians[1]._id),
      serviceRequestId: String(requests[1]._id),
      status: "in-progress",
      zone: "Client Zone Delta",
      location: "Client Zone Delta",
      priority: "critical",
      eta: new Date(Date.now() + 90 * 60 * 1000),
      checklist: DEFAULT_CHECKLIST.map((label, index) => ({ label, done: index === 0 })),
    },
    {
      taskId: "TSK-108",
      title: "Panel replacement",
      category: "Electrical",
      assignedTo: technicians[1].name,
      assignedTechnicianId: String(technicians[1]._id),
      status: "completed",
      zone: "Client Zone Delta",
      location: "Client Zone Delta",
      priority: "high",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      eta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
      checklist: DEFAULT_CHECKLIST.map((label) => ({ label, done: true })),
    },
  ]);

  await Alert.insertMany([
    {
      message: "System optimized route for Task #105 via AI Router",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: "info",
    },
    {
      message: "Sarah Chen geo-fenced check-in verified at Client Zone Delta",
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      type: "info",
    },
    {
      message: "High-priority technician alert triggered for standalone zone review",
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      type: "warning",
    },
  ]);

  return {
    technicians: technicians.length,
    tasks: 3,
    alerts: 3,
    serviceRequests: requests.length,
  };
}
