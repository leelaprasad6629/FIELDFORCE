import { Router, type IRouter } from "express";
import dbConnect, { getDatabaseStatus } from "../models/mongodb.js";

const router: IRouter = Router();

router.get(["/health", "/healthz"], async (req, res) => {
  if (req.query.checkDb === "1" || req.query.checkDb === "true") {
    try {
      await dbConnect();
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: getDatabaseStatus(),
      });
    } catch (err: any) {
      res.status(503).json({
        status: "database_connection_failed",
        timestamp: new Date().toISOString(),
        database: getDatabaseStatus(),
        error: err?.message || String(err),
        name: err?.name,
        code: err?.code,
      });
    }
    return;
  }

  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.readyState === 1 || dbStatus.configured;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

export default router;
