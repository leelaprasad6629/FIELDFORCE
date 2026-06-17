import mongoose, { Document, Model, Schema } from "mongoose";

export type ServiceRequestStatus = "Pending" | "Assigned" | "In-Progress" | "Completed";

export interface IServiceRequest extends Document {
  requestId: string;
  title: string;
  description: string;
  customerName: string;
  category: string;
  status: ServiceRequestStatus;
  priority: "Low" | "Medium" | "High" | "Critical";
  geofenceLocation: { lat: number; lng: number; radiusKm: number };
  location: string;
  assignedTechnicianId?: string | null;
  assignedTechnicianName?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
  eta?: Date | null;
}

const ServiceRequestSchema = new Schema<IServiceRequest>({
  requestId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  customerName: { type: String, required: true },
  category: { type: String, required: true, default: "General" },
  status: { type: String, required: true, enum: ["Pending", "Assigned", "In-Progress", "Completed"], default: "Pending" },
  priority: { type: String, required: true, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  geofenceLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radiusKm: { type: Number, required: true, default: 5 },
  },
  location: { type: String, required: true },
  assignedTechnicianId: { type: String, default: null },
  assignedTechnicianName: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
  completedAt: { type: Date, default: null },
  eta: { type: Date, default: null },
});

export const ServiceRequest: Model<IServiceRequest> =
  mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);
