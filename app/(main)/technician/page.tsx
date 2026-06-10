"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Clock, CheckCircle2, Route, Timer, ListChecks, Check } from "lucide-react";
import PageHero from "@/components/PageHero";
import CountUp from "@/components/CountUp";

type Priority = "Critical" | "High" | "Medium";

interface Task {
  id: string;
  title: string;
  location: string;
  eta: string;
  priority: Priority;
}

const initialTasks: Task[] = [
  { id: "Task #104", title: "HVAC Calibration", location: "Client Zone Delta", eta: "11:50 AM", priority: "Critical" },
  { id: "Task #109", title: "Transformer Inspection", location: "Warehouse 7", eta: "01:15 PM", priority: "High" },
  { id: "Task #115", title: "Solar Panel Cleanup", location: "Rooftop Array B", eta: "03:40 PM", priority: "Medium" },
];

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-rose/15 text-rose ring-rose/30",
  High: "bg-amber/15 text-amber ring-amber/30",
  Medium: "bg-cyan/15 text-cyan ring-cyan/30",
};

const initialChecklist = [
  "Inspect site entry and verify geofence",
  "Confirm customer identity via photo verification",
  "Run cooling system diagnostics",
  "Recalibrate thermostat controls",
  "Complete signature verification and close job",
];

export default function TechnicianPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [completedCount, setCompletedCount] = useState(0);
  const [checklist, setChecklist] = useState(
    initialChecklist.map((label, i) => ({ label, done: i === 0 }))
  );

  const completeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setCompletedCount((c) => c + 1);
  };

  const toggle = (index: number) => {
    setChecklist((prev) => prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item)));
  };

  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div>
      <PageHero
        title="Personal task execution cockpit"
        subtitle="Your assigned tasks, route progress, and active job checklist are ready for the next dispatch window."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Task queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="glass p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Task Queue</h3>
            <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-xs font-semibold text-cyan ring-1 ring-cyan/30">
              {tasks.length} assigned
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-500">{task.id}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="mt-2 font-semibold text-white">{task.title}</h4>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-cyan" />
                      {task.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-cyan" />
                      ETA {task.eta}
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => completeTask(task.id)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Complete
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            {tasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
                All assigned tasks complete. Standing by for next dispatch.
              </div>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Performance summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="glass p-6"
          >
            <h3 className="text-lg font-bold text-white">Performance Summary</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/10 text-emerald ring-1 ring-emerald/30">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-zinc-400">Tasks completed today</span>
                </div>
                <CountUp value={5 + completedCount} className="text-xl font-bold text-white" duration={0.6} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/10 text-cyan ring-1 ring-cyan/30">
                    <Route className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-zinc-400">Distance covered</span>
                </div>
                <p className="text-xl font-bold text-white">
                  <CountUp value={42.6} decimals={1} suffix=" km" />
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo/10 text-indigo ring-1 ring-indigo/30">
                    <Timer className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-zinc-400">Avg. response time</span>
                </div>
                <p className="text-xl font-bold text-white">
                  <CountUp value={22} suffix=" min" />
                </p>
              </div>
            </div>
          </motion.div>

          {/* Active checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            className="glass p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <ListChecks className="h-5 w-5 text-cyan" />
                Active Task Checklist
              </h3>
              <span className="text-xs font-semibold text-zinc-400">
                {doneCount}/{checklist.length}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {checklist.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-cyan/30"
                >
                  <motion.span
                    initial={false}
                    animate={{
                      backgroundColor: item.done ? "#10B981" : "rgba(255,255,255,0)",
                      borderColor: item.done ? "#10B981" : "rgba(255,255,255,0.2)",
                    }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border"
                  >
                    <AnimatePresence>
                      {item.done && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check className="h-4 w-4 text-white" strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>
                  <span className={`text-sm transition-colors ${item.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
