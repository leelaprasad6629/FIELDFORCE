import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireManagerApi } from "../../lib/clerkAuth.js";
import { handleApiError } from "../../lib/errorHandler.js";
import { Task } from "../../models/Task.js";
import { Technician } from "../../models/Technician.js";
import { ServiceRequest } from "../../models/ServiceRequest.js";

const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  const auth = await requireManagerApi(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const [openRequests, activeTechnicians, inProgressTasks, idleTechnicians, totalTechnicians] = await Promise.all([
      ServiceRequest.countDocuments({ status: { $in: ["Pending", "Assigned", "In-Progress"] } }),
      Technician.countDocuments({ status: { $in: ["on-route", "on-site"] } }),
      Task.countDocuments({ status: "in-progress" }),
      Technician.countDocuments({ status: "idle" }),
      Technician.countDocuments({}),
    ]);
    // Dispatch readiness = % of fleet available for dispatch (idle / total)
    const dispatchReadiness = totalTechnicians > 0 ? Math.round((idleTechnicians / totalTechnicians) * 100) : 0;
    res.json({ serviceRequests: openRequests, activeTechnicians, taskOverview: inProgressTasks, dispatchReadiness });
  } catch (error) {
    handleApiError(req, res, error, "Failed to fetch stats");
  }
});

export default router;
