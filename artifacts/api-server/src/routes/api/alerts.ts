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
    const limit = Math.min(Number(req.query.limit ?? 50), 100);
    const alerts = await Alert.find({}).sort({ timestamp: -1 }).limit(limit).lean();
    res.json(alerts.map((a) => ({
      _id: String(a._id),
      message: a.message,
      timestamp: a.timestamp,
      type: a.type,
    })));
  } catch (error) {
    req.log.error({ error }, "GET /api/alerts error");
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.delete("/alerts/:id", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  if (auth.role !== "manager") { res.status(403).json({ error: "Forbidden" }); return; }
  try {
    await dbConnect();
    await Alert.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (error) {
    req.log.error({ error }, "DELETE /api/alerts/:id error");
    res.status(500).json({ error: "Failed to delete alert" });
  }
});

export default router;
