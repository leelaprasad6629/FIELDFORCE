"use client";

import { motion } from "framer-motion";
import { ClipboardList, Users, ListChecks, Gauge } from "lucide-react";
import CountUp from "@/components/CountUp";

const stats = [
  {
    label: "Service Requests",
    value: 142,
    suffix: "",
    decimals: 0,
    description: "Pending and active workloads",
    icon: ClipboardList,
    accent: "text-cyan",
    ring: "ring-cyan/30 bg-cyan/10",
  },
  {
    label: "Active Technicians",
    value: 18,
    suffix: "",
    decimals: 0,
    description: "Field staff currently online",
    icon: Users,
    accent: "text-emerald",
    ring: "ring-emerald/30 bg-emerald/10",
  },
  {
    label: "Task Overview",
    value: 72,
    suffix: "",
    decimals: 0,
    description: "Tasks in execution across zones",
    icon: ListChecks,
    accent: "text-amber",
    ring: "ring-amber/30 bg-amber/10",
  },
  {
    label: "Dispatch Readiness",
    value: 96,
    suffix: "%",
    decimals: 0,
    description: "Service windows met",
    icon: Gauge,
    accent: "text-indigo",
    ring: "ring-indigo/30 bg-indigo/10",
  },
];

export default function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.08 }}
            className="glass glass-hover group relative overflow-hidden p-5"
          >
            <div className="shimmer-overlay" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${stat.ring} ${stat.accent}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-white">
              <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
            </p>
            <p className="mt-1 text-sm text-zinc-500">{stat.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
