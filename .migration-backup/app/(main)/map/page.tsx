"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Layers } from "lucide-react";
import PageHero from "@/components/PageHero";
import type { TechnicianData } from "@/components/dashboard/TechnicianFlow";

const POLL_INTERVAL_MS = 20000;

const colorMap: Record<string, { dot: string; ring: string; text: string; pin: string }> = {
  amber: { dot: "bg-amber", ring: "bg-amber/40", text: "text-amber", pin: "text-amber" },
  emerald: { dot: "bg-emerald", ring: "bg-emerald/40", text: "text-emerald", pin: "text-emerald" },
  zinc: { dot: "bg-zinc-400", ring: "bg-zinc-400/40", text: "text-zinc-300", pin: "text-zinc-300" },
};

const legend = [
  { label: "On Route", color: "bg-amber" },
  { label: "On Site", color: "bg-emerald" },
  { label: "Idle", color: "bg-zinc-400" },
];

function statusLabel(status: TechnicianData["status"]) {
  switch (status) {
    case "on-route":
      return { label: "On Route", color: "amber" };
    case "on-site":
      return { label: "On Site", color: "emerald" };
    default:
      return { label: "Idle", color: "zinc" };
  }
}

function projectMarkers(technicians: TechnicianData[]) {
  if (technicians.length === 0) return [];

  const lats = technicians.map((tech) => tech.lat ?? 40.7128);
  const lngs = technicians.map((tech) => tech.lng ?? -74.006);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 0.01;
  const lngSpan = maxLng - minLng || 0.01;

  return technicians.map((tech) => {
    const lat = tech.lat ?? 40.7128;
    const lng = tech.lng ?? -74.006;
    const display = statusLabel(tech.status);
    return {
      ...tech,
      x: `${10 + ((lng - minLng) / lngSpan) * 80}%`,
      y: `${10 + ((maxLat - lat) / latSpan) * 80}%`,
      statusLabel: display.label,
      color: display.color,
    };
  });
}

export default function MapPage() {
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTechnicians = useCallback(async (initial = false) => {
    try {
      const res = await fetch("/api/technicians");
      if (res.ok) setTechnicians(await res.json());
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTechnicians(true);
    const interval = window.setInterval(() => loadTechnicians(false), POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [loadTechnicians]);

  const markers = useMemo(() => projectMarkers(technicians), [technicians]);
  const activeCount = technicians.filter((tech) => tech.status === "on-route" || tech.status === "on-site").length;

  return (
    <div>
      <PageHero
        title="Live field coverage map"
        subtitle="Real-time technician positions, geo-fenced customer zones, and active routing across the entire service region."
      />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="glass relative overflow-hidden p-2"
        >
          <div
            className="relative h-[480px] overflow-hidden rounded-xl border border-white/10 bg-[#070A11]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(6,182,212,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.07) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.14),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.12),transparent_40%)]" />

            <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-cyan/40 bg-background/70 px-3 py-2 backdrop-blur-md">
              <Layers className="h-4 w-4 text-cyan" />
              <span className="text-sm font-medium text-white">Live Coverage Zones:</span>
              <span className="text-sm font-bold text-cyan">{activeCount} active</span>
            </div>

            {!loading &&
              markers.map((m, i) => {
                const c = colorMap[m.color];
                return (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.15, ease: "backOut" }}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: m.x, top: m.y }}
                  >
                    <div className="relative flex flex-col items-center">
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <span className={`absolute inline-flex h-4 w-4 animate-pulse-ring rounded-full ${c.ring}`} />
                        <span className={`relative inline-flex h-3 w-3 rounded-full ${c.dot} ring-2 ring-white/30`} />
                      </span>
                      <MapPin className={`mt-1 h-5 w-5 ${c.pin} drop-shadow`} />
                      <div className="mt-1 whitespace-nowrap rounded-md border border-white/10 bg-background/80 px-2 py-1 text-center backdrop-blur-sm">
                        <p className="text-xs font-semibold text-white">{m.name}</p>
                        <p className={`text-[10px] font-medium ${c.text}`}>{m.statusLabel}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="glass p-6"
          >
            <h3 className="text-lg font-bold text-white">Status Legend</h3>
            <div className="mt-4 space-y-3">
              {legend.map((l) => (
                <div key={l.label} className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${l.color}`} />
                  <span className="text-sm text-zinc-300">{l.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            className="glass p-6"
          >
            <h3 className="text-lg font-bold text-white">Active Units</h3>
            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="text-sm text-zinc-500">Loading technicians...</p>
              ) : markers.length === 0 ? (
                <p className="text-sm text-zinc-500">No technicians to display.</p>
              ) : (
                markers.map((m) => {
                  const c = colorMap[m.color];
                  return (
                    <div
                      key={m._id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                        <span className="text-sm font-medium text-white">{m.name}</span>
                      </div>
                      <span className={`text-xs font-semibold ${c.text}`}>{m.statusLabel}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
