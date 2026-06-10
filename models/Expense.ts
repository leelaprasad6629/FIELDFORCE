import mongoose, { Document, Model, Schema } from "mongoose";

export type ExpenseStatus = "Pending" | "Approved";

export interface IExpense extends Document {
  amount: number;
  category: string;
  description: string;
  status: ExpenseStatus;
  loggedByUserId: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Approved"],
    default: "Pending",
  },
  loggedByUserId: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
