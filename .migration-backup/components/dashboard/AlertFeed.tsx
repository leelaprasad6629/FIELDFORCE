"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";

export interface AlertData {
  _id: string;
  message: string;
  timestamp: string;
  type: "info" | "warning" | "critical";
}

interface AlertFeedProps {
  alerts: AlertData[];
  loading?: boolean;
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function AlertSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="h-4 w-full animate-pulse rounded bg-white/10" />
    </div>
  );
}

export default function AlertFeed({ alerts, loading }: AlertFeedProps) {
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
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <AlertSkeleton key={i} />)
        ) : alerts.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-500">
            No alerts to display yet.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {alerts.map((alert) => (
              <motion.div
                key={alert._id}
                layout
                initial={{ opacity: 0, y: -16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm"
              >
                <span className="mr-2 font-mono text-xs text-cyan/80">
                  [{formatTime(alert.timestamp)}]
                </span>
                <span
                  className={
                    alert.type === "critical"
                      ? "text-rose"
                      : alert.type === "warning"
                        ? "text-amber"
                        : "text-zinc-300"
                  }
                >
                  {alert.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
