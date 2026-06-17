import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireApiUser, requireManagerApi } from "../../lib/clerkAuth.js";
import { Task } from "../../models/Task.js";
import { Technician } from "../../models/Technician.js";
import { ServiceRequest } from "../../models/ServiceRequest.js";

const router = Router();

function serializeTask(doc: Record<string, unknown>) {
  return {
    _id: String(doc._id),
    id: String(doc.taskId),
    taskId: doc.taskId,
    title: doc.title,
    category: doc.category,
    assignedTo: doc.assignedTo ?? null,
    assignedTechnicianId: doc.assignedTechnicianId ?? null,
    serviceRequestId: doc.serviceRequestId ?? null,
    status: doc.status,
    zone: doc.zone,
    location: doc.location,
    priority: doc.priority,
    eta: doc.eta ?? null,
    createdAt: doc.createdAt,
    completedAt: doc.completedAt ?? null,
    checklist: doc.checklist ?? [],
  };
}

router.get("/tasks", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const mine = req.query.mine === "true";
    let filter: Record<string, unknown> = {};
    if (mine && auth.role === "technician") {
      const technician = await Technician.findOne({ clerkUserId: auth.userId });
      if (!technician) { res.json([]); return; }
      filter = { assignedTechnicianId: String(technician._id), status: { $ne: "completed" } };
    }
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    res.json(tasks.map((d) => serializeTask(d as Record<string, unknown>)));
  } catch (error) {
    req.log.error({ error }, "GET /api/tasks error");
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/tasks", async (req: Request, res: Response) => {
  const auth = await requireManagerApi(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const { title, zone, location, category, assignedTo, assignedTechnicianId, serviceRequestId, status, priority, eta, checklist, taskId } = req.body;
    if (!title || !zone || !location) { res.status(400).json({ error: "title, zone, and location are required" }); return; }
    const task = await Task.create({
      taskId: taskId ?? `TSK-${Date.now()}`, title, category: category ?? "General",
      assignedTo: assignedTo ?? null, assignedTechnicianId: assignedTechnicianId ?? null,
      serviceRequestId: serviceRequestId ?? null, status: status ?? "pending",
      zone, location, priority: priority ?? "medium",
      eta: eta ? new Date(eta) : null, checklist: checklist ?? [],
    });
    res.status(201).json(serializeTask(task.toObject() as Record<string, unknown>));
  } catch (error) {
    req.log.error({ error }, "POST /api/tasks error");
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/tasks/:id", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const task = await Task.findById(req.params.id);
    if (!task) { res.status(404).json({ error: "Task not found" }); return; }
    if (auth.role === "technician") {
      const technician = await Technician.findOne({ clerkUserId: auth.userId });
      if (!technician || String(task.assignedTechnicianId) !== String(technician._id)) {
        res.status(403).json({ error: "Forbidden" }); return;
      }
    }
    if (req.body.checklist) task.checklist = req.body.checklist;
    if (req.body.action === "complete") {
      task.status = "completed";
      task.completedAt = new Date();
      if (task.serviceRequestId) await ServiceRequest.findByIdAndUpdate(task.serviceRequestId, { status: "Completed", completedAt: new Date() });
      if (task.assignedTechnicianId) await Technician.findByIdAndUpdate(task.assignedTechnicianId, { status: "idle", currentTask: null });
    }
    await task.save();
    res.json(serializeTask(task.toObject() as Record<string, unknown>));
  } catch (error) {
    req.log.error({ error }, "PATCH /api/tasks/:id error");
    res.status(500).json({ error: "Failed to update task" });
  }
});

export default router;
