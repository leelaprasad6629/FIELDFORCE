import { Router } from "express";
import type { Request, Response } from "express";
import { requireApiUser } from "../../lib/clerkAuth.js";

const router = Router();

const mockExpenses = [
  { id: "EXP-3081", amount: 74, category: "Fuel", description: "Fuel refill for van", status: "Pending", loggedByUserId: "demo-user", createdAt: new Date().toISOString() },
  { id: "EXP-4192", amount: 32, category: "Meals", description: "Lunch on site", status: "Approved", loggedByUserId: "demo-user", createdAt: new Date().toISOString() },
];

router.get("/expenses", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  res.json(mockExpenses);
});

router.post("/expenses", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  const { amount, category, description, status } = req.body;
  const expense = { id: `EXP-${Math.floor(Math.random() * 10000)}`, amount: Number(amount ?? 0), category: category ?? "Miscellaneous", description: description ?? "Expense logged.", status: status ?? "Pending", loggedByUserId: auth.userId, createdAt: new Date().toISOString() };
  mockExpenses.unshift(expense);
  res.status(201).json(expense);
});

router.patch("/expenses", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  const { id, status } = req.body;
  if (!id) { res.status(400).json({ error: "Missing expense ID" }); return; }
  const idx = mockExpenses.findIndex((e) => e.id === id);
  if (idx === -1) { res.status(404).json({ error: "Expense not found" }); return; }
  mockExpenses[idx].status = status ?? mockExpenses[idx].status;
  res.json(mockExpenses[idx]);
});

export default router;
