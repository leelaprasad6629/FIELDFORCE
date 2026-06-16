import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Task } from "@/models/Task";
import { Technician } from "@/models/Technician";

export async function GET() {
  try {
    await dbConnect();

    const [totalTasks, inProgressTasks, activeTechnicians, completedTasks] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: "in-progress" }),
      Technician.countDocuments({ status: "active" }),
      Task.countDocuments({ status: "completed" }),
    ]);

    const serviceRequests = totalTasks;
    const taskOverview = inProgressTasks;
    const dispatchReadiness =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      serviceRequests,
      activeTechnicians,
      taskOverview,
      dispatchReadiness,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
