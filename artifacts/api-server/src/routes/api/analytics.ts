import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireManagerApi } from "../../lib/clerkAuth.js";
import { Task } from "../../models/Task.js";
import { Technician } from "../../models/Technician.js";
import { Expense } from "../../models/Expense.js";

const router = Router();

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

// Format a Date as a short day label (Mon, Tue, etc.)
function dayLabel(d: Date): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

router.get("/analytics", async (req: Request, res: Response) => {
  const auth = await requireManagerApi(req, res);
  if (!auth) return;
  try {
    await dbConnect();

    // --- Date ranges for last 7 days ---
    const now = new Date();
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(now.getDate() - 14);

    // --- Fetch data in parallel ---
    const [allTasks, technicians, expenses] = await Promise.all([
      Task.find({}).lean(),
      Technician.find({}).lean(),
      Expense.find({}).lean(),
    ]);

    const completed = allTasks.filter((t) => t.status === "completed");
    const total = allTasks.length;

    // --- KPI: Avg response time (createdAt → completedAt) ---
    const completionMinutes = completed
      .filter((t) => t.completedAt && t.createdAt)
      .map((t) => (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) / 60000);
    const avgCompletionMinutes = average(completionMinutes);

    // --- KPI: First-time fix rate (completed / total) ---
    const firstTimeFixRate = total > 0 ? Math.round((completed.length / total) * 100) : null;

    // --- KPI: Fleet utilization (active technicians / total technicians) ---
    const activeTechs = technicians.filter((t) => t.status === "on-route" || t.status === "on-site").length;
    const fleetUtilization = technicians.length > 0 ? Math.round((activeTechs / technicians.length) * 100) : null;

    // --- KPI: Routing uplift (this week vs prior week completions) ---
    const thisWeek = completed.filter((t) => t.completedAt && new Date(t.completedAt) >= sevenDaysAgo).length;
    const priorWeek = completed.filter((t) => t.completedAt && new Date(t.completedAt) >= fourteenDaysAgo && new Date(t.completedAt) < sevenDaysAgo).length;
    const routingUplift = priorWeek > 0 ? Math.round(((thisWeek - priorWeek) / priorWeek) * 100) : null;

    // --- KPI: Predicted CSAT (blend of fix rate and response time) ---
    const predictedCsat = firstTimeFixRate !== null && avgCompletionMinutes !== null
      ? Math.min(99, Math.round(firstTimeFixRate * 0.7 + Math.max(0, 100 - avgCompletionMinutes) * 0.3))
      : null;

    // --- Velocity: last 7 calendar days ---
    const dayBuckets: Array<{ date: Date; label: string; tasks: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0, 0, 0, 0);
      dayBuckets.push({ date: d, label: dayLabel(d), tasks: 0 });
    }
    completed.forEach((t) => {
      if (!t.completedAt) return;
      const cd = new Date(t.completedAt);
      for (const bucket of dayBuckets) {
        const nextDay = new Date(bucket.date); nextDay.setDate(bucket.date.getDate() + 1);
        if (cd >= bucket.date && cd < nextDay) { bucket.tasks++; break; }
      }
    });
    const velocity = dayBuckets.map((b) => ({ day: b.label, tasks: b.tasks }));

    // --- Delays: last 7 calendar days ---
    const delayBuckets: Array<{ date: Date; label: string; delays: number[] }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0, 0, 0, 0);
      delayBuckets.push({ date: d, label: dayLabel(d), delays: [] });
    }
    completed.forEach((t) => {
      if (!t.completedAt || !t.eta) return;
      const delayHours = (new Date(t.completedAt).getTime() - new Date(t.eta).getTime()) / 3600000;
      const cd = new Date(t.completedAt);
      for (const bucket of delayBuckets) {
        const nextDay = new Date(bucket.date); nextDay.setDate(bucket.date.getDate() + 1);
        if (cd >= bucket.date && cd < nextDay) { bucket.delays.push(Math.max(0, delayHours)); break; }
      }
    });
    const delays = delayBuckets.map((b) => {
      const avg = average(b.delays);
      return { day: b.label, delay: avg === null ? null : Number(avg.toFixed(1)) };
    });

    // --- Expense summary ---
    const pendingExpenses = expenses.filter((e) => e.status === "Pending");
    const approvedExpenses = expenses.filter((e) => e.status === "Approved");
    const totalPendingAmount = pendingExpenses.reduce((s, e) => s + e.amount, 0);
    const totalApprovedAmount = approvedExpenses.reduce((s, e) => s + e.amount, 0);

    res.json({
      hasEnoughData: total >= 3,
      predictedCsat,
      predictiveAccuracy: firstTimeFixRate,
      routingUplift,
      avgResponseMinutes: avgCompletionMinutes === null ? null : Math.round(avgCompletionMinutes),
      firstTimeFixRate,
      fleetUtilization,
      dailyThroughput: thisWeek,
      velocity: velocity.some((v) => v.tasks > 0) ? velocity : [],
      delays: delays.some((d) => d.delay !== null) ? delays : [],
      expenses: {
        pendingCount: pendingExpenses.length,
        pendingAmount: Number(totalPendingAmount.toFixed(2)),
        approvedCount: approvedExpenses.length,
        approvedAmount: Number(totalApprovedAmount.toFixed(2)),
        totalCount: expenses.length,
      },
    });
  } catch (error) {
    req.log.error({ error }, "GET /api/analytics error");
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
