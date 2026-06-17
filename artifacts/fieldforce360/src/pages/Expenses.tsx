import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, Check, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  status: string;
  loggedByUserId: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Pending: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  Approved: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  Rejected: "text-rose-400 bg-rose-500/15 border-rose-500/30",
};

export default function Expenses() {
  const { fetchApi } = useApi();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [approving, setApproving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setExpenses(await fetchApi<Expense[]>("/expenses"));
    } catch { /* noop */ }
  }, [fetchApi]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  async function handleAction(id: string, status: "Approved" | "Rejected") {
    setApproving(id);
    try {
      await fetchApi(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setExpenses((prev) => prev.map((e) => e._id === id ? { ...e, status } : e));
    } catch { /* noop */ }
    finally { setApproving(null); }
  }

  const FILTERS = ["All", "Pending", "Approved", "Rejected"] as const;
  const filtered = filter === "All" ? expenses : expenses.filter((e) => e.status === filter);
  const pendingCount = expenses.filter((e) => e.status === "Pending").length;
  const totalApproved = expenses.filter((e) => e.status === "Approved").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Expense Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review and approve technician expenses</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/5 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: pendingCount, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Total Approved", value: `$${totalApproved.toFixed(2)}`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Submitted", value: expenses.length, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const count = f === "All" ? expenses.length : expenses.filter((e) => e.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition border",
                filter === f ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "text-slate-400 border-white/10 hover:text-white hover:bg-white/5")}>
              {f} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass p-12 text-center">
            <p className="text-slate-500 text-sm">{filter === "All" ? "No expenses submitted yet." : `No ${filter.toLowerCase()} expenses.`}</p>
          </div>
        )}
        {filtered.map((e) => (
          <motion.div key={e._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-white font-semibold">${e.amount.toFixed(2)}</p>
                <span className="text-slate-400 text-sm">·</span>
                <p className="text-slate-300 text-sm">{e.category}</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", statusColors[e.status] ?? statusColors.Pending)}>
                  {e.status}
                </span>
              </div>
              {e.description && <p className="text-slate-500 text-sm">{e.description}</p>}
              <p className="text-slate-600 text-xs mt-1">
                Submitted {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>
            {e.status === "Pending" && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleAction(e._id, "Approved")} disabled={approving === e._id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/25 transition disabled:opacity-40">
                  {approving === e._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button onClick={() => handleAction(e._id, "Rejected")} disabled={approving === e._id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm hover:bg-rose-500/25 transition disabled:opacity-40">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
