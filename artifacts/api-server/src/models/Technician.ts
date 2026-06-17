import mongoose, { Document, Model, Schema } from "mongoose";

export type TechnicianStatus = "on-route" | "on-site" | "idle" | "break";

export interface ITechnician extends Document {
  name: string;
  status: TechnicianStatus;
  currentTask?: string | null;
  location: string;
  lat: number;
  lng: number;
  clerkUserId?: string | null;
}

const TechnicianSchema = new Schema<ITechnician>({
  name: { type: String, required: true },
  status: { type: String, required: true, enum: ["on-route", "on-site", "idle", "break"], default: "idle" },
  currentTask: { type: String, default: null },
  location: { type: String, required: true },
  lat: { type: Number, required: true, default: 40.7128 },
  lng: { type: Number, required: true, default: -74.006 },
  clerkUserId: { type: String, default: null, index: true },
});

export const Technician: Model<ITechnician> =
  mongoose.models.Technician || mongoose.model<ITechnician>("Technician", TechnicianSchema);
