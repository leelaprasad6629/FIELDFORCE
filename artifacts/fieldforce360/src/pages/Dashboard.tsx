import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, ClipboardList, Activity, Zap, Bell, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface Stats { serviceRequests: number; activeTechnicians: number; taskOverview: number; dispatchReadiness: number; }
interface Alert { _id: string; message: string; timestamp: string; type: "info" | "warning" | "critical"; }
interface Technician { _id: string; name: string; status: string; currentTask: string | null; location: string; }

const statusColors: Record<string, string> = {
  "on-route": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "on-site": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "idle": "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "break": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const alertIcon = { info: Info, warning: AlertTriangle, critical: AlertTriangle };
const alertColor = { info: "text-cyan-400", warning: "text-amber-400", critical: "text-rose-400" };

export default function Dashboard() {
  const { fetchApi } = useApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, a, t] = await Promise.all([
        fetchApi<Stats>("/stats"),
        fetchApi<Alert[]>("/alerts"),
        fetchApi<Technician[]>("/technicians"),
      ]);
      setStats(s); setAlerts(a); setTechnicians(t);
    } catch { /* will show empty state */ }
  }, [fetchApi]);

  useEffect(() => { load(); }, [load]);

  async function seed() {
    setSeeding(true); setSeedMsg(null);
    try {
      const r = await fetchApi<{ message: string }>("/seed", { method: "POST" });
      setSeedMsg(r.message);
      await load();
    } catch (e: unknown) {
      setSeedMsg(e instanceof Error ? e.message : "Seed failed");
    } finally { setSeeding(false); }
  }

  const statCards = [
    { label: "Open Requests", value: stats?.serviceRequests, icon: ClipboardList, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Active Technicians", value: stats?.activeTechnicians, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Tasks In Progress", value: stats?.taskOverview, icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Dispatch Readiness", value: stats ? `${stats.dispatchReadiness}%` : undefined, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Operations Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time overview of field operations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/5 transition">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={seed} disabled={seeding} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/25 transition disabled:opacity-50">
            {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Seed Demo Data
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="glass border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400 text-sm rounded-xl">{seedMsg}</div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass glass-hover p-5 group">
            <div className="shimmer-overlay" />
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{value ?? "—"}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician status */}
        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> Field Crew</h2>
          {technicians.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No technicians yet — seed demo data above.</p>
          ) : (
            <div className="space-y-3">
              {technicians.map((t) => (
                <div key={t._id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/4 border border-white/6">
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{t.currentTask ?? t.location}</p>
                  </div>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full border capitalize", statusColors[t.status] ?? statusColors.idle)}>
                    {t.status.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts feed */}
        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-indigo-400" /> Alert Feed</h2>
          {alerts.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No alerts yet.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => {
                const Icon = alertIcon[a.type] ?? Info;
                return (
                  <div key={a._id} className="flex gap-3 py-2.5 px-3 rounded-xl bg-white/4 border border-white/6">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alertColor[a.type]}`} />
                    <div>
                      <p className="text-slate-300 text-sm leading-snug">{a.message}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{new Date(a.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
