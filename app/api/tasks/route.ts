import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Task } from "@/models/Task";

export async function GET() {
  try {
    await dbConnect();
    const tasks = await Task.find({}).sort({ taskId: 1 }).lean();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const task = await Task.create({
      taskId: body.taskId ?? `TSK-${Date.now()}`,
      title: body.title,
      assignedTo: body.assignedTo ?? null,
      status: body.status ?? "pending",
      zone: body.zone,
      priority: body.priority ?? "medium",
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
