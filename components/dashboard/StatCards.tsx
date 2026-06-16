"use client";

import { motion } from "framer-motion";
import { ClipboardList, Users, ListChecks, Gauge } from "lucide-react";
import CountUp from "@/components/CountUp";

export interface DashboardStats {
  serviceRequests: number;
  activeTechnicians: number;
  taskOverview: number;
  dispatchReadiness: number;
}

interface StatCardsProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

const statConfig = [
  {
    key: "serviceRequests" as const,
    label: "Service Requests",
    suffix: "",
    decimals: 0,
    description: "Pending and active workloads",
    icon: ClipboardList,
    accent: "text-cyan",
    ring: "ring-cyan/30 bg-cyan/10",
  },
  {
    key: "activeTechnicians" as const,
    label: "Active Technicians",
    suffix: "",
    decimals: 0,
    description: "Field staff currently online",
    icon: Users,
    accent: "text-emerald",
    ring: "ring-emerald/30 bg-emerald/10",
  },
  {
    key: "taskOverview" as const,
    label: "Task Overview",
    suffix: "",
    decimals: 0,
    description: "Tasks in execution across zones",
    icon: ListChecks,
    accent: "text-amber",
    ring: "ring-amber/30 bg-amber/10",
  },
  {
    key: "dispatchReadiness" as const,
    label: "Dispatch Readiness",
    suffix: "%",
    decimals: 0,
    description: "Service windows met",
    icon: Gauge,
    accent: "text-indigo",
    ring: "ring-indigo/30 bg-indigo/10",
  },
];

function StatCardSkeleton() {
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        <div className="h-9 w-9 animate-pulse rounded-xl bg-white/10" />
      </div>
      <div className="mt-4 h-10 w-20 animate-pulse rounded bg-white/10" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-white/5" />
    </div>
  );
}

export default function StatCards({ stats, loading }: StatCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statConfig.map((stat, i) => {
        const Icon = stat.icon;
        const value = stats[stat.key];
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
              <CountUp value={value} decimals={stat.decimals} suffix={stat.suffix} />
            </p>
            <p className="mt-1 text-sm text-zinc-500">{stat.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
