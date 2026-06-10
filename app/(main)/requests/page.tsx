"use client";

import { useMemo, useState } from "react";
import AssignmentModal from "@/components/AssignmentModal";

const initialRequests = [
  {
    id: "REQ-1024",
    title: "Transformer inspection",
    description: "Customer reports intermittent power loss at warehouse.",
    priority: "High",
    status: "Pending",
    assignedTechnicianId: "",
  },
  {
    id: "REQ-1138",
    title: "HVAC calibration",
    description: "Commercial center needs cooling system recalibration.",
    priority: "Critical",
    status: "Pending",
    assignedTechnicianId: "",
  },
  {
    id: "REQ-1185",
    title: "Solar panel cleanup",
    description: "Scheduled preventive maintenance on rooftop arrays.",
    priority: "Medium",
    status: "Pending",
    assignedTechnicianId: "",
  },
  {
    id: "REQ-1203",
    title: "Client zone security audit",
    description: "Verify perimeter access and complete security checklist.",
    priority: "High",
    status: "Pending",
    assignedTechnicianId: "",
  },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState(initialRequests);

  const handleAssign = (id: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? { ...request, status: "Assigned", assignedTechnicianId: "Alex Rivera" }
          : request
      )
    );
  };

  const requestSections = useMemo(
    () => requests.sort((a, b) => (a.priority === "Critical" ? -1 : b.priority === "Critical" ? 1 : 0)),
    [requests]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Service request center</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Manage customer demand and AI-assisted dispatch</h2>
        <p className="mt-2 text-sm text-slate-300">Review workflow, priorities, and let smart assignment accelerate technician matching.</p>
      </section>

      <section className="grid gap-4">
        {requestSections.map((request, i) => (
            <div key={request.id} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center soft-pop transition-shadow hover:shadow-md" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-violet-300">{request.id}</p>
                <span className={`rounded-2xl px-3 py-1 text-xs uppercase tracking-[0.28em] ${
                  request.priority === "Critical"
                    ? "bg-rose-500/15 text-rose-200"
                    : request.priority === "High"
                    ? "bg-violet-500/10 text-violet-200"
                    : "bg-slate-700 text-slate-200"
                }`}>
                  {request.priority}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white">{request.title}</h3>
              <p className="text-sm text-slate-300">{request.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="rounded-2xl bg-slate-900/80 px-3 py-2">Status: {request.status}</span>
                <span className="rounded-2xl bg-slate-900/80 px-3 py-2">Assigned: {request.assignedTechnicianId || "Unassigned"}</span>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <AssignmentModal request={request} onAssign={handleAssign} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
