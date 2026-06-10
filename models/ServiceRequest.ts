import mongoose, { Document, Model, Schema } from "mongoose";

export type ServiceRequestStatus = "Pending" | "Assigned" | "In-Progress" | "Completed";

export interface IServiceRequest extends Document {
  title: string;
  description: string;
  customerName: string;
  status: ServiceRequestStatus;
  priority: "Low" | "Medium" | "High" | "Critical";
  geofenceLocation: { lat: number; lng: number; radiusKm: number };
  assignedTechnicianId?: string;
  createdAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  customerName: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Assigned", "In-Progress", "Completed"],
    default: "Pending",
  },
  priority: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },
  geofenceLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radiusKm: { type: Number, required: true, default: 5 },
  },
  assignedTechnicianId: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

export const ServiceRequest: Model<IServiceRequest> =
  mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);
