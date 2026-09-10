import { Router, type IRouter } from "express";
import { getDatabaseStatus } from "../models/mongodb.js";

const router: IRouter = Router();

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
