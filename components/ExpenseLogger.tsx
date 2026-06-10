"use client";

import { useState } from "react";

const categories = ["Fuel", "Parts", "Meals", "Equipment", "Miscellaneous"];

export default function ExpenseLogger() {
  const [amount, setAmount] = useState(42);
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("Field inspection materials");
  const [entries, setEntries] = useState<Array<{ id: string; amount: number; category: string; status: string }>>([
    { id: "EXP-3081", amount: 74, category: "Fuel", status: "Pending" },
    { id: "EXP-4192", amount: 32, category: "Meals", status: "Approved" },
  ]);

  const addExpense = () => {
    const nextEntry = {
      id: `EXP-${Math.floor(Math.random() * 9000 + 1000)}`,
      amount,
      category,
      status: "Pending",
    };
    setEntries([nextEntry, ...entries]);
    setAmount(0);
    setDescription("");
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Expense logger</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Digital approval pipeline</h2>
          <p className="mt-1 text-sm text-slate-300">Capture transaction details and route pending costs directly from the technician dashboard.</p>
        </div>
        <button
          type="button"
          onClick={addExpense}
          className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
        >
          Log expense
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <label className="text-xs uppercase tracking-[0.24em] text-slate-400">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <label className="text-xs uppercase tracking-[0.24em] text-slate-400">Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-white outline-none"
          >
            {categories.map((item) => (
              <option key={item} value={item} className="bg-surface text-white">
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <label className="text-xs uppercase tracking-[0.24em] text-slate-400">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none transition focus:border-violet-400"
          placeholder="Describe the expense item"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Recent entries</p>
        <div className="grid gap-3">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-3xl border border-white/10 bg-surface p-4">
              <div>
                <p className="font-semibold text-white">{entry.category}</p>
                <p className="mt-1 text-sm text-slate-400">{entry.id} • ${entry.amount}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${entry.status === "Approved" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>
                {entry.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
