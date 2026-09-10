import { Router, type IRouter } from "express";
import dbConnect, { getDatabaseStatus } from "../models/mongodb.js";

const router: IRouter = Router();

router.get(["/health/db", "/healthz/db"], async (_req, res) => {
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
});

router.get(["/health", "/healthz"], (_req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.readyState === 1 || dbStatus.configured;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

export default router;
