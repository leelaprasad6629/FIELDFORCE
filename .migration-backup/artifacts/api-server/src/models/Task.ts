import mongoose, { Document, Model, Schema } from "mongoose";

export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface ITask extends Document {
  taskId: string;
  title: string;
  category: string;
  assignedTo?: string | null;
  assignedTechnicianId?: string | null;
  serviceRequestId?: string | null;
  status: TaskStatus;
  zone: string;
  location: string;
  priority: TaskPriority;
  eta?: Date | null;
  createdAt: Date;
  completedAt?: Date | null;
  checklist: ChecklistItem[];
}

const ChecklistItemSchema = new Schema<ChecklistItem>(
  { label: { type: String, required: true }, done: { type: Boolean, default: false } },
  { _id: false }
);

const TaskSchema = new Schema<ITask>({
  taskId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true, default: "General" },
  assignedTo: { type: String, default: null },
  assignedTechnicianId: { type: String, default: null },
  serviceRequestId: { type: String, default: null },
  status: { type: String, required: true, enum: ["pending", "in-progress", "completed"], default: "pending" },
  zone: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, required: true, enum: ["low", "medium", "high", "critical"], default: "medium" },
  eta: { type: Date, default: null },
  createdAt: { type: Date, default: () => new Date() },
  completedAt: { type: Date, default: null },
  checklist: { type: [ChecklistItemSchema], default: [] },
});

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
