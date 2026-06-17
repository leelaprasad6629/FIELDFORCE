import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Clock, Zap, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { useApi } from "../lib/api";

interface AnalyticsData {
  hasEnoughData: boolean; predictedCsat: number | null; predictiveAccuracy: number | null;
  routingUplift: number | null; avgResponseMinutes: number | null; firstTimeFixRate: number | null;
  fleetUtilization: number | null; dailyThroughput: number; velocity: Array<{ day: string; tasks: number }>;
  delays: Array<{ day: string; delay: number | null }>;
}

const MOCK_VELOCITY = [
  { day: "Mon", tasks: 5 }, { day: "Tue", tasks: 8 }, { day: "Wed", tasks: 6 },
  { day: "Thu", tasks: 11 }, { day: "Fri", tasks: 9 }, { day: "Sat", tasks: 3 }, { day: "Sun", tasks: 2 },
];

const MOCK_DELAYS = [
  { day: "Mon", delay: 0.5 }, { day: "Tue", delay: 1.2 }, { day: "Wed", delay: 0.3 },
  { day: "Thu", delay: 2.1 }, { day: "Fri", delay: 0.8 }, { day: "Sat", delay: 0.0 }, { day: "Sun", delay: null },
];

const tooltipStyle = { backgroundColor: "#0E1521", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" };

export default function Analytics() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<AnalyticsData | null>(null);

  async function load() {
    try { setData(await fetchApi<AnalyticsData>("/analytics")); } catch { /* noop */ }
  }

  useEffect(() => { load(); }, []);

  const velocity = (data?.hasEnoughData && data.velocity.length > 0) ? data.velocity : MOCK_VELOCITY;
  const delays = (data?.hasEnoughData && data.delays.length > 0) ? data.delays : MOCK_DELAYS;
  const isMock = !data?.hasEnoughData;

  const kpis = [
    { label: "Predicted CSAT", value: data?.predictedCsat ? `${data.predictedCsat}%` : isMock ? "87%" : "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "1st-Time Fix Rate", value: data?.firstTimeFixRate ? `${data.firstTimeFixRate}%` : isMock ? "74%" : "—", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Avg Response", value: data?.avgResponseMinutes ? `${data.avgResponseMinutes}m` : isMock ? "38m" : "—", icon: Clock, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Routing Uplift", value: data?.routingUplift ? `+${data.routingUplift}%` : isMock ? "+12%" : "—", icon: BarChart2, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-cyan-400" /> Predictive Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered field operations insights</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/5 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {isMock && (
        <div className="glass border-amber-500/30 bg-amber-500/8 px-4 py-3 text-amber-400/80 text-sm rounded-xl">
          Showing sample data — complete tasks to see real metrics.
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
          <h2 className="text-white font-semibold mb-4">Task Velocity (7 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={velocity} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
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
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={delays.filter((d) => d.delay !== null)} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="delay" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", strokeWidth: 0, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
