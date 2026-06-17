import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireApiUser } from "../../lib/clerkAuth.js";
import { Alert } from "../../models/Alert.js";

const router = Router();

router.get("/alerts", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const alerts = await Alert.find({}).sort({ timestamp: -1 }).limit(10).lean();
    res.json(alerts);
  } catch (error) {
    req.log.error({ error }, "GET /api/alerts error");
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

export default router;
