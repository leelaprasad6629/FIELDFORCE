"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";

const seedAlerts = [
  "System optimized route for Task #105 via AI Router",
  "Sarah Chen geo-fenced check-in verified at Client Zone Delta",
  "High-priority technician alert triggered for standalone zone review",
];

const incoming = [
  "AI Router rebalanced workload across 3 active zones",
  "Marcus Vance returned from break and is now available",
  "Dispatch readiness recalculated: service windows on track",
  "New service request REQ-1212 received from Client Zone Beta",
  "Alex Rivera arrival confidence updated to 97%",
  "Predictive engine flagged weather delay risk on Route 7",
];

function timeStamp() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface Alert {
  id: number;
  time: string;
  text: string;
}

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>(() =>
    seedAlerts.map((text, i) => ({ id: i, time: ["11:42 AM", "11:38 AM", "11:30 AM"][i], text }))
  );

  useEffect(() => {
    let counter = seedAlerts.length;
    const interval = setInterval(() => {
      const text = incoming[counter % incoming.length];
      counter += 1;
      setAlerts((prev) => [{ id: counter, time: timeStamp(), text }, ...prev].slice(0, 6));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      className="glass flex flex-col p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Live Alert Feed</h3>
        <span className="flex items-center gap-1.5 text-xs font-medium text-cyan">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          streaming
        </span>
      </div>

      <div className="mt-5 flex-1 space-y-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: -16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm"
            >
              <span className="mr-2 font-mono text-xs text-cyan/80">[{alert.time}]</span>
              <span className="text-zinc-300">{alert.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
