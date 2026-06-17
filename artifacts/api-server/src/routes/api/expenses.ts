import { Router } from "express";
import type { Request, Response } from "express";
import { requireApiUser, requireManagerApi } from "../../lib/clerkAuth.js";
import dbConnect from "../../models/mongodb.js";
import { Expense } from "../../models/Expense.js";

const router = Router();

router.get("/expenses", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const filter = auth.role === "manager" ? {} : { loggedByUserId: auth.userId };
    const expenses = await Expense.find(filter).sort({ createdAt: -1 }).lean();
    res.json(expenses);
  } catch (error) {
    req.log.error({ error }, "GET /api/expenses error");
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

router.post("/expenses", async (req: Request, res: Response) => {
  const auth = await requireApiUser(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const { amount, category, description } = req.body;
    if (!amount || isNaN(Number(amount))) { res.status(400).json({ error: "Valid amount is required" }); return; }
    const expense = await Expense.create({
      expenseId: `EXP-${Date.now()}`,
      amount: Number(amount),
      category: category ?? "Miscellaneous",
      description: description ?? "",
      status: "Pending",
      loggedByUserId: auth.userId,
    });
    res.status(201).json(expense);
  } catch (error) {
    req.log.error({ error }, "POST /api/expenses error");
    res.status(500).json({ error: "Failed to create expense" });
  }
});

router.patch("/expenses/:id", async (req: Request, res: Response) => {
  const auth = await requireManagerApi(req, res);
  if (!auth) return;
  try {
    await dbConnect();
    const expense = await Expense.findById(req.params.id);
    if (!expense) { res.status(404).json({ error: "Expense not found" }); return; }
    const { status } = req.body;
    if (status) expense.status = status;
    await expense.save();
    res.json(expense);
  } catch (error) {
    req.log.error({ error }, "PATCH /api/expenses/:id error");
    res.status(500).json({ error: "Failed to update expense" });
  }
});

export default router;
