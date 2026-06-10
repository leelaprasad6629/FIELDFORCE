"use client";

import { motion } from "framer-motion";
import { MapPin, Layers } from "lucide-react";
import PageHero from "@/components/PageHero";

const markers = [
  { name: "Alex Rivera", status: "On Route", color: "amber", x: "24%", y: "32%" },
  { name: "Sarah Chen", status: "On Site", color: "emerald", x: "62%", y: "48%" },
  { name: "Marcus Vance", status: "Idle", color: "zinc", x: "44%", y: "72%" },
];

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

export default function MapPage() {
  return (
    <div>
      <PageHero
        title="Live field coverage map"
        subtitle="Real-time technician positions, geo-fenced customer zones, and active routing across the entire service region."
      />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Map */}
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

            {/* Floating coverage panel */}
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-cyan/40 bg-background/70 px-3 py-2 backdrop-blur-md">
              <Layers className="h-4 w-4 text-cyan" />
              <span className="text-sm font-medium text-white">Live Coverage Zones:</span>
              <span className="text-sm font-bold text-cyan">7 active</span>
            </div>

            {/* Markers */}
            {markers.map((m, i) => {
              const c = colorMap[m.color];
              return (
                <motion.div
                  key={m.name}
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
                      <p className={`text-[10px] font-medium ${c.text}`}>{m.status}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Side panels */}
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
              {markers.map((m) => {
                const c = colorMap[m.color];
                return (
                  <div
                    key={m.name}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                      <span className="text-sm font-medium text-white">{m.name}</span>
                    </div>
                    <span className={`text-xs font-semibold ${c.text}`}>{m.status}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
