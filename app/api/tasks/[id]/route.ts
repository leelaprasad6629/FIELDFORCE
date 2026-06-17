import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireApiUser } from "@/lib/auth";
import { Task } from "@/models/Task";
import { Technician } from "@/models/Technician";
import { ServiceRequest } from "@/models/ServiceRequest";

function serializeTask(doc: Record<string, unknown>) {
  return {
    _id: String(doc._id),
    id: String(doc.taskId),
    taskId: doc.taskId,
    title: doc.title,
    category: doc.category,
    assignedTo: doc.assignedTo ?? null,
    status: doc.status,
    location: doc.location,
    priority: doc.priority,
    eta: doc.eta ?? null,
    checklist: doc.checklist ?? [],
    completedAt: doc.completedAt ?? null,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();
    const body = await req.json();
    const task = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (authResult.role === "technician") {
      const technician = await Technician.findOne({ clerkUserId: authResult.userId });
      if (!technician || String(task.assignedTechnicianId) !== String(technician._id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (body.checklist) {
      task.checklist = body.checklist;
    }

    if (body.action === "complete") {
      task.status = "completed";
      task.completedAt = new Date();

      if (task.serviceRequestId) {
        await ServiceRequest.findByIdAndUpdate(task.serviceRequestId, {
          status: "Completed",
          completedAt: new Date(),
        });
      }

      if (task.assignedTechnicianId) {
        await Technician.findByIdAndUpdate(task.assignedTechnicianId, {
          status: "idle",
          currentTask: null,
        });
      }
    }

    await task.save();
    return NextResponse.json(serializeTask(task.toObject() as Record<string, unknown>));
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
