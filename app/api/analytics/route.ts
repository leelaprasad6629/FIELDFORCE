import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireApiUser } from "@/lib/auth";
import { Task } from "@/models/Task";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const tasks = await Task.find({}).lean();

    const completed = tasks.filter((task) => task.status === "completed");
    const total = tasks.length;

    const completionMinutes = completed
      .filter((task) => task.completedAt && task.createdAt)
      .map((task) => (new Date(task.completedAt!).getTime() - new Date(task.createdAt).getTime()) / 60000);

    const avgCompletionMinutes = average(completionMinutes);
    const firstTimeFixRate =
      total > 0 ? Math.round((completed.length / total) * 100) : null;

    const velocityMap = new Map<string, number>();
    DAY_LABELS.forEach((day) => velocityMap.set(day, 0));

    completed.forEach((task) => {
      if (!task.completedAt) return;
      const day = DAY_LABELS[new Date(task.completedAt).getDay()];
      velocityMap.set(day, (velocityMap.get(day) ?? 0) + 1);
    });

    const velocity = DAY_LABELS.map((day) => ({
      day,
      tasks: velocityMap.get(day) ?? 0,
    }));

    const delayMap = new Map<string, number[]>();
    DAY_LABELS.forEach((day) => delayMap.set(day, []));

    completed.forEach((task) => {
      if (!task.completedAt || !task.eta) return;
      const delayHours =
        (new Date(task.completedAt).getTime() - new Date(task.eta).getTime()) / 3600000;
      const day = DAY_LABELS[new Date(task.completedAt).getDay()];
      delayMap.get(day)?.push(Math.max(0, delayHours));
    });

    const delays = DAY_LABELS.map((day) => {
      const values = delayMap.get(day) ?? [];
      const avg = average(values);
      return {
        day,
        delay: avg === null ? null : Number(avg.toFixed(1)),
      };
    });

    const hasDelayData = delays.some((entry) => entry.delay !== null);
    const hasVelocityData = velocity.some((entry) => entry.tasks > 0);
    const predictedCsat =
      firstTimeFixRate !== null && avgCompletionMinutes !== null
        ? Math.min(99, Math.round(firstTimeFixRate * 0.7 + Math.max(0, 100 - avgCompletionMinutes) * 0.3))
        : null;

    const thisWeekCompleted = completed.filter((task) => {
      if (!task.completedAt) return false;
      const completedAt = new Date(task.completedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completedAt >= weekAgo;
    }).length;

    const priorWeekCompleted = completed.filter((task) => {
      if (!task.completedAt) return false;
      const completedAt = new Date(task.completedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return completedAt >= twoWeeksAgo && completedAt < weekAgo;
    }).length;

    const routingUplift =
      priorWeekCompleted > 0
        ? Math.round(((thisWeekCompleted - priorWeekCompleted) / priorWeekCompleted) * 100)
        : null;

    return NextResponse.json({
      hasEnoughData: total >= 3,
      predictedCsat,
      predictiveAccuracy: firstTimeFixRate,
      routingUplift,
      avgResponseMinutes: avgCompletionMinutes === null ? null : Math.round(avgCompletionMinutes),
      firstTimeFixRate,
      fleetUtilization:
        total > 0 ? Math.round((completed.filter((task) => task.status === "completed").length / total) * 100) : null,
      dailyThroughput: thisWeekCompleted,
      velocity: hasVelocityData ? velocity : [],
      delays: hasDelayData ? delays : [],
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
