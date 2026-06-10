"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";

const pills = [
  {
    label: "Faster Response",
    pct: 40,
    description: "Accelerated dispatch routing",
    bar: "bg-cyan",
    glow: "shadow-glow-cyan",
  },
  {
    label: "Lower Costs",
    pct: 30,
    description: "Automated resource allocation",
    bar: "bg-indigo",
    glow: "shadow-glow-indigo",
  },
  {
    label: "Higher Productivity",
    pct: 25,
    description: "Streamlined task execution",
    bar: "bg-emerald",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.25)]",
  },
];

export default function GoalBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="glass relative overflow-hidden p-6"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan/10 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan ring-1 ring-cyan/30">
          <Target className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-cyan/80">Current primary goal</p>
          <h3 className="text-lg font-bold text-white">Optimize end-to-end field coverage</h3>
        </div>
      </div>

      <div className="relative mt-6 grid gap-5 md:grid-cols-3">
        {pills.map((pill, i) => (
          <div key={pill.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-white">{pill.label}</p>
              <p className="text-lg font-bold text-white">{pill.pct}%</p>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{pill.description}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pill.pct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 + i * 0.15 }}
                className={`h-full rounded-full ${pill.bar} ${pill.glow}`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
