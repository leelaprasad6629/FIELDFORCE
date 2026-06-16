import mongoose, { Document, Model, Schema } from "mongoose";

export type TechnicianStatus = "active" | "idle" | "break";

export interface ITechnician extends Document {
  name: string;
  status: TechnicianStatus;
  currentTask?: string;
  location: string;
  role: string;
}

const TechnicianSchema = new Schema<ITechnician>({
  name: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["active", "idle", "break"],
    default: "idle",
  },
  currentTask: { type: String, default: null },
  location: { type: String, required: true },
  role: { type: String, required: true, default: "Field Technician" },
});

export const Technician: Model<ITechnician> =
  mongoose.models.Technician || mongoose.model<ITechnician>("Technician", TechnicianSchema);
