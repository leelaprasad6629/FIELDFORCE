import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExpense extends Document {
  expenseId: string;
  amount: number;
  category: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  loggedByUserId: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  expenseId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, default: 0 },
  category: { type: String, required: true, default: "Miscellaneous" },
  description: { type: String, required: true, default: "" },
  status: { type: String, required: true, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  loggedByUserId: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
