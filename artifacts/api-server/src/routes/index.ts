import { Router, type IRouter } from "express";
import healthRouter from "./health";
import technicianRouter from "./api/technicians";
import taskRouter from "./api/tasks";
import requestRouter from "./api/requests";
import alertRouter from "./api/alerts";
import expenseRouter from "./api/expenses";
import statsRouter from "./api/stats";
import analyticsRouter from "./api/analytics";
import userRoleRouter from "./api/userRole";

const router: IRouter = Router();

router.use(healthRouter);
router.use(technicianRouter);
router.use(taskRouter);
router.use(requestRouter);
router.use(alertRouter);
router.use(expenseRouter);
router.use(statsRouter);
router.use(analyticsRouter);
router.use(userRoleRouter);

export default router;
