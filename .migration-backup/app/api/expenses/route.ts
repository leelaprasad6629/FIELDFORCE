import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";

const mockExpenses = [
  { id: "EXP-3081", amount: 74, category: "Fuel", description: "Fuel refill for van", status: "Pending", loggedByUserId: "demo-user", createdAt: new Date().toISOString() },
  { id: "EXP-4192", amount: 32, category: "Meals", description: "Lunch on site", status: "Approved", loggedByUserId: "demo-user", createdAt: new Date().toISOString() },
];

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;
  return NextResponse.json(mockExpenses);
}

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  const payload = await req.json();
  const expense = {
    id: `EXP-${Math.floor(Math.random() * 10000)}`,
    amount: Number(payload.amount ?? 0),
    category: payload.category ?? "Miscellaneous",
    description: payload.description ?? "Expense logged from technician app.",
    status: payload.status ?? "Pending",
    loggedByUserId: authResult.userId,
    createdAt: new Date().toISOString(),
  };

  mockExpenses.unshift(expense);
  return NextResponse.json(expense, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  const payload = await req.json();
  if (!payload.id) {
    return NextResponse.json({ error: "Missing expense ID" }, { status: 400 });
  }

  const expenseIndex = mockExpenses.findIndex((item) => item.id === payload.id);
  if (expenseIndex === -1) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  mockExpenses[expenseIndex].status = payload.status ?? mockExpenses[expenseIndex].status;
  return NextResponse.json(mockExpenses[expenseIndex]);
}
