import mongoose, { Document, Model, Schema } from "mongoose";

export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface ITask extends Document {
  taskId: string;
  title: string;
  assignedTo?: string;
  status: TaskStatus;
  zone: string;
  priority: TaskPriority;
}

const TaskSchema = new Schema<ITask>({
  taskId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  assignedTo: { type: String, default: null },
  status: {
    type: String,
    required: true,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  zone: { type: String, required: true },
  priority: {
    type: String,
    required: true,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
});

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
