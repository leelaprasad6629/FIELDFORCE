import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireApiUser, requireManagerApi } from "@/lib/auth";
import { Task } from "@/models/Task";
import { Technician } from "@/models/Technician";

function serializeTask(doc: Record<string, unknown>) {
  return {
    _id: String(doc._id),
    id: String(doc.taskId),
    taskId: doc.taskId,
    title: doc.title,
    category: doc.category,
    assignedTo: doc.assignedTo ?? null,
    assignedTechnicianId: doc.assignedTechnicianId ?? null,
    serviceRequestId: doc.serviceRequestId ?? null,
    status: doc.status,
    zone: doc.zone,
    location: doc.location,
    priority: doc.priority,
    eta: doc.eta ?? null,
    createdAt: doc.createdAt,
    completedAt: doc.completedAt ?? null,
    checklist: doc.checklist ?? [],
  };
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine") === "true";

    let filter: Record<string, unknown> = {};
    if (mine && authResult.role === "technician") {
      const technician = await Technician.findOne({ clerkUserId: authResult.userId });
      if (!technician) {
        return NextResponse.json([]);
      }
      filter = {
        assignedTechnicianId: String(technician._id),
        status: { $ne: "completed" },
      };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(tasks.map((doc) => serializeTask(doc as Record<string, unknown>)));
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireManagerApi();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.zone || !body.location) {
      return NextResponse.json({ error: "title, zone, and location are required" }, { status: 400 });
    }

    const task = await Task.create({
      taskId: body.taskId ?? `TSK-${Date.now()}`,
      title: body.title,
      category: body.category ?? "General",
      assignedTo: body.assignedTo ?? null,
      assignedTechnicianId: body.assignedTechnicianId ?? null,
      serviceRequestId: body.serviceRequestId ?? null,
      status: body.status ?? "pending",
      zone: body.zone,
      location: body.location,
      priority: body.priority ?? "medium",
      eta: body.eta ? new Date(body.eta) : null,
      checklist: body.checklist ?? [],
    });

    return NextResponse.json(serializeTask(task.toObject() as Record<string, unknown>), { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
