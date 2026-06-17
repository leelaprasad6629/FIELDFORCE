import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import statsRouter from "./api/stats.js";
import techniciansRouter from "./api/technicians.js";
import alertsRouter from "./api/alerts.js";
import tasksRouter from "./api/tasks.js";
import requestsRouter from "./api/requests.js";
import analyticsRouter from "./api/analytics.js";
import expensesRouter from "./api/expenses.js";
import userRoleRouter from "./api/userRole.js";
import seedRouter from "./api/seed.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(statsRouter);
router.use(techniciansRouter);
router.use(alertsRouter);
router.use(tasksRouter);
router.use(requestsRouter);
router.use(analyticsRouter);
router.use(expensesRouter);
router.use(userRoleRouter);
router.use(seedRouter);

export default router;
