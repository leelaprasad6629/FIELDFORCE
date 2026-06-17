import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Plus, Zap, RefreshCw, X, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface ServiceRequest {
  _id: string; id: string; title: string; description: string; customerName: string; category: string;
  priority: string; status: string; location: string; assignedTechnicianName: string | null; eta: string | null; createdAt: string;
}

const priorityColors: Record<string, string> = {
  Critical: "text-rose-400 bg-rose-500/15 border-rose-500/30",
  High: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  Medium: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
  Low: "text-slate-400 bg-slate-500/15 border-slate-500/30",
};

const statusColors: Record<string, string> = {
  Pending: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  Assigned: "text-indigo-400 bg-indigo-500/15 border-indigo-500/30",
  "In-Progress": "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
  Completed: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
};

export default function Requests() {
  const { fetchApi } = useApi();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", customerName: "", category: "General", priority: "Medium", location: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setRequests(await fetchApi<ServiceRequest[]>("/requests")); } catch { /* noop */ }
  }, [fetchApi]);

  useEffect(() => { load(); }, [load]);

  async function assign(id: string) {
    setAssigning(id); setError(null);
    try {
      await fetchApi(`/requests/${id}/assign`, { method: "POST" });
      await load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Assignment failed"); }
    finally { setAssigning(null); }
  }

  async function create() {
    setCreating(true); setError(null);
    try {
      await fetchApi("/requests", { method: "POST", body: JSON.stringify(form) });
      setShowForm(false);
      setForm({ title: "", description: "", customerName: "", category: "General", priority: "Medium", location: "" });
      await load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Create failed"); }
    finally { setCreating(false); }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ClipboardList className="w-5 h-5 text-cyan-400" /> Service Requests</h1>
          <p className="text-slate-400 text-sm mt-1">{requests.length} total — manage and dispatch</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/5 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/25 transition">
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      {error && (
        <div className="glass border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Request list */}
      <div className="space-y-3">
        {requests.length === 0 && (
          <div className="glass p-12 text-center text-slate-500">No service requests yet. Create one or seed demo data.</div>
        )}
        {requests.map((r) => (
          <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass glass-hover p-5 group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-white font-semibold">{r.title}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", priorityColors[r.priority] ?? priorityColors.Medium)}>{r.priority}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", statusColors[r.status] ?? statusColors.Pending)}>{r.status}</span>
                </div>
                <p className="text-slate-400 text-sm mb-2">{r.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Customer: <span className="text-slate-400">{r.customerName}</span></span>
                  <span>Location: <span className="text-slate-400">{r.location}</span></span>
                  {r.assignedTechnicianName && <span>Assigned: <span className="text-cyan-400">{r.assignedTechnicianName}</span></span>}
                  {r.eta && <span>ETA: <span className="text-slate-400">{new Date(r.eta).toLocaleTimeString()}</span></span>}
                </div>
              </div>
              {r.status === "Pending" && (
                <button onClick={() => assign(r._id)} disabled={assigning === r._id}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-sm hover:bg-indigo-500/25 transition disabled:opacity-50">
                  {assigning === r._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Smart Assign
                </button>
              )}
              {r.status === "Completed" && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">New Service Request</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Title", key: "title", placeholder: "e.g. Transformer inspection" },
                  { label: "Customer Name", key: "customerName", placeholder: "e.g. Northwind Logistics" },
                  { label: "Location", key: "location", placeholder: "e.g. Warehouse 7, Zone Alpha" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
                    <input value={(form as Record<string, string>)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600" />
                  </div>
                ))}
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the issue..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                      {["Low", "Medium", "High", "Critical"].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Category</label>
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                      {["General", "Electrical", "HVAC", "Networking", "Plumbing"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5">Cancel</button>
                <button onClick={create} disabled={creating || !form.title || !form.customerName}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Request"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
