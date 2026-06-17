import mongoose, { Document, Model, Schema } from "mongoose";

export type AlertType = "info" | "warning" | "critical";

export interface IAlert extends Document {
  message: string;
  timestamp: Date;
  type: AlertType;
}

const AlertSchema = new Schema<IAlert>({
  message: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
  type: { type: String, required: true, enum: ["info", "warning", "critical"], default: "info" },
});

export const Alert: Model<IAlert> =
  mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema);
