"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Coffee } from "lucide-react";

export interface TechnicianData {
  _id: string;
  name: string;
  status: "on-route" | "on-site" | "idle" | "break";
  currentTask?: string | null;
  location: string;
  lat?: number;
  lng?: number;
}

interface TechnicianFlowProps {
  technicians: TechnicianData[];
  loading?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusDisplay(status: TechnicianData["status"]) {
  switch (status) {
    case "on-route":
      return {
        label: "On Route",
        badge: "bg-amber/15 text-amber ring-amber/30",
        icon: ArrowUpRight,
        detail: (task: string | null | undefined) => task ?? "En route to assignment",
      };
    case "on-site":
      return {
        label: "On Site",
        badge: "bg-emerald/15 text-emerald ring-emerald/30",
        icon: MapPin,
        detail: (task: string | null | undefined) => task ?? "On site",
      };
    case "break":
      return {
        label: "Break",
        badge: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
        icon: Coffee,
        detail: () => "Break",
      };
    default:
      return {
        label: "Idle",
        badge: "bg-emerald/15 text-emerald ring-emerald/30",
        icon: MapPin,
        detail: (task: string | null | undefined, location: string) =>
          task ?? `Available at ${location}`,
      };
  }
}

function TechnicianSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/10" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
      </div>
      <div className="h-7 w-24 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}

export default function TechnicianFlow({ technicians, loading }: TechnicianFlowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
      className="glass p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Active Technician Flow</h3>
        <span className="flex items-center gap-1.5 rounded-full bg-rose/10 px-2.5 py-1 text-xs font-semibold text-rose ring-1 ring-rose/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
          </span>
          LIVE
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <TechnicianSkeleton key={i} />)
        ) : technicians.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-500">
            No technicians are active right now.
          </p>
        ) : (
          technicians.map((tech, i) => {
            const display = getStatusDisplay(tech.status);
            const Icon = display.icon;
            return (
              <motion.div
                key={tech._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan/30 to-indigo/30 text-sm font-bold text-white ring-1 ring-white/15">
                  {getInitials(tech.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{tech.name}</p>
                  <p className="truncate text-sm text-zinc-500">
                    {display.detail(tech.currentTask, tech.location)}
                  </p>
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${display.badge}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {display.label}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
