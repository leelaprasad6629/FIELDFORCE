import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Loader2, DollarSign, Plus, X, RefreshCw, MapPin, Wifi, WifiOff } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface ChecklistItem { label: string; done: boolean; }
interface Task {
  _id: string; taskId: string; title: string; status: string; priority: string;
  zone: string; location: string; eta: string | null; checklist: ChecklistItem[];
  category: string;
}
interface Expense { _id?: string; id?: string; amount: number; category: string; description: string; status: string; }
interface TechProfile { _id: string; name: string; status: string; location: string; currentTask: string | null; }

const priorityColors: Record<string, string> = {
  critical: "text-rose-400 border-rose-500/40 bg-rose-500/10",
  high: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  medium: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  low: "text-slate-400 border-slate-500/40 bg-slate-500/10",
};

const statusBadge: Record<string, string> = {
  "idle": "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "on-route": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "on-site": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "break": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const EXP_CATEGORIES = ["Fuel", "Meals", "Parking", "Parts", "Tools", "Accommodation", "Miscellaneous"];

export default function TechnicianView() {
  const { fetchApi } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<TechProfile | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ amount: "", category: "Fuel", description: "" });
  const [savingExp, setSavingExp] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const [t, e, me] = await Promise.all([
        fetchApi<Task[]>("/tasks?mine=true"),
        fetchApi<Expense[]>("/expenses"),
        fetchApi<{ technician: TechProfile | null }>("/user/me"),
      ]);
      setTasks(t);
      setExpenses(e);
      setProfile(me.technician);
      setLastRefresh(new Date());
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

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

  async function updateStatus(status: string) {
    setUpdatingStatus(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 }));
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch { /* geolocation denied or unavailable */ }
      }
      await fetchApi("/user/me/status", { method: "PATCH", body: JSON.stringify({ status, lat, lng }) });
      await load();
    } catch { /* noop */ }
    finally { setUpdatingStatus(false); }
  }

  async function logExpense() {
    setSavingExp(true);
    try {
      await fetchApi("/expenses", { method: "POST", body: JSON.stringify({ amount: Number(expForm.amount), category: expForm.category, description: expForm.description }) });
      setShowExpForm(false);
      setExpForm({ amount: "", category: "Fuel", description: "" });
      const e = await fetchApi<Expense[]>("/expenses");
      setExpenses(e);
    } catch { /* noop */ }
    finally { setSavingExp(false); }
  }

  const currentStatus = profile?.status ?? "idle";

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            {online ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
            Auto-refreshes every 8s · last updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs hover:text-white hover:bg-white/5 transition">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Profile + Status Panel */}
      {profile ? (
        <div className="glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">{profile.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-slate-400 text-sm">{profile.currentTask ?? profile.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs px-2.5 py-1 rounded-full border capitalize", statusBadge[currentStatus] ?? statusBadge.idle)}>
              {currentStatus.replace("-", " ")}
            </span>
            {currentStatus === "on-route" && (
              <button onClick={() => updateStatus("on-site")} disabled={updatingStatus}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition disabled:opacity-40 flex items-center gap-1.5">
                {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : "Check In On-Site"}
              </button>
            )}
            {(currentStatus === "on-site" || currentStatus === "idle") && tasks.length === 0 && (
              <button onClick={() => updateStatus(currentStatus === "idle" ? "break" : "idle")} disabled={updatingStatus}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-500/15 border border-slate-500/30 text-slate-400 hover:bg-slate-500/25 transition disabled:opacity-40 flex items-center gap-1.5">
                {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : currentStatus === "idle" ? "Take a Break" : "Back to Idle"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass p-4 border border-amber-500/30 bg-amber-500/8">
          <p className="text-amber-400 text-sm font-medium">Profile not linked</p>
          <p className="text-slate-400 text-xs mt-1">
            Your technician profile hasn't been created yet. If your manager added you by email, make sure you signed up with the same email address. Otherwise, ask your manager to add your profile.
          </p>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="glass p-12 text-center text-slate-500">
          <p className="text-base mb-2">No tasks assigned yet.</p>
          <p className="text-sm text-slate-600">Your manager will dispatch one using Smart Assign. This page refreshes automatically.</p>
        </div>
      )}

      {tasks.map((task) => {
        const done = task.checklist.filter((c) => c.done).length;
        const total = task.checklist.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const allDone = total === 0 || pct === 100;
        return (
          <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-white font-semibold">{task.title}</h2>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", priorityColors[task.priority] ?? priorityColors.medium)}>{task.priority}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400">{task.category}</span>
                </div>
                <p className="text-slate-500 text-sm">{task.location} · {task.zone}</p>
                {task.eta && <p className="text-slate-500 text-xs mt-0.5">ETA: {new Date(task.eta).toLocaleString()}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-white">{pct}%</p>
                <p className="text-xs text-slate-500">{done}/{total} done</p>
              </div>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>

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

            {!allDone && (
              <p className="text-slate-500 text-xs text-center">Complete all checklist items to mark as done</p>
            )}

            <button onClick={() => completeTask(task)} disabled={completing === task._id || !allDone}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2 transition hover:opacity-90">
              {completing === task._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Complete"}
            </button>
          </motion.div>
        );
      })}

      {/* Expense Section */}
      <div className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Expenses</h2>
          <button onClick={() => setShowExpForm(!showExpForm)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition">
            <Plus className="w-3 h-3" /> Log Expense
          </button>
        </div>

        <AnimatePresence>
          {showExpForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-xl bg-white/4 border border-white/10 space-y-3 overflow-hidden">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Amount ($)</label>
                  <input type="number" value={expForm.amount} onChange={(e) => setExpForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Category</label>
                  <select value={expForm.category} onChange={(e) => setExpForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#0E1521] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                    {EXP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Description</label>
                <input value={expForm.description} onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief note..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowExpForm(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 flex items-center justify-center gap-1">
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button onClick={logExpense} disabled={savingExp || !expForm.amount}
                  className="flex-1 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm disabled:opacity-40 flex items-center justify-center gap-1">
                  {savingExp ? <Loader2 className="w-3 h-3 animate-spin" /> : "Submit"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {expenses.length === 0 && <p className="text-slate-600 text-sm text-center py-4">No expenses logged yet.</p>}
          {expenses.map((e) => (
            <div key={e._id ?? e.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/4 border border-white/6">
              <div>
                <p className="text-white text-sm font-medium">${e.amount.toFixed(2)} · {e.category}</p>
                {e.description && <p className="text-slate-500 text-xs">{e.description}</p>}
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border",
                e.status === "Approved" ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" :
                e.status === "Rejected" ? "text-rose-400 bg-rose-500/15 border-rose-500/30" :
                "text-amber-400 bg-amber-500/15 border-amber-500/30")}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
