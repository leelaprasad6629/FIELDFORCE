import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Clock, Zap, RefreshCw, DollarSign, Loader2, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface AnalyticsData {
  hasEnoughData: boolean; predictedCsat: number | null; predictiveAccuracy: number | null;
  routingUplift: number | null; avgResponseMinutes: number | null; firstTimeFixRate: number | null;
  fleetUtilization: number | null; dailyThroughput: number; velocity: Array<{ day: string; tasks: number }>;
  delays: Array<{ day: string; delay: number | null }>;
  expenses?: { pendingCount: number; pendingAmount: number; approvedCount: number; approvedAmount: number; totalCount: number };
}

const tooltipStyle = { backgroundColor: "#0E1521", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" };

export default function Analytics() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setData(await fetchApi<AnalyticsData>("/analytics"));
      setLastUpdated(new Date());
    } catch { /* noop */ }
    finally { setRefreshing(false); setInitialLoad(false); }
  }, [fetchApi]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const velocity = data?.velocity ?? [];
  const delays = (data?.delays ?? []).filter((d) => d.delay !== null);
  const hasTaskHistory = velocity.some((v) => v.tasks > 0);

  const kpis = [
    { label: "Predicted CSAT", value: data?.predictedCsat !== null && data?.predictedCsat !== undefined ? `${data.predictedCsat}%` : "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "1st-Time Fix Rate", value: data?.firstTimeFixRate !== null && data?.firstTimeFixRate !== undefined ? `${data.firstTimeFixRate}%` : "—", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Avg Response", value: data?.avgResponseMinutes !== null && data?.avgResponseMinutes !== undefined ? `${data.avgResponseMinutes}m` : "—", icon: Clock, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Fleet Utilization", value: data?.fleetUtilization !== null && data?.fleetUtilization !== undefined ? `${data.fleetUtilization}%` : "—", icon: BarChart2, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-cyan-400" /> Predictive Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered field operations insights · auto-refreshes every 60s{lastUpdated ? ` · updated ${lastUpdated.toLocaleTimeString()}` : ""}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/5 transition">
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} /> Refresh
        </button>
      </div>

      {initialLoad ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
      ) : (
      <>
      {!data?.hasEnoughData && (
        <div className="glass border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-slate-300 text-sm rounded-xl flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          Collecting live operational data — complete tasks and service requests to generate AI-predicted performance trends.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass glass-hover p-5 group">
            <div className="shimmer-overlay" />
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Task Velocity (7 days)</h2>
            {!hasTaskHistory && <span className="text-xs text-slate-500">0 completed</span>}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={velocity} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(6,182,212,0.06)" }} />
              <Bar dataKey="tasks" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4">Avg Delay (hours)</h2>
          {delays.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={delays} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="delay" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", strokeWidth: 0, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-500 text-sm">
              <Clock className="w-8 h-8 text-slate-600 mb-2" />
              <p>No completion delay data yet</p>
              <p className="text-xs text-slate-600 mt-1">Delays are calculated when scheduled tasks are closed</p>
            </div>
          )}
        </div>
      </div>

      {data?.expenses && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass p-4">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-amber-400" /><span className="text-slate-400 text-sm">Pending Expenses</span></div>
            <p className="text-2xl font-bold text-white">${data.expenses.pendingAmount.toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-1">{data.expenses.pendingCount} expense(s)</p>
          </div>
          <div className="glass p-4">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-emerald-400" /><span className="text-slate-400 text-sm">Approved Expenses</span></div>
            <p className="text-2xl font-bold text-white">${data.expenses.approvedAmount.toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-1">{data.expenses.approvedCount} expense(s)</p>
          </div>
          <div className="glass p-4">
            <div className="flex items-center gap-2 mb-2"><BarChart2 className="w-4 h-4 text-cyan-400" /><span className="text-slate-400 text-sm">Daily Throughput</span></div>
            <p className="text-2xl font-bold text-white">{data.dailyThroughput}</p>
            <p className="text-slate-500 text-xs mt-1">tasks this week</p>
          </div>
          <div className="glass p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-indigo-400" /><span className="text-slate-400 text-sm">Routing Uplift</span></div>
            <p className="text-2xl font-bold text-white">{data.routingUplift !== null ? `${data.routingUplift > 0 ? "+" : ""}${data.routingUplift}%` : "—"}</p>
            <p className="text-slate-500 text-xs mt-1">week over week</p>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
