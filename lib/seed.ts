import dbConnect from "@/lib/mongodb";
import { Technician } from "@/models/Technician";
import { Task } from "@/models/Task";
import { Alert } from "@/models/Alert";

export async function seedDatabase() {
  await dbConnect();

  await Promise.all([
    Technician.deleteMany({}),
    Task.deleteMany({}),
    Alert.deleteMany({}),
  ]);

  const technicians = await Technician.insertMany([
    {
      name: "Alex Rivera",
      status: "active",
      currentTask: "Task #104",
      location: "Zone Alpha",
      role: "Senior Field Technician",
    },
    {
      name: "Sarah Chen",
      status: "active",
      currentTask: "Geo-fenced Check-In",
      location: "Client Zone Delta",
      role: "Field Technician",
    },
    {
      name: "Marcus Vance",
      status: "break",
      currentTask: null,
      location: "Depot HQ",
      role: "Field Technician",
    },
  ]);

  await Task.insertMany([
    {
      taskId: "TSK-104",
      title: "Transformer inspection",
      assignedTo: technicians[0].name,
      status: "in-progress",
      zone: "Zone Alpha",
      priority: "high",
    },
    {
      taskId: "TSK-105",
      title: "HVAC calibration",
      assignedTo: technicians[1].name,
      status: "in-progress",
      zone: "Client Zone Delta",
      priority: "medium",
    },
    {
      taskId: "TSK-106",
      title: "Cable routing audit",
      assignedTo: technicians[0].name,
      status: "pending",
      zone: "Zone Beta",
      priority: "low",
    },
    {
      taskId: "TSK-107",
      title: "Emergency generator test",
      assignedTo: technicians[2].name,
      status: "pending",
      zone: "Zone Gamma",
      priority: "critical",
    },
    {
      taskId: "TSK-108",
      title: "Panel replacement",
      assignedTo: technicians[1].name,
      status: "completed",
      zone: "Client Zone Delta",
      priority: "high",
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
    {
      message: "Dispatch readiness recalculated: service windows on track",
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      type: "info",
    },
    {
      message: "Critical task TSK-107 awaiting technician assignment",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: "critical",
    },
  ]);

  return {
    technicians: technicians.length,
    tasks: 5,
    alerts: 5,
  };
}
