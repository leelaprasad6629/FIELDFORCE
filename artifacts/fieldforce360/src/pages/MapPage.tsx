import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Map, RefreshCw, Users, Navigation } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface Technician { _id: string; name: string; status: string; location: string; lat: number; lng: number; currentTask: string | null; }

const statusColors: Record<string, { dot: string; badge: string }> = {
  "on-route": { dot: "bg-amber-400", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  "on-site": { dot: "bg-emerald-400", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "idle": { dot: "bg-slate-400", badge: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  "break": { dot: "bg-indigo-400", badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
};

function MapDot({ tech, minLat, maxLat, minLng, maxLng }: { tech: Technician; minLat: number; maxLat: number; minLng: number; maxLng: number; }) {
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const x = ((tech.lng - minLng) / lngRange) * 100;
  const y = (1 - (tech.lat - minLat) / latRange) * 100;
  const colors = statusColors[tech.status] ?? statusColors.idle;

  return (
    <div className="absolute" style={{ left: `${Math.max(2, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(90, y))}%`, transform: "translate(-50%, -50%)" }}>
      {tech.status === "on-route" && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: "rgba(245,158,11,0.4)" }} />
      )}
      <div className={`relative w-4 h-4 rounded-full border-2 border-white/60 ${colors.dot} shadow-lg`} title={tech.name} />
    </div>
  );
}

export default function MapPage() {
  const { fetchApi } = useApi();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selected, setSelected] = useState<Technician | null>(null);

  const load = useCallback(async () => {
    try { setTechnicians(await fetchApi<Technician[]>("/technicians")); } catch { /* noop */ }
  }, [fetchApi]);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const lats = technicians.map((t) => t.lat);
  const lngs = technicians.map((t) => t.lng);
  const minLat = Math.min(...lats, 40.70); const maxLat = Math.max(...lats, 40.75);
  const minLng = Math.min(...lngs, -74.03); const maxLng = Math.max(...lngs, -73.98);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Map className="w-5 h-5 text-cyan-400" /> Live Fleet Map</h1>
          <p className="text-slate-400 text-sm mt-1">Technician positions update every 15 seconds</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/5 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-0 overflow-hidden relative" style={{ minHeight: "420px" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(6,182,212,0.3) 0px,transparent 1px,transparent 60px), repeating-linear-gradient(90deg,rgba(6,182,212,0.3) 0px,transparent 1px,transparent 60px)" }} />

          <div className="absolute top-4 left-4 text-cyan-400/40 text-xs font-mono">ZONE ALPHA</div>
          <div className="absolute top-1/3 right-8 text-indigo-400/40 text-xs font-mono">ZONE DELTA</div>
          <div className="absolute bottom-10 left-1/3 text-amber-400/40 text-xs font-mono">DEPOT HQ</div>

          {technicians.map((t) => (
            <MapDot key={t._id} tech={t} minLat={minLat} maxLat={maxLat} minLng={minLng} maxLng={maxLng} />
          ))}

          {technicians.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-slate-500 text-sm">No technicians found — add technicians on the Dashboard.</p>
            </div>
          )}

          <div className="absolute bottom-4 right-4 glass p-3 text-xs space-y-1.5">
            {Object.entries(statusColors).map(([status, { dot }]) => (
              <div key={status} className="flex items-center gap-2 text-slate-400">
                <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                {status.replace("-", " ")}
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> Field Crew</h2>
          <div className="space-y-2">
            {technicians.map((t) => {
              const colors = statusColors[t.status] ?? statusColors.idle;
              return (
                <motion.button key={t._id} onClick={() => setSelected(selected?._id === t._id ? null : t)}
                  className={cn("w-full text-left px-3 py-3 rounded-xl border transition-all", selected?._id === t._id ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/8 bg-white/4 hover:bg-white/7")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{t.name}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", colors.badge)}>
                      {t.status.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs truncate">{t.currentTask ?? t.location}</p>
                  {selected?._id === t._id && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5"><Navigation className="w-3 h-3" />{t.lat.toFixed(4)}, {t.lng.toFixed(4)}</div>
                      <div><span className="text-slate-500">Location: </span>{t.location}</div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
