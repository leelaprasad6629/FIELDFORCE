import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Loader2, DollarSign, Plus, X } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface ChecklistItem { label: string; done: boolean; }
interface Task {
  _id: string; taskId: string; title: string; status: string; priority: string;
  zone: string; location: string; eta: string | null; checklist: ChecklistItem[];
}
interface Expense { id: string; amount: number; category: string; description: string; status: string; }

const priorityColors: Record<string, string> = {
  critical: "text-rose-400 border-rose-500/40 bg-rose-500/10",
  high: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  medium: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  low: "text-slate-400 border-slate-500/40 bg-slate-500/10",
};

export default function TechnicianView() {
  const { fetchApi } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ amount: "", category: "Fuel", description: "" });
  const [savingExp, setSavingExp] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, e] = await Promise.all([fetchApi<Task[]>("/tasks?mine=true"), fetchApi<Expense[]>("/expenses")]);
      setTasks(t); setExpenses(e);
    } catch { /* noop */ }
  }, [fetchApi]);

  useEffect(() => { load(); }, [load]);

  async function toggleCheck(task: Task, idx: number) {
    const checklist = task.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c);
    try {
      const updated = await fetchApi<Task>(`/tasks/${task._id}`, { method: "PATCH", body: JSON.stringify({ checklist }) });
      setTasks((prev) => prev.map((t) => t._id === task._id ? updated : t));
    } catch { /* noop */ }
  }

  async function completeTask(task: Task) {
    setCompleting(task._id);
    try {
      await fetchApi(`/tasks/${task._id}`, { method: "PATCH", body: JSON.stringify({ action: "complete" }) });
      await load();
    } catch { /* noop */ }
    finally { setCompleting(null); }
  }

  async function logExpense() {
    setSavingExp(true);
    try {
      await fetchApi("/expenses", { method: "POST", body: JSON.stringify({ amount: Number(expForm.amount), category: expForm.category, description: expForm.description }) });
      setShowExpForm(false); setExpForm({ amount: "", category: "Fuel", description: "" });
      const e = await fetchApi<Expense[]>("/expenses");
      setExpenses(e);
    } catch { /* noop */ }
    finally { setSavingExp(false); }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <p className="text-slate-400 text-sm mt-1">Your active assignments</p>
      </div>

      {tasks.length === 0 && (
        <div className="glass p-12 text-center text-slate-500">No tasks assigned yet. Your manager will dispatch one shortly.</div>
      )}

      {tasks.map((task) => {
        const done = task.checklist.filter((c) => c.done).length;
        const total = task.checklist.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-white font-semibold">{task.title}</h2>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", priorityColors[task.priority] ?? priorityColors.medium)}>{task.priority}</span>
                </div>
                <p className="text-slate-500 text-sm">{task.location} · {task.zone}</p>
                {task.eta && <p className="text-slate-500 text-xs mt-0.5">ETA: {new Date(task.eta).toLocaleTimeString()}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-white">{pct}%</p>
                <p className="text-xs text-slate-500">{done}/{total} done</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              {task.checklist.map((item, idx) => (
                <button key={idx} onClick={() => toggleCheck(task, idx)}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all",
                    item.done ? "bg-emerald-500/10 border-emerald-500/20 opacity-60" : "bg-white/4 border-white/8 hover:bg-white/7")}>
                  {item.done ? <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                  <span className={cn("text-sm", item.done ? "text-slate-500 line-through" : "text-slate-300")}>{item.label}</span>
                </button>
              ))}
            </div>

            <button onClick={() => completeTask(task)} disabled={completing === task._id || pct < 100}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2 transition hover:opacity-90">
              {completing === task._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Complete"}
            </button>
          </motion.div>
        );
      })}

      {/* Expense section */}
      <div className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Expenses</h2>
          <button onClick={() => setShowExpForm(!showExpForm)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition">
            <Plus className="w-3 h-3" /> Log Expense
          </button>
        </div>

        {showExpForm && (
          <div className="mb-4 p-4 rounded-xl bg-white/4 border border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Amount ($)</label>
                <input type="number" value={expForm.amount} onChange={(e) => setExpForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Category</label>
                <select value={expForm.category} onChange={(e) => setExpForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                  {["Fuel", "Meals", "Parking", "Parts", "Tools", "Accommodation", "Miscellaneous"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Description</label>
              <input value={expForm.description} onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief note..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowExpForm(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5"><X className="w-3 h-3 inline mr-1" />Cancel</button>
              <button onClick={logExpense} disabled={savingExp || !expForm.amount}
                className="flex-1 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm disabled:opacity-40 flex items-center justify-center gap-1">
                {savingExp ? <Loader2 className="w-3 h-3 animate-spin" /> : "Submit"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/4 border border-white/6">
              <div>
                <p className="text-white text-sm font-medium">${e.amount} · {e.category}</p>
                <p className="text-slate-500 text-xs">{e.description}</p>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border",
                e.status === "Approved" ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" : "text-amber-400 bg-amber-500/15 border-amber-500/30")}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
