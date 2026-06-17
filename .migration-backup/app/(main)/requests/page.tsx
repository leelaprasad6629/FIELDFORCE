"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AssignmentModal from "@/components/AssignmentModal";
import PageHero from "@/components/PageHero";

type Priority = "Critical" | "High" | "Medium" | "Low";

interface ServiceRequest {
  id: string;
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  status: string;
  assignedTechnicianId: string | null;
  assignedTechnicianName: string | null;
  geofenceLocation?: { lat: number; lng: number; radiusKm?: number };
}

const tabs: ("All" | Priority)[] = ["All", "Critical", "High", "Medium", "Low"];

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-rose/15 text-rose ring-rose/30",
  High: "bg-amber/15 text-amber ring-amber/30",
  Medium: "bg-cyan/15 text-cyan ring-cyan/30",
  Low: "bg-emerald/15 text-emerald ring-emerald/30",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(
          data.map((item: ServiceRequest) => ({
            ...item,
            assignedTechnicianId: item.assignedTechnicianId ?? null,
            assignedTechnicianName: item.assignedTechnicianName ?? null,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAssign = (id: string, technicianName: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "Assigned",
              assignedTechnicianId: technicianName,
              assignedTechnicianName: technicianName,
            }
          : request
      )
    );
    loadRequests();
  };

  const filtered = useMemo(
    () => (activeTab === "All" ? requests : requests.filter((r) => r.priority === activeTab)),
    [requests, activeTab]
  );

  return (
    <div>
      <PageHero
        title="Manage customer demand and AI-assisted dispatch"
        subtitle="Review workflow, priorities, and let smart assignment accelerate technician matching."
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="relative rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {activeTab === tab && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-cyan/15 ring-1 ring-cyan/30"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 ${activeTab === tab ? "text-cyan" : "text-zinc-400 hover:text-white"}`}
            >
              {tab}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass p-8 text-center text-sm text-zinc-500">Loading service requests...</div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((request, i) => (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.1 }}
                className="glass glass-hover flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-white/5 px-2.5 py-1 font-mono text-xs text-zinc-400">
                      {request.id}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${priorityStyles[request.priority]}`}
                    >
                      {request.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{request.title}</h3>
                  <p className="text-sm text-zinc-400">{request.description}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="rounded-md bg-white/5 px-2.5 py-1 text-zinc-400">
                      Status: <span className="text-zinc-200">{request.status}</span>
                    </span>
                    <span className="rounded-md bg-white/5 px-2.5 py-1 text-zinc-400">
                      {request.assignedTechnicianName || "Unassigned"}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <AssignmentModal request={request} onAssign={handleAssign} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && filtered.length === 0 && (
            <div className="glass p-8 text-center text-sm text-zinc-500">No service requests yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
