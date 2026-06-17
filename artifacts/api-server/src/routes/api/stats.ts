import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireApiUser } from "../../lib/clerkAuth.js";
import { Task } from "../../models/Task.js";
import { Technician } from "../../models/Technician.js";
import { ServiceRequest } from "../../models/ServiceRequest.js";

const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const [openRequests, activeTechnicians, inProgressTasks, totalTasks, completedTasks] = await Promise.all([
      ServiceRequest.countDocuments({ status: { $in: ["Pending", "Assigned", "In-Progress"] } }),
      Technician.countDocuments({ status: { $in: ["on-route", "on-site"] } }),
      Task.countDocuments({ status: "in-progress" }),
      Task.countDocuments(),
      Task.countDocuments({ status: "completed" }),
    ]);
    const dispatchReadiness = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    res.json({ serviceRequests: openRequests, activeTechnicians, taskOverview: inProgressTasks, dispatchReadiness });
  } catch (error) {
    req.log.error({ error }, "GET /api/stats error");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
