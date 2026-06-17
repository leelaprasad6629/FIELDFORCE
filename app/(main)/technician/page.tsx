"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Clock, CheckCircle2, Route, Timer, ListChecks, Check } from "lucide-react";
import PageHero from "@/components/PageHero";
import CountUp from "@/components/CountUp";

interface TaskItem {
  _id: string;
  id: string;
  taskId: string;
  title: string;
  location: string;
  eta: string | null;
  priority: string;
  checklist: { label: string; done: boolean }[];
}

const priorityStyles: Record<string, string> = {
  critical: "bg-rose/15 text-rose ring-rose/30",
  high: "bg-amber/15 text-amber ring-amber/30",
  medium: "bg-cyan/15 text-cyan ring-cyan/30",
  low: "bg-emerald/15 text-emerald ring-emerald/30",
  Critical: "bg-rose/15 text-rose ring-rose/30",
  High: "bg-amber/15 text-amber ring-amber/30",
  Medium: "bg-cyan/15 text-cyan ring-cyan/30",
  Low: "bg-emerald/15 text-emerald ring-emerald/30",
};

function formatEta(eta: string | null) {
  if (!eta) return "TBD";
  return new Date(eta).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPriority(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export default function TechnicianPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [avgResponseMinutes, setAvgResponseMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const [tasksRes, analyticsRes] = await Promise.all([
        fetch("/api/tasks?mine=true"),
        fetch("/api/analytics"),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(
          data.map((task: TaskItem) => ({
            ...task,
            id: task.taskId,
          }))
        );
      }

      if (analyticsRes.ok) {
        const analytics = await analyticsRes.json();
        setCompletedToday(analytics.dailyThroughput ?? 0);
        setAvgResponseMinutes(analytics.avgResponseMinutes);
      }
    } catch (error) {
      console.error("Failed to fetch technician tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const activeTask = tasks[0] ?? null;
  const checklist = activeTask?.checklist ?? [];

  const completeTask = async (taskId: string) => {
    const task = tasks.find((item) => item._id === taskId);
    if (!task) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((item) => item._id !== taskId));
        setCompletedToday((count) => count + 1);
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const toggleChecklist = async (index: number) => {
    if (!activeTask) return;
    const nextChecklist = checklist.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );

    setTasks((prev) =>
      prev.map((task) => (task._id === activeTask._id ? { ...task, checklist: nextChecklist } : task))
    );

    try {
      await fetch(`/api/tasks/${activeTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: nextChecklist }),
      });
    } catch (error) {
      console.error("Failed to update checklist:", error);
    }
  };

  const doneCount = checklist.filter((item) => item.done).length;
  const distanceEstimate = useMemo(() => Math.max(8, tasks.length * 12.4), [tasks.length]);

  return (
    <div>
      <PageHero
        title="Personal task execution cockpit"
        subtitle="Your assigned tasks, route progress, and active job checklist are ready for the next dispatch window."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
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
            {loading ? (
              <p className="text-sm text-zinc-500">Loading assigned tasks...</p>
            ) : (
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-zinc-500">{task.taskId}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${priorityStyles[task.priority] ?? priorityStyles.medium}`}
                      >
                        {formatPriority(task.priority)}
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
                        ETA {formatEta(task.eta)}
                      </span>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => completeTask(task._id)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Complete
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {!loading && tasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
                All assigned tasks complete. Standing by for next dispatch.
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-6">
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
                  <span className="text-sm text-zinc-400">Tasks completed this week</span>
                </div>
                <CountUp value={completedToday} className="text-xl font-bold text-white" duration={0.6} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/10 text-cyan ring-1 ring-cyan/30">
                    <Route className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-zinc-400">Distance covered</span>
                </div>
                <p className="text-xl font-bold text-white">
                  <CountUp value={distanceEstimate} decimals={1} suffix=" km" />
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
                  {avgResponseMinutes === null ? (
                    <span className="text-sm text-zinc-500">Not enough data yet</span>
                  ) : (
                    <CountUp value={avgResponseMinutes} suffix=" min" />
                  )}
                </p>
              </div>
            </div>
          </motion.div>

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
                {doneCount}/{checklist.length || 0}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {!activeTask ? (
                <p className="text-sm text-zinc-500">No active task checklist.</p>
              ) : (
                checklist.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => toggleChecklist(index)}
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
                    <span
                      className={`text-sm transition-colors ${item.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
