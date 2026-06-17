import { Router } from "express";
import type { Request, Response } from "express";
import dbConnect from "../../models/mongodb.js";
import { requireApiUser } from "../../lib/clerkAuth.js";
import { Task } from "../../models/Task.js";

const router = Router();
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

router.get("/analytics", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const tasks = await Task.find({}).lean();
    const completed = tasks.filter((t) => t.status === "completed");
    const total = tasks.length;
    const completionMinutes = completed.filter((t) => t.completedAt && t.createdAt).map((t) => (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) / 60000);
    const avgCompletionMinutes = average(completionMinutes);
    const firstTimeFixRate = total > 0 ? Math.round((completed.length / total) * 100) : null;
    const velocityMap = new Map<string, number>();
    DAY_LABELS.forEach((d) => velocityMap.set(d, 0));
    completed.forEach((t) => { if (!t.completedAt) return; const d = DAY_LABELS[new Date(t.completedAt).getDay()]; velocityMap.set(d, (velocityMap.get(d) ?? 0) + 1); });
    const velocity = DAY_LABELS.map((d) => ({ day: d, tasks: velocityMap.get(d) ?? 0 }));
    const delayMap = new Map<string, number[]>();
    DAY_LABELS.forEach((d) => delayMap.set(d, []));
    completed.forEach((t) => { if (!t.completedAt || !t.eta) return; const delayHours = (new Date(t.completedAt).getTime() - new Date(t.eta).getTime()) / 3600000; const d = DAY_LABELS[new Date(t.completedAt).getDay()]; delayMap.get(d)?.push(Math.max(0, delayHours)); });
    const delays = DAY_LABELS.map((d) => { const vals = delayMap.get(d) ?? []; const avg = average(vals); return { day: d, delay: avg === null ? null : Number(avg.toFixed(1)) }; });
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);
    const thisWeek = completed.filter((t) => t.completedAt && new Date(t.completedAt) >= weekAgo).length;
    const priorWeek = completed.filter((t) => t.completedAt && new Date(t.completedAt) >= twoWeeksAgo && new Date(t.completedAt) < weekAgo).length;
    const routingUplift = priorWeek > 0 ? Math.round(((thisWeek - priorWeek) / priorWeek) * 100) : null;
    const predictedCsat = firstTimeFixRate !== null && avgCompletionMinutes !== null ? Math.min(99, Math.round(firstTimeFixRate * 0.7 + Math.max(0, 100 - avgCompletionMinutes) * 0.3)) : null;
    res.json({
      hasEnoughData: total >= 3, predictedCsat, predictiveAccuracy: firstTimeFixRate, routingUplift,
      avgResponseMinutes: avgCompletionMinutes === null ? null : Math.round(avgCompletionMinutes),
      firstTimeFixRate, fleetUtilization: total > 0 ? Math.round((completed.length / total) * 100) : null,
      dailyThroughput: thisWeek, velocity: velocity.some((v) => v.tasks > 0) ? velocity : [],
      delays: delays.some((d) => d.delay !== null) ? delays : [],
    });
  } catch (error) {
    req.log.error({ error }, "GET /api/analytics error");
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
