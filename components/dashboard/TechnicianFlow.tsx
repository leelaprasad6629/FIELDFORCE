"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Coffee } from "lucide-react";

const technicians = [
  {
    name: "Alex Rivera",
    detail: "Task #104",
    status: "On Route",
    badge: "bg-amber/15 text-amber ring-amber/30",
    icon: ArrowUpRight,
    initials: "AR",
  },
  {
    name: "Sarah Chen",
    detail: "Geo-fenced Check-In Approved",
    status: "On Site",
    badge: "bg-emerald/15 text-emerald ring-emerald/30",
    icon: MapPin,
    initials: "SC",
  },
  {
    name: "Marcus Vance",
    detail: "Break",
    status: "Idle",
    badge: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
    icon: Coffee,
    initials: "MV",
  },
];

export default function TechnicianFlow() {
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
        {technicians.map((tech, i) => {
          const Icon = tech.icon;
          return (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan/30 to-indigo/30 text-sm font-bold text-white ring-1 ring-white/15">
                {tech.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{tech.name}</p>
                <p className="truncate text-sm text-zinc-500">{tech.detail}</p>
              </div>
              <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tech.badge}`}>
                <Icon className="h-3.5 w-3.5" />
                {tech.status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
