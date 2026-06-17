import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireApiUser } from "@/lib/auth";
import { Task } from "@/models/Task";
import { Technician } from "@/models/Technician";
import { ServiceRequest } from "@/models/ServiceRequest";

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();

    const [
      openRequests,
      activeTechnicians,
      inProgressTasks,
      totalTasks,
      completedTasks,
    ] = await Promise.all([
      ServiceRequest.countDocuments({ status: { $in: ["Pending", "Assigned", "In-Progress"] } }),
      Technician.countDocuments({ status: { $in: ["on-route", "on-site"] } }),
      Task.countDocuments({ status: "in-progress" }),
      Task.countDocuments(),
      Task.countDocuments({ status: "completed" }),
    ]);

    const dispatchReadiness =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      serviceRequests: openRequests,
      activeTechnicians,
      taskOverview: inProgressTasks,
      dispatchReadiness,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
